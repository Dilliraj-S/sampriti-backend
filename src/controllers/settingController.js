const { Setting } = require('../models');

exports.list = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const data = {};
    settings.forEach(s => { data[s.key] = s.value; });
    res.json({ status: true, data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await Setting.upsert({ key, value });
    }
    res.json({ status: true, message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
