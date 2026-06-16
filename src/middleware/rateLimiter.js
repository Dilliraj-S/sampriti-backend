const rateLimit = require('express-rate-limit');

/** Aggressive limit for login — prevents brute force (10 attempts per 15 min) */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/** Moderate limit for register / forgot-password / resend-otp (20 per hour) */
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { status: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** General API limiter for all other routes */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { status: false, message: 'Rate limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, authLimiter, apiLimiter };
