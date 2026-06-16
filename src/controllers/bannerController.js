const bannerService = require('../services/bannerService');

exports.list = async (req, res) => {
  try {
    const data = await bannerService.getBanners();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await bannerService.createBanner(req.body);
    res.status(201).json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await bannerService.updateBanner(req.params.id, req.body);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await bannerService.deleteBanner(req.params.id);
    res.json({ status: true, message: 'Banner deleted' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const data = await bannerService.toggleBannerStatus(req.params.id);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
