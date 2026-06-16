const { Setting } = require('../models');

/**
 * Get all settings as a flat key-value object.
 * @returns {Promise<object>}
 */
const getSettings = async () => {
  const settings = await Setting.findAll();
  const data = {};
  settings.forEach((s) => { data[s.key] = s.value; });
  return data;
};

/**
 * Update (upsert) multiple settings from a key-value body object.
 * Uses sequential upserts to preserve transaction safety.
 * @param {object} body - Plain object of { key: value } pairs
 * @returns {Promise<void>}
 */
const updateSettings = async (body) => {
  for (const [key, value] of Object.entries(body)) {
    await Setting.upsert({ key, value });
  }
};

module.exports = { getSettings, updateSettings };
