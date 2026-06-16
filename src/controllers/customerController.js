const customerService = require('../services/customerService');

exports.list = async (req, res) => {
  try {
    const data = await customerService.getCustomers(req.query);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await customerService.createCustomer(req.body);
    res.status(201).json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await customerService.updateCustomer(req.params.id, req.body);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    res.json({ status: true, message: 'Customer deleted' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const data = await customerService.getCustomerStats();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
