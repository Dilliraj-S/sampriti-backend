const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

/**
 * Returns the public URL path for an uploaded file.
 * @param {string} filename
 * @returns {string}
 */
const getUploadedFileUrl = (filename) => `/uploads/${filename}`;

/**
 * Deletes an uploaded file from disk.
 * Silently succeeds if the file does not exist.
 * @param {string} filename
 * @returns {void}
 */
const deleteUploadedFile = (filename) => {
  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = { getUploadedFileUrl, deleteUploadedFile };
