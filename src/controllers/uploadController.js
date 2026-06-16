const uploadService = require('../services/uploadService');

exports.uploadImage = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: false, message: 'No file uploaded' });
    const url = uploadService.getUploadedFileUrl(req.file.filename);
    res.json({ status: true, data: { url, filename: req.file.filename } });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.deleteImage = (req, res) => {
  try {
    uploadService.deleteUploadedFile(req.params.filename);
    res.json({ status: true, message: 'File deleted' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
