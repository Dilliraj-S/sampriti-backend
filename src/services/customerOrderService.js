const { Order, Customer, PaymentTransaction, Product } = require('../models');
const { createOrder: paypalCreateOrder } = require('./paypalService');

async function createCustomerOrder({ customerInfo, shippingAddress, items, total, paymentMethod, shipping }) {
  let customerId = null;

  if (customerInfo.email) {
    const [customer] = await Customer.findOrCreate({
      where: { email: customerInfo.email },
      defaults: {
        name: customerInfo.fullName,
        phone: customerInfo.phone || '',
        status: 'active',
      },
    });
    customerId = customer.id;
    await customer.increment('ordersCount', { by: 1 });
    await customer.increment('totalSpent', { by: total });
  }

  const order = await Order.create({
    customerId,
    items,
    total,
    shipping,
    status: 'pending',
    paymentMethod: paymentMethod || 'paypal',
    paymentStatus: 'pending',
    customerInfo,
    shippingAddress,
  });

  return order;
}

async function createPaypalPayment(order, clientIp) {
  const paypalOrder = await paypalCreateOrder(order.total, 'USD', order.id, order.items, order.customerInfo, order.shippingAddress);

  await PaymentTransaction.create({
    orderId: order.id,
    paypalOrderId: paypalOrder.id,
    amount: order.total,
    currency: 'USD',
    status: 'created',
    paymentMethod: 'paypal',
    ipAddress: clientIp,
  });

  return paypalOrder;
}

async function capturePaypalPayment(orderId, paypalOrderId, clientIp) {
  const { captureOrder: paypalCaptureOrder, getOrder: paypalGetOrder } = require('./paypalService');
  const { sequelize } = require('../models');

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, { transaction });
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    if (order.paymentStatus === 'success') {
      const err = new Error('Payment already captured');
      err.statusCode = 400;
      throw err;
    }

    const paypalOrder = await paypalGetOrder(paypalOrderId);
    const purchaseUnit = paypalOrder.purchase_units[0];
    const orderAmount = parseFloat(purchaseUnit.amount.value);
    const orderTotal = parseFloat(order.total);

    if (Math.abs(orderAmount - orderTotal) > 0.01) {
      const err = new Error('Amount mismatch — possible tampering detected');
      err.statusCode = 400;
      throw err;
    }

    if (purchaseUnit.reference_id !== String(orderId)) {
      const err = new Error('Order reference mismatch — possible hijacking detected');
      err.statusCode = 400;
      throw err;
    }

    const result = await paypalCaptureOrder(paypalOrderId);
    if (!result.purchase_units?.[0]?.payments?.captures?.[0]) {
      const err = new Error('Payment capture failed — no capture returned from PayPal');
      err.statusCode = 400;
      throw err;
    }
    const capture = result.purchase_units[0].payments.captures[0];

    const [txn] = await PaymentTransaction.findOrCreate({
      where: { paypalOrderId },
      defaults: {
        orderId,
        paypalOrderId,
        paypalCaptureId: capture.id,
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
        status: 'completed',
        payerEmail: result.payer?.email_address || null,
        payerId: result.payer?.payer_id || null,
        paymentMethod: 'paypal',
        ipAddress: clientIp,
      },
      transaction,
    });

    if (txn.status !== 'completed') {
      txn.paypalCaptureId = capture.id;
      txn.payerEmail = result.payer?.email_address || txn.payerEmail;
      txn.payerId = result.payer?.payer_id || txn.payerId;
      txn.status = 'completed';
      await txn.save({ transaction });
    }

    order.paymentStatus = 'success';
    order.status = 'processing';
    await order.save({ transaction });

    await transaction.commit();

    if (order.customerId) {
      await Customer.increment('totalSpent', {
        by: parseFloat(order.total),
        where: { id: order.customerId },
      });
    }

    return { order: order.toJSON(), transaction: txn.toJSON() };
  } catch (err) {
    await transaction.rollback();

    await PaymentTransaction.update(
      { status: 'failed', failureReason: err.message },
      { where: { paypalOrderId } }
    );

    await Order.update(
      { paymentStatus: 'failed' },
      { where: { id: orderId } }
    );

    throw err;
  }
}

async function getTransactionByOrderId(orderId) {
  return PaymentTransaction.findOne({ where: { orderId }, order: [['createdAt', 'DESC']] });
}

async function getTransactionByPaypalOrderId(paypalOrderId) {
  return PaymentTransaction.findOne({ where: { paypalOrderId } });
}

async function getPaymentTransactions(query = {}) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.orderId) where.orderId = query.orderId;
  return PaymentTransaction.findAll({
    where,
    include: [{ model: Order, as: 'order', attributes: ['id', 'total', 'status', 'paymentStatus'] }],
    order: [['createdAt', 'DESC']],
  });
}

module.exports = {
  createCustomerOrder,
  createPaypalPayment,
  capturePaypalPayment,
  getTransactionByOrderId,
  getTransactionByPaypalOrderId,
  getPaymentTransactions,
};
