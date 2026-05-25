const { Category, Product } = require('../models');

exports.list = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products', attributes: ['id'], required: false }],
      order: [['createdAt', 'DESC']],
    });
    const data = categories.map(c => ({ ...c.toJSON(), productCount: c.products?.length || 0, products: undefined }));
    res.json({ status: true, data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ ...req.body, slug });
    res.status(201).json({ status: true, data: category });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ status: false, message: 'Category not found' });
    await category.update(req.body);
    res.json({ status: true, data: category });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ status: false, message: 'Category not found' });
    await category.destroy();
    res.json({ status: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
