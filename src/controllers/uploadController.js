exports.uploadImage = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: false, message: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ status: true, data: { url, filename: req.file.filename } });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.deleteImage = (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../public/uploads', req.params.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ status: true, message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
