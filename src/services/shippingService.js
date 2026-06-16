const { ShippingZone } = require('../models');

/**
 * Get all shipping zones ordered by newest first.
 * @returns {Promise<ShippingZone[]>}
 */
const getShippingZones = async () => {
  return ShippingZone.findAll({ order: [['createdAt', 'DESC']] });
};

/**
 * Create a new shipping zone.
 * @param {object} data
 * @returns {Promise<ShippingZone>}
 */
const createShippingZone = async (data) => {
  return ShippingZone.create(data);
};

/**
 * Update an existing shipping zone by ID.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<ShippingZone>}
 */
const updateShippingZone = async (id, data) => {
  const zone = await ShippingZone.findByPk(id);
  if (!zone) {
    const err = new Error('Shipping zone not found');
    err.statusCode = 404;
    throw err;
  }
  await zone.update(data);
  return zone;
};

/**
 * Delete a shipping zone by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
const deleteShippingZone = async (id) => {
  const zone = await ShippingZone.findByPk(id);
  if (!zone) {
    const err = new Error('Shipping zone not found');
    err.statusCode = 404;
    throw err;
  }
  await zone.destroy();
};

module.exports = { getShippingZones, createShippingZone, updateShippingZone, deleteShippingZone };
