const dashboardService = require('../services/dashboardService');

exports.dashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
