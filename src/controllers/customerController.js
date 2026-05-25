const { Customer, Order } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const customers = await Customer.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ status: true, data: customers });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ status: true, data: customer });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ status: false, message: 'Customer not found' });
    await customer.update(req.body);
    res.json({ status: true, data: customer });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ status: false, message: 'Customer not found' });
    await customer.destroy();
    res.json({ status: true, message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const total = await Customer.count();
    const active = await Customer.count({ where: { status: 'active' } });
    const totalSpent = await Customer.sum('totalSpent') || 0;
    res.json({ status: true, data: { total, active, totalSpent } });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
