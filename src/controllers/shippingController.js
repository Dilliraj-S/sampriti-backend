const { ShippingZone } = require('../models');

exports.list = async (req, res) => {
  try {
    const zones = await ShippingZone.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ status: true, data: zones });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const zone = await ShippingZone.create(req.body);
    res.status(201).json({ status: true, data: zone });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const zone = await ShippingZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ status: false, message: 'Shipping zone not found' });
    await zone.update(req.body);
    res.json({ status: true, data: zone });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const zone = await ShippingZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ status: false, message: 'Shipping zone not found' });
    await zone.destroy();
    res.json({ status: true, message: 'Shipping zone deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
