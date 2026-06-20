const { Order, Customer } = require('../models');
const { sendOrderStatusEmail } = require('../utils/mailer');

/**
 * Get all orders with optional status filter and search.
 * Search is applied in-memory against order ID and customer name.
 * @param {{ search?: string, status?: string }} query
 * @returns {Promise<object[]>}
 */
const getOrders = async ({ search, status } = {}) => {
  const where = {};
  if (status) where.status = status;

  const orders = await Order.findAll({
    where,
    include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']],
  });

  let data = orders.map((o) => o.toJSON());

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (o) => o.id?.toString() === q || o.customer?.name?.toLowerCase().includes(q)
    );
  }

  return data;
};

/**
 * Update the status of a specific order.
 * @param {number} id
 * @param {string} status
 * @returns {Promise<Order>}
 */
const updateOrderStatus = async (id, status) => {
  const order = await Order.findByPk(id);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  const oldStatus = order.status;
  await order.update({ status });

  try {
    const customerEmail = order.customerInfo?.email;
    const customerName = order.customerInfo?.fullName || order.customerInfo?.name || 'Customer';
    console.log('[orderService] Attempting to send status email - order:', id, 'oldStatus:', oldStatus, 'newStatus:', status, 'to:', customerEmail);
    if (customerEmail) {
      await sendOrderStatusEmail(customerEmail, customerName, status, order.id, order.shippingAddress);
      console.log('[orderService] Status email sent successfully for order', id);
    } else {
      console.warn('[orderService] No customer email found on order', id, '- skipping notification');
    }
  } catch (emailErr) {
    console.error('[orderService] Failed to send status email for order', id, ':', emailErr.message);
  }

  return order;
};

/**
 * Get aggregate order statistics.
 * @returns {Promise<object>}
 */
const getOrderStats = async () => {
  const all = await Order.findAll();
  const total = all.length;
  const pending = all.filter((o) => o.status === 'pending').length;
  const processing = all.filter((o) => o.status === 'processing').length;
  const delivered = all.filter((o) => o.status === 'delivered').length;
  const cancelled = all.filter((o) => o.status === 'cancelled').length;
  const totalRevenue = all.reduce((s, o) => s + parseFloat(o.total || 0), 0);

  return { total, pending, processing, delivered, cancelled, totalRevenue };
};

module.exports = { getOrders, updateOrderStatus, getOrderStats };
