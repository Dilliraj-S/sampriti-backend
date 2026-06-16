const { Product, Category } = require('../models');
const slugify = require('../utils/slugify');

const VALID_HOMEPAGE_SECTIONS = new Set([
  'home', 'influence', 'infusions', 'skincare', 'fragrance', 'ceremony', 'atmosphere',
]);

/**
 * Normalizes the homepageSection field.
 * Sets to null if the value is not in the valid set.
 * @param {object} data
 * @returns {object}
 */
const normalizeHomepageSection = (data) => {
  if (!Object.prototype.hasOwnProperty.call(data, 'homepageSection')) return data;
  if (!VALID_HOMEPAGE_SECTIONS.has(data.homepageSection)) data.homepageSection = null;
  return data;
};

/**
 * Get all products with their category.
 * @returns {Promise<Product[]>}
 */
const getAllProducts = async () => {
  return Product.findAll({
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
    order: [['createdAt', 'ASC']],
  });
};

/**
 * Get the most recently created product.
 * @returns {Promise<Product|null>}
 */
const getLatestProduct = async () => {
  return Product.findOne({
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Get a single product by primary key.
 * @param {number} id
 * @returns {Promise<Product>}
 */
const getProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [{ model: Category, as: 'category' }],
  });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

/**
 * Get a single product by its slug.
 * @param {string} slug
 * @returns {Promise<Product>}
 */
const getProductBySlug = async (slug) => {
  const product = await Product.findOne({
    where: { slug },
    include: [{ model: Category, as: 'category' }],
  });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

/**
 * Create a new product.
 * Auto-generates slug from name if not provided.
 * @param {object} data
 * @returns {Promise<Product>}
 */
const createProduct = async (data) => {
  const slug = data.slug || slugify(data.name);
  return Product.create(normalizeHomepageSection({ ...data, slug }));
};

/**
 * Update an existing product by ID.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Product>}
 */
const updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  const normalized = normalizeHomepageSection({ ...data });
  if (normalized.name && !normalized.slug) {
    normalized.slug = slugify(normalized.name);
  }
  await product.update(normalized);
  return product;
};

/**
 * Delete a product by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  await product.destroy();
};

module.exports = {
  getAllProducts,
  getLatestProduct,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
