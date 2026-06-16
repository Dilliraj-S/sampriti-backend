const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const cfg    = require('../config/auth.config');

/**
 * Signs a short-lived access token (15m).
 * @param {{ id: number, email: string, role: string }} payload
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, cfg.ACCESS_TOKEN_SECRET, { expiresIn: cfg.ACCESS_TOKEN_EXPIRY });

/**
 * Signs a long-lived refresh token (7d).
 * Store the HASH in DB; send the raw token to the client cookie.
 * @param {{ id: number, family: string }} payload
 */
const signRefreshToken = (payload) =>
  jwt.sign(payload, cfg.REFRESH_TOKEN_SECRET, { expiresIn: cfg.REFRESH_TOKEN_EXPIRY });

/** Verifies access token — throws on expiry/invalid */
const verifyAccessToken = (token) => jwt.verify(token, cfg.ACCESS_TOKEN_SECRET);

/** Verifies refresh token — throws on expiry/invalid */
const verifyRefreshToken = (token) => jwt.verify(token, cfg.REFRESH_TOKEN_SECRET);

/**
 * SHA-256 hash of a raw token for secure DB storage.
 * Tokens stored as hashes so a DB breach doesn't expose live tokens.
 */
const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

/**
 * Generates a cryptographically secure random hex token (for password reset links).
 */
const generateSecureToken = () => crypto.randomBytes(32).toString('hex');

/**
 * Generates a 6-digit numeric OTP.
 */
const generateOTP = () =>
  String(crypto.randomInt(100000, 999999));

/**
 * Creates a new token family UUID for refresh token rotation chains.
 */
const newTokenFamily = () => uuidv4();

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  generateSecureToken,
  generateOTP,
  newTokenFamily,
};
