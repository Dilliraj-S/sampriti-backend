const crypto = require('crypto');

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

const getSecret = () => process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD;

const base64url = (value) => Buffer.from(value).toString('base64url');

const sign = (payload) => {
  const secret = getSecret();
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
};

const createAdminToken = (email) => {
  const payload = base64url(JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${sign(payload)}`;
};

const verifyAdminToken = (token) => {
  if (!token || !getSecret()) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || signature !== sign(payload)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
};

const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const admin = verifyAdminToken(token);
  if (!admin) return res.status(401).json({ status: false, message: 'Admin login required' });
  req.admin = admin;
  next();
};

module.exports = { createAdminToken, requireAdmin };
