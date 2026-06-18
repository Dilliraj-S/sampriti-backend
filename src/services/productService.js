const { Product, Category, Section } = require('../models');
const slugify = require('../utils/slugify');

const includeSections = () => ({
  model: Section,
  as: 'sections',
  attributes: ['name'],
  through: { attributes: [] },
});

const toJSON = (product) => {
  const json = product.toJSON();
  json.sections = (json.sections || []).map(s => s.name);
  return json;
};

const getAllProducts = async () => {
  const products = await Product.findAll({
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      includeSections(),
    ],
    order: [['createdAt', 'ASC']],
  });
  return products.map(toJSON);
};

const getLatestProduct = async () => {
  const product = await Product.findOne({
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      includeSections(),
    ],
    order: [['createdAt', 'DESC']],
  });
  return product ? toJSON(product) : null;
};

const getProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      { model: Category, as: 'category' },
      includeSections(),
    ],
  });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return toJSON(product);
};

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({
    where: { slug },
    include: [
      { model: Category, as: 'category' },
      includeSections(),
    ],
  });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return toJSON(product);
};

const createProduct = async (data) => {
  const slug = data.slug || slugify(data.name);
  const { sections: sectionNames, ...productData } = data;
  const product = await Product.create({ ...productData, slug });
  if (sectionNames && Array.isArray(sectionNames)) {
    const sectionRows = await Section.findAll({ where: { name: sectionNames } });
    await product.setSections(sectionRows);
  }
  return getProductById(product.id);
};

const updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  const { sections: sectionNames, ...productData } = data;
  if (productData.name && !productData.slug) {
    productData.slug = slugify(productData.name);
  }
  await product.update(productData);
  if (sectionNames && Array.isArray(sectionNames)) {
    const sectionRows = await Section.findAll({ where: { name: sectionNames } });
    await product.setSections(sectionRows);
  }
  return getProductById(product.id);
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

/**
 * Search products by keyword across name, description, ingredients, etc.
 * @param {string} query
 * @returns {Promise<Product[]>}
 */
const searchProducts = async (query) => {
  const { Op } = require('sequelize');
  const q = `%${query}%`;
  const products = await Product.findAll({
    where: {
      status: 'active',
      [Op.or]: [
        { name:             { [Op.like]: q } },
        { subtitle:         { [Op.like]: q } },
        { description:      { [Op.like]: q } },
        { keyIngredients:   { [Op.like]: q } },
        { aroma:            { [Op.like]: q } },
        { benefits:         { [Op.like]: q } },
        { essence:          { [Op.like]: q } },
        { howToUse:         { [Op.like]: q } },
        { format:           { [Op.like]: q } },
      ],
    },
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      includeSections(),
    ],
    limit: 20,
    order: [['name', 'ASC']],
  });
  return products.map(toJSON);
};

module.exports = {
  getAllProducts,
  getLatestProduct,
  getProductById,
  getProductBySlug,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
