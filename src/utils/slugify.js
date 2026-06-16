/**
 * Converts a text string into a URL-safe slug.
 * e.g. "My Product Name!" → "my-product-name"
 * @param {string} text
 * @returns {string}
 */
const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

module.exports = slugify;
