const { Coupon } = require('../models');

/**
 * Get all coupons ordered by newest first.
 * @returns {Promise<Coupon[]>}
 */
const getCoupons = async () => {
  return Coupon.findAll({ order: [['createdAt', 'DESC']] });
};

/**
 * Create a new coupon. Forces the coupon code to uppercase.
 * @param {object} data
 * @returns {Promise<Coupon>}
 */
const createCoupon = async (data) => {
  return Coupon.create({ ...data, code: data.code?.toUpperCase() });
};

/**
 * Update an existing coupon by ID.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Coupon>}
 */
const updateCoupon = async (id, data) => {
  const coupon = await Coupon.findByPk(id);
  if (!coupon) {
    const err = new Error('Coupon not found');
    err.statusCode = 404;
    throw err;
  }
  await coupon.update(data);
  return coupon;
};

/**
 * Delete a coupon by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
const deleteCoupon = async (id) => {
  const coupon = await Coupon.findByPk(id);
  if (!coupon) {
    const err = new Error('Coupon not found');
    err.statusCode = 404;
    throw err;
  }
  await coupon.destroy();
};

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon };
