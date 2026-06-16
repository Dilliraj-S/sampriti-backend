const bcrypt = require('bcryptjs');
const cfg    = require('../config/auth.config');

/**
 * Hashes a plain-text password using bcrypt.
 * @param {string} password
 * @returns {Promise<string>} hashed password
 */
const hashPassword = (password) => bcrypt.hash(password, cfg.BCRYPT_ROUNDS);

/**
 * Constant-time comparison of a plain password against a bcrypt hash.
 * Always runs bcrypt.compare even if the hash is a dummy value to prevent
 * timing attacks that could reveal whether an email exists.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

/**
 * A dummy hash used for constant-time comparison when the user is not found.
 * Pre-computed so there's no startup delay.
 */
const DUMMY_HASH = '$2a$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

module.exports = { hashPassword, comparePassword, DUMMY_HASH };
