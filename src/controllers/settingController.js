const settingService = require('../services/settingService');

exports.list = async (req, res) => {
  try {
    const data = await settingService.getSettings();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    await settingService.updateSettings(req.body);
    res.json({ status: true, message: 'Settings updated' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
