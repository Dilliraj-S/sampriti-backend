const authService = require('../services/authService');
const cfg         = require('../config/auth.config');

const ip        = (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown';
const ua        = (req) => req.headers['user-agent'] || '';
const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  // 'none' is required when frontend (sampritibotanicals.codespidey.com) and
  // backend (sampritibackend.codespidey.com) are on different subdomains.
  // 'strict' blocks cross-origin cookies entirely.
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge:   cfg.REFRESH_TOKEN_EXPIRY_MS,
  path:     '/',
};


// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const data = await authService.registerUser(req.body, ip(req), ua(req));
    res.status(201).json({ status: true, ...data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const data = await authService.verifyEmail(req.body, ip(req), ua(req));
    res.json({ status: true, ...data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const data = await authService.resendOtp(req.body.email, ip(req));
    res.json({ status: true, ...data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body, ip(req), ua(req));
    // Refresh token → HttpOnly cookie (browser sends it automatically)
    res.cookie('refreshToken', result.refreshToken, cookieOpts);
    res.json({
      status:      true,
      accessToken: result.accessToken,
      user:        result.user,
      redirectTo:  result.redirectTo,
    });
  } catch (err) {
    const payload = { status: false, message: err.message };
    if (err.code) payload.code = err.code;
    res.status(err.statusCode || 500).json(payload);
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (!rawRefreshToken) {
      return res.status(401).json({ status: false, message: 'No refresh token.' });
    }
    const result = await authService.refreshAccessToken(rawRefreshToken, ip(req), ua(req));
    res.cookie('refreshToken', result.refreshToken, cookieOpts);
    res.json({ status: true, accessToken: result.accessToken });
  } catch (err) {
    res.clearCookie('refreshToken');
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    await authService.logoutUser(rawRefreshToken, req.user.id, ip(req), ua(req));
    res.clearCookie('refreshToken');
    res.json({ status: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// POST /api/auth/logout-all
exports.logoutAll = async (req, res) => {
  try {
    await authService.logoutAllDevices(req.user.id, ip(req), ua(req));
    res.clearCookie('refreshToken');
    res.json({ status: true, message: 'Logged out from all devices.' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const data = await authService.forgotPassword(req.body.email, ip(req), ua(req));
    res.json({ status: true, ...data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const data = await authService.resetPassword(req.body, ip(req), ua(req));
    res.clearCookie('refreshToken');
    res.json({ status: true, ...data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ status: true, data: user });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// PUT /api/auth/me
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, address_line1, address_line2, city, state, pincode, country } = req.body;
    const data = await authService.updateProfile(req.user.id, {
      full_name, phone, address_line1, address_line2, city, state, pincode, country,
    });
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ status: false, message: 'oldPassword and newPassword are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ status: false, message: 'New password must be at least 6 characters.' });
    }
    const data = await authService.changePassword(req.user.id, { oldPassword, newPassword });
    res.json({ status: true, ...data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

// GET /api/auth/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const data = await authService.getMyOrders(req.user.id);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
