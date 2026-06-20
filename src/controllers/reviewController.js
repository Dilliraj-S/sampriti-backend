const reviewService = require('../services/reviewService');

exports.list = async (req, res) => {
  try {
    const data = await reviewService.getReviews();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const data = await reviewService.updateReviewStatus(req.params.id, req.body.status);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await reviewService.deleteReview(req.params.id);
    res.json({ status: true, message: 'Review deleted' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const data = await reviewService.getReviewStats();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await reviewService.createReview(req.body);
    res.status(201).json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.productReviews = async (req, res) => {
  try {
    const data = await reviewService.getProductReviews(req.params.slug);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
