const { Product, Order, Customer, Category } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.dashboard = async (req, res) => {
  try {
    const totalRevenue = await Order.sum('total') || 0;
    const totalOrders = await Order.count();
    const totalCustomers = await Customer.count();
    const totalProducts = await Product.count({ where: { status: 'active' } });

    const orders = await Order.findAll({ order: [['createdAt', 'ASC']] });
    const revenueOverTime = [];
    const monthMap = {};
    orders.forEach(o => {
      if (o.createdAt) {
        const m = new Date(o.createdAt).toLocaleString('en-US', { month: 'short' });
        monthMap[m] = (monthMap[m] || 0) + parseFloat(o.total || 0);
      }
    });
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    months.forEach(m => revenueOverTime.push({ label: m, value: monthMap[m] || 0 }));

    const products = await Product.findAll({ attributes: ['categoryId'], group: ['categoryId'] });
    const ordersByCategory = [];
    const catCount = {};
    products.forEach(p => {
      const cat = p.categoryId || 0;
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    Object.entries(catCount).forEach(([k, v]) => ordersByCategory.push({ label: `Category ${k}`, value: v }));

    const recentOrders = await Order.findAll({
      include: [{ model: Customer, as: 'customer', attributes: ['name'] }],
      order: [['createdAt', 'DESC']], limit: 5,
    });
    const list = recentOrders.map(o => ({
      id: o.id, customer: o.customer?.name || 'Guest',
      total: parseFloat(o.total || 0),
      status: o.status, date: o.createdAt?.toISOString().split('T')[0],
    }));

    res.json({ status: true, data: {
      kpi: { revenue: totalRevenue, orders: totalOrders, customers: totalCustomers, products: totalProducts },
      charts: { revenueOverTime, ordersByCategory },
      lists: { recentOrders: list },
    }});
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
