const { Category, Product } = require('../models');
const slugify = require('../utils/slugify');

/**
 * Get all categories with a computed productCount.
 * @returns {Promise<object[]>}
 */
const getCategories = async () => {
  const categories = await Category.findAll({
    include: [{ model: Product, as: 'products', attributes: ['id'], required: false }],
    order: [['createdAt', 'DESC']],
  });
  return categories.map((c) => ({
    ...c.toJSON(),
    productCount: c.products?.length || 0,
    products: undefined,
  }));
};

/**
 * Create a new category. Auto-generates slug from name if not provided.
 * @param {object} data
 * @returns {Promise<Category>}
 */
const createCategory = async (data) => {
  const slug = data.slug || slugify(data.name);
  return Category.create({ ...data, slug });
};

/**
 * Update an existing category by ID.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Category>}
 */
const updateCategory = async (id, data) => {
  const category = await Category.findByPk(id);
  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }
  await category.update(data);
  return category;
};

/**
 * Delete a category by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }
  await category.destroy();
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
