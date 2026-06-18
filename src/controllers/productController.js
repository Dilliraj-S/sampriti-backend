const productService = require('../services/productService');

exports.list = async (req, res) => {
  try {
    const data = await productService.getAllProducts();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.latest = async (req, res) => {
  try {
    const data = await productService.getLatestProduct();
    if (!data) return res.json({ status: true, data: null });
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const data = await productService.getProductById(req.params.id);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const data = await productService.getProductBySlug(req.params.slug);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ status: true, data: [] });
    const data = await productService.searchProducts(q);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await productService.createProduct(req.body);
    res.status(201).json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await productService.updateProduct(req.params.id, req.body);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ status: true, message: 'Product deleted' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
