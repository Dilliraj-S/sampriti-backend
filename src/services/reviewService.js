const { Review, Product } = require('../models');

/**
 * Get all reviews with associated product name and ID.
 * @returns {Promise<Review[]>}
 */
const getReviews = async () => {
  return Review.findAll({
    include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Update the status of a review.
 * @param {number} id
 * @param {string} status
 * @returns {Promise<Review>}
 */
const updateReviewStatus = async (id, status) => {
  const review = await Review.findByPk(id);
  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    throw err;
  }
  await review.update({ status });
  return review;
};

/**
 * Delete a review by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
const deleteReview = async (id) => {
  const review = await Review.findByPk(id);
  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    throw err;
  }
  await review.destroy();
};

/**
 * Get aggregate review statistics.
 * @returns {Promise<object>}
 */
const getReviewStats = async () => {
  const total = await Review.count();
  const approved = await Review.count({ where: { status: 'approved' } });
  const pending = await Review.count({ where: { status: 'pending' } });
  return { total, approved, pending };
};

const createReview = async ({ productId, productSlug, name, email, rating, title, comment }) => {
  return Review.create({ productId, productSlug, name, email, rating, title, comment, status: 'pending' });
};

const getProductReviews = async (slug) => {
  return Review.findAll({
    where: { productSlug: slug, status: 'approved' },
    order: [['createdAt', 'DESC']],
  });
};

module.exports = { getReviews, updateReviewStatus, deleteReview, getReviewStats, createReview, getProductReviews };
