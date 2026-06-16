const inventoryService = require('../services/inventoryService');

exports.list = async (req, res) => {
  try {
    const data = await inventoryService.getInventory();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const data = await inventoryService.updateStock(req.params.id, req.body.stock);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
