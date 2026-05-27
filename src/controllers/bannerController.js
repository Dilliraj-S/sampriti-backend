const { Banner } = require('../models');

exports.list = async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ status: true, data: banners });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ status: true, data: banner });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ status: false, message: 'Banner not found' });
    await banner.update(req.body);
    res.json({ status: true, data: banner });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ status: false, message: 'Banner not found' });
    await banner.destroy();
    res.json({ status: true, message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ status: false, message: 'Banner not found' });
    await banner.update({ status: banner.status === 'active' ? 'inactive' : 'active' });
    res.json({ status: true, data: banner });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
