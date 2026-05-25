const { Product, Category } = require('../models');

exports.list = async (req, res) => {
  try {
    const products = await Product.findAll({ include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }], order: [['createdAt', 'ASC']] });
    res.json({ status: true, data: products });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.latest = async (req, res) => {
  try {
    const product = await Product.findOne({ include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }], order: [['createdAt', 'DESC']] });
    if (!product) return res.json({ status: true, data: null });
    res.json({ status: true, data: product });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: [{ model: Category, as: 'category' }] });
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, data: product });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await Product.create({ ...req.body, slug });
    res.status(201).json({ status: true, data: product });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    const data = { ...req.body };
    if (data.name && !data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await product.update(data);
    res.json({ status: true, data: product });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    await product.destroy();
    res.json({ status: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
