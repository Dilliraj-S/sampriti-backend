const orderService = require('../services/orderService');

exports.list = async (req, res) => {
  try {
    const data = await orderService.getOrders(req.query);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const data = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const data = await orderService.getOrderStats();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
