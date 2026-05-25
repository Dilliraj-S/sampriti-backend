const { Order, Customer } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};
    if (status) where.status = status;
    const orders = await Order.findAll({
      where, include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    let data = orders.map(o => o.toJSON());
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(o => o.id?.toString() === q || o.customer?.name?.toLowerCase().includes(q));
    }
    res.json({ status: true, data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ status: false, message: 'Order not found' });
    await order.update({ status: req.body.status });
    res.json({ status: true, data: order });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const all = await Order.findAll();
    const total = all.length;
    const pending = all.filter(o => o.status === 'pending').length;
    const processing = all.filter(o => o.status === 'processing').length;
    const delivered = all.filter(o => o.status === 'delivered').length;
    const cancelled = all.filter(o => o.status === 'cancelled').length;
    const totalRevenue = all.reduce((s, o) => s + parseFloat(o.total || 0), 0);
    res.json({ status: true, data: { total, pending, processing, delivered, cancelled, totalRevenue } });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
