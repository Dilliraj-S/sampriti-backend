const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * Checks if a GET request is a public/guest endpoint on the admin router.
 * Public routes do not require admin authentication.
 */
const isPublicGetRoute = (method, path) => {
  if (method !== 'GET') return false;

  // Normalize path by removing trailing slash and query params
  const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';

  // Exact public GET endpoints
  if (
    cleanPath === '/products' ||
    cleanPath === '/products/latest' ||
    cleanPath === '/categories' ||
    cleanPath === '/banners' ||
    cleanPath === '/content' ||
    cleanPath === '/settings'
  ) {
    return true;
  }

  // Parameterized public GET endpoints: /products/slug/:slug, /content/:slug
  if (cleanPath.startsWith('/products/slug/') || cleanPath.startsWith('/content/')) {
    return true;
  }

  // Parameterized public GET endpoint: /products/:id (alphanumeric ID without nested slashes)
  if (cleanPath.startsWith('/products/')) {
    const subpath = cleanPath.substring(10); // length of '/products/' is 10
    if (subpath && !subpath.includes('/')) {
      return true;
    }
  }

  return false;
};

/**
 * Admin authorization middleware.
 * Verifies JWT token and checks if the role is admin/superadmin.
 * Bypasses checks for public GET endpoints.
 */
const requireAdmin = (req, res, next) => {
  // 1. Allow public GET routes
  if (isPublicGetRoute(req.method, req.path)) {
    // If a token is provided anyway, decode it for req.user info
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        req.user = verifyAccessToken(token);
      } catch (_) {
        // Safe to ignore on public routes
      }
    }
    return next();
  }

  // 2. Protected routes — require access token
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'Access token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ status: false, message: 'Access denied. Admins only.' });
    }
    req.admin = decoded; // controller/route compatibility
    req.user = decoded;  // standard auth compatibility
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: false, message: 'Access token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ status: false, message: 'Invalid access token.' });
  }
};

module.exports = { requireAdmin };
