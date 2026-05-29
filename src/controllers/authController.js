const { createAdminToken } = require('../middleware/adminAuth');

exports.login = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  if (!adminEmail || !adminPassword || !process.env.ADMIN_TOKEN_SECRET) {
    return res.status(500).json({ status: false, message: 'Admin credentials are not configured on the server' });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ status: false, message: 'Invalid admin credentials' });
  }

  res.json({ status: true, data: { token: createAdminToken(email), email } });
};
