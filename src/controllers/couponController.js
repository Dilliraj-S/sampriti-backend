const { Coupon } = require('../models');

exports.list = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ status: true, data: coupons });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, code: req.body.code?.toUpperCase() });
    res.status(201).json({ status: true, data: coupon });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ status: false, message: 'Coupon not found' });
    await coupon.update(req.body);
    res.json({ status: true, data: coupon });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ status: false, message: 'Coupon not found' });
    await coupon.destroy();
    res.json({ status: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
