const shippingService = require('../services/shippingService');

exports.list = async (req, res) => {
  try {
    const data = await shippingService.getShippingZones();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await shippingService.createShippingZone(req.body);
    res.status(201).json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await shippingService.updateShippingZone(req.params.id, req.body);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await shippingService.deleteShippingZone(req.params.id);
    res.json({ status: true, message: 'Shipping zone deleted' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
