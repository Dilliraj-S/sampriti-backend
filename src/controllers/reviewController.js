const { Review, Product } = require('../models');

exports.list = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ status: true, data: reviews });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ status: false, message: 'Review not found' });
    await review.update({ status: req.body.status });
    res.json({ status: true, data: review });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ status: false, message: 'Review not found' });
    await review.destroy();
    res.json({ status: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const total = await Review.count();
    const approved = await Review.count({ where: { status: 'approved' } });
    const pending = await Review.count({ where: { status: 'pending' } });
    res.json({ status: true, data: { total, approved, pending } });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
