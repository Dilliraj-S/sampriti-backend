const { Banner } = require('../models');

/**
 * Get all banners ordered by newest first.
 * @returns {Promise<Banner[]>}
 */
const getBanners = async () => {
  return Banner.findAll({ order: [['createdAt', 'DESC']] });
};

/**
 * Create a new banner.
 * @param {object} data
 * @returns {Promise<Banner>}
 */
const createBanner = async (data) => {
  return Banner.create(data);
};

/**
 * Update an existing banner by ID.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Banner>}
 */
const updateBanner = async (id, data) => {
  const banner = await Banner.findByPk(id);
  if (!banner) {
    const err = new Error('Banner not found');
    err.statusCode = 404;
    throw err;
  }
  await banner.update(data);
  return banner;
};

/**
 * Delete a banner by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
const deleteBanner = async (id) => {
  const banner = await Banner.findByPk(id);
  if (!banner) {
    const err = new Error('Banner not found');
    err.statusCode = 404;
    throw err;
  }
  await banner.destroy();
};

/**
 * Toggle a banner's status between 'active' and 'inactive'.
 * @param {number} id
 * @returns {Promise<Banner>}
 */
const toggleBannerStatus = async (id) => {
  const banner = await Banner.findByPk(id);
  if (!banner) {
    const err = new Error('Banner not found');
    err.statusCode = 404;
    throw err;
  }
  await banner.update({ status: banner.status === 'active' ? 'inactive' : 'active' });
  return banner;
};

module.exports = { getBanners, createBanner, updateBanner, deleteBanner, toggleBannerStatus };
