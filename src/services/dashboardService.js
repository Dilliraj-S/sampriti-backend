const { Product, Order, Customer } = require('../models');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Aggregates all dashboard data: KPIs, charts, and recent orders.
 * @returns {Promise<object>}
 */
const getDashboardData = async () => {
  // KPI counters
  const totalRevenue = (await Order.sum('total')) || 0;
  const totalOrders = await Order.count();
  const totalCustomers = await Customer.count();
  const totalProducts = await Product.count({ where: { status: 'active' } });

  // Revenue over time — fill all 12 months, even if empty
  const allOrders = await Order.findAll({ order: [['createdAt', 'ASC']] });
  const monthMap = {};
  allOrders.forEach((o) => {
    if (o.createdAt) {
      const m = new Date(o.createdAt).toLocaleString('en-US', { month: 'short' });
      monthMap[m] = (monthMap[m] || 0) + parseFloat(o.total || 0);
    }
  });
  const revenueOverTime = MONTHS.map((m) => ({ label: m, value: monthMap[m] || 0 }));

  // Products per category distribution
  const products = await Product.findAll({ attributes: ['categoryId'], group: ['categoryId'] });
  const catCount = {};
  products.forEach((p) => {
    const cat = p.categoryId || 0;
    catCount[cat] = (catCount[cat] || 0) + 1;
  });
  const ordersByCategory = Object.entries(catCount).map(([k, v]) => ({
    label: `Category ${k}`,
    value: v,
  }));

  // 5 most recent orders
  const recentOrderRows = await Order.findAll({
    include: [{ model: Customer, as: 'customer', attributes: ['name'] }],
    order: [['createdAt', 'DESC']],
    limit: 5,
  });
  const recentOrders = recentOrderRows.map((o) => ({
    id: o.id,
    customer: o.customer?.name || 'Guest',
    total: parseFloat(o.total || 0),
    status: o.status,
    date: o.createdAt?.toISOString().split('T')[0],
  }));

  return {
    kpi: { revenue: totalRevenue, orders: totalOrders, customers: totalCustomers, products: totalProducts },
    charts: { revenueOverTime, ordersByCategory },
    lists: { recentOrders },
  };
};

module.exports = { getDashboardData };
