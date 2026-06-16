const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * JWT access token verification middleware.
 * Reads `Authorization: Bearer <token>` header.
 * Sets req.user = { id, email, role } on success.
 */
module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'Access token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: false, message: 'Access token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ status: false, message: 'Invalid access token.' });
  }
};
