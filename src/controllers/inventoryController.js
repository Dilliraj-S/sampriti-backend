const { Product, Category } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      order: [['stock', 'ASC']],
    });
    const data = products.map(p => ({
      id: p.id, name: p.name, sku: `SKU-${p.id.toString().padStart(4, '0')}`,
      category: p.category?.name || 'Uncategorized', stock: p.stock,
      reorderPoint: 20, status: p.stock <= 0 ? 'out_of_stock' : p.stock <= 20 ? 'low_stock' : 'in_stock',
    }));
    res.json({ status: true, data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    await product.update({ stock: req.body.stock });
    res.json({ status: true, data: product });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
