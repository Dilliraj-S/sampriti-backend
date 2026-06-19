const customerOrderService = require('../services/customerOrderService');
const paypalService = require('../services/paypalService');
const { getIO } = require('../websocket');

exports.createOrder = async (req, res) => {
  try {
    const { customerInfo, shippingAddress, items, total, paymentMethod, shipping } = req.body;

    if (!customerInfo?.fullName || !items?.length || total == null) {
      return res.status(400).json({ status: false, message: 'Missing required fields' });
    }

    const order = await customerOrderService.createCustomerOrder({
      customerInfo, shippingAddress, items, total, paymentMethod: paymentMethod || 'paypal', shipping: shipping || 0,
    });

    return res.status(201).json({
      status: true,
      data: { orderId: order.id, total: order.total, currency: 'USD' },
    });
  } catch (err) {
    console.error('[payment] createOrder error:', err.message);
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.createPaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ status: false, message: 'orderId is required' });

    const { Order } = require('../models');
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ status: false, message: 'Order not found' });

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || 'unknown';
    const paypalOrder = await customerOrderService.createPaypalPayment(order, clientIp);

    return res.json({
      status: true,
      data: { paypalOrderId: paypalOrder.id, orderId: order.id },
    });
  } catch (err) {
    console.error('[payment] createPaypalOrder error:', err.message);
    if (err.statusCode) console.error('[payment] Status code:', err.statusCode);
    if (err.details) console.error('[payment] Details:', JSON.stringify(err.details));
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.captureOrder = async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body;

    if (!orderId || !paypalOrderId) {
      return res.status(400).json({ status: false, message: 'orderId and paypalOrderId are required' });
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || 'unknown';
    const result = await customerOrderService.capturePaypalPayment(orderId, paypalOrderId, clientIp);

    const io = getIO();
    if (io) {
      io.emit('new_payment', {
        orderId: result.order.id,
        customerName: result.order.customerInfo?.fullName || 'Unknown',
        total: result.order.total,
        currency: 'USD',
        time: new Date().toISOString(),
      });
    }

    return res.json({
      status: true,
      data: {
        orderId: result.order.id,
        status: result.order.status,
        paymentStatus: result.order.paymentStatus,
        transactionId: result.transaction.id,
        captureId: result.transaction.paypalCaptureId,
      },
    });
  } catch (err) {
    console.error('[payment] captureOrder error:', err.message);
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.getTransactionStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const transaction = await customerOrderService.getTransactionByOrderId(orderId);
    if (!transaction) {
      return res.status(404).json({ status: false, message: 'Transaction not found' });
    }
    return res.json({ status: true, data: transaction });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.webhook = async (req, res) => {
  try {
    const verified = await paypalService.verifyWebhookSignature(req.headers, req.body);
    if (!verified) {
      console.warn('[paypal-webhook] Signature verification failed');
      return res.status(200).json({ status: 'ok' });
    }

    const eventType = req.body.event_type;
    const resource = req.body.resource;

    console.log(`[paypal-webhook] Received: ${eventType}`);

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
        if (paypalOrderId) {
          const txn = await customerOrderService.getTransactionByPaypalOrderId(paypalOrderId);
          if (txn && txn.status !== 'completed') {
            txn.status = 'completed';
            txn.paypalCaptureId = resource.id;
            await txn.save();
            await Order.update({ paymentStatus: 'success', status: 'processing' }, { where: { id: txn.orderId } });
          }
        }
        break;
      }
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        const deniedOrderId = resource.supplementary_data?.related_ids?.order_id;
        if (deniedOrderId) {
          const txn = await customerOrderService.getTransactionByPaypalOrderId(deniedOrderId);
          if (txn) {
            txn.status = 'failed';
            txn.failureReason = resource.status_details?.reason || 'Payment denied by PayPal';
            const webhookEvents = txn.webhookEvents || [];
            webhookEvents.push({ eventType, time: req.body.create_time, reason: txn.failureReason });
            txn.webhookEvents = webhookEvents;
            await txn.save();
            await Order.update({ paymentStatus: 'failed' }, { where: { id: txn.orderId } });
          }
        }
        break;
      }
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const refundOrderId = resource.supplementary_data?.related_ids?.order_id;
        if (refundOrderId) {
          const txn = await customerOrderService.getTransactionByPaypalOrderId(refundOrderId);
          if (txn) {
            txn.status = 'refunded';
            const webhookEvents = txn.webhookEvents || [];
            webhookEvents.push({ eventType, time: req.body.create_time, amount: resource.amount?.value });
            txn.webhookEvents = webhookEvents;
            await txn.save();
            await Order.update({ paymentStatus: 'refunded' }, { where: { id: txn.orderId } });
          }
        }
        break;
      }
      case 'CHECKOUT.ORDER.APPROVED': {
        const approvedOrderId = resource.id;
        if (approvedOrderId) {
          const txn = await customerOrderService.getTransactionByPaypalOrderId(approvedOrderId);
          if (txn && txn.status === 'created') {
            txn.status = 'approved';
            await txn.save();
          }
        }
        break;
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[paypal-webhook] Error:', err.message);
    return res.status(200).json({ status: 'ok' });
  }
};

exports.listTransactions = async (req, res) => {
  try {
    const data = await customerOrderService.getPaymentTransactions(req.query);
    res.json({ status: true, data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
