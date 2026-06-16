const { Product, Category } = require('../models');

/**
 * Get all inventory items (derived from products).
 * Computes SKU, stock status, and reorder point from product data.
 * @returns {Promise<object[]>}
 */
const getInventory = async () => {
  const products = await Product.findAll({
    include: [{ model: Category, as: 'category', attributes: ['name'] }],
    order: [['stock', 'ASC']],
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: `SKU-${p.id.toString().padStart(4, '0')}`,
    category: p.category?.name || 'Uncategorized',
    stock: p.stock,
    reorderPoint: 20,
    status: p.stock <= 0 ? 'out_of_stock' : p.stock <= 20 ? 'low_stock' : 'in_stock',
  }));
};

/**
 * Update the stock quantity of a product.
 * @param {number} id
 * @param {number} stock
 * @returns {Promise<Product>}
 */
const updateStock = async (id, stock) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  await product.update({ stock });
  return product;
};

module.exports = { getInventory, updateStock };
