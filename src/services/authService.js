const pool            = require('../db/pool');
const cfg             = require('../config/auth.config');
const { hashPassword, comparePassword, DUMMY_HASH } = require('../utils/hashUtils');
const {
  signAccessToken, signRefreshToken, verifyRefreshToken,
  hashToken, generateSecureToken, generateOTP, newTokenFamily,
} = require('../utils/tokenUtils');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/mailer');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const audit = async (userId, event, ip, userAgent, metadata = null) => {
  try {
    await pool.query(
      'INSERT INTO auth_audit_log (user_id, event, ip_address, user_agent, metadata) VALUES (?, ?, ?, ?, ?)',
      [userId || null, event, ip || null, userAgent || null, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (_) { /* audit failures must never crash the request */ }
};

const logLoginAttempt = async (identifier, type, ip) => {
  await pool.query(
    'INSERT INTO login_attempts (identifier, attempt_type, ip_address) VALUES (?, ?, ?)',
    [identifier, type, ip || null]
  );
};

// ─────────────────────────────────────────────
// ADMIN USER SEED (called once on startup)
// ─────────────────────────────────────────────

/**
 * Ensures an admin user exists in the users table using ADMIN_EMAIL / ADMIN_PASSWORD from .env.
 * This allows admin to log in via the same JWT /api/auth/login endpoint as customers.
 * Safe to call repeatedly — only creates if not already present.
 */
const seedAdminUser = async () => {
  const adminEmail    = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  if (!adminEmail || !adminPassword) {
    console.log('[auth] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed.');
    return;
  }

  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1', [adminEmail]
  );

  if (existing.length > 0) {
    const password_hash = await hashPassword(adminPassword);
    await pool.query(
      "UPDATE users SET role = 'admin', is_verified = 1, is_active = 1, password_hash = ? WHERE email = ?",
      [password_hash, adminEmail]
    );
    console.log('[auth] Admin user verified in users table.');
    return;
  }

  const password_hash = await hashPassword(adminPassword);
  await pool.query(
    "INSERT INTO users (email, password_hash, full_name, role, is_verified, is_active) VALUES (?, ?, ?, 'admin', 1, 1)",
    [adminEmail, password_hash, 'Admin']
  );
  console.log('[auth] Admin user created in users table:', adminEmail);
};

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────

const registerUser = async ({ full_name, email, password }, ip, userAgent) => {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length > 0) {
    return { message: 'If this email is new, a verification code has been sent.' };
  }

  const password_hash = await hashPassword(password);
  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, full_name, role, is_verified) VALUES (?, ?, ?, ?, ?)',
    [email, password_hash, full_name, 'customer', 0]
  );
  const userId = result.insertId;

  const otp     = generateOTP();
  const otpHash = hashToken(otp);
  const expires = new Date(Date.now() + cfg.OTP_EXPIRY_MINUTES * 60 * 1000);

  await pool.query(
    'INSERT INTO email_verifications (user_id, otp_hash, expires_at) VALUES (?, ?, ?)',
    [userId, otpHash, expires]
  );

  sendOtpEmail(email, otp, full_name).catch(err => {
    console.error('[authService.registerUser] Email send failed:', err.message);
    if (err.response) console.error('[authService.registerUser] SMTP response:', err.response);
  });

  await audit(userId, 'register', ip, userAgent);
  return { message: 'Registration successful. Please check your email for the 6-digit verification code.' };
};

// ─────────────────────────────────────────────
// VERIFY EMAIL (OTP)
// ─────────────────────────────────────────────

const verifyEmail = async ({ email, otp }, ip, userAgent) => {
  const [users] = await pool.query(
    'SELECT id, is_verified FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
    [email]
  );
  if (users.length === 0) {
    const err = new Error('Invalid verification attempt.'); err.statusCode = 400; throw err;
  }
  const user = users[0];

  if (user.is_verified) {
    const err = new Error('This email is already verified. Please sign in.'); err.statusCode = 400; throw err;
  }

  const otpHash = hashToken(otp);
  const [rows] = await pool.query(
    'SELECT id FROM email_verifications WHERE user_id = ? AND otp_hash = ? AND used_at IS NULL AND expires_at > NOW() LIMIT 1',
    [user.id, otpHash]
  );

  if (rows.length === 0) {
    const err = new Error('Invalid or expired verification code.'); err.statusCode = 400; throw err;
  }

  await Promise.all([
    pool.query('UPDATE email_verifications SET used_at = NOW() WHERE id = ?', [rows[0].id]),
    pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [user.id]),
  ]);

  await audit(user.id, 'email_verified', ip, userAgent);
  return { message: 'Email verified successfully. You can now sign in.' };
};

// ─────────────────────────────────────────────
// RESEND OTP
// ─────────────────────────────────────────────

const resendOtp = async (email, ip) => {
  const [users] = await pool.query(
    'SELECT id, full_name, is_verified FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
    [email]
  );
  if (users.length === 0 || users[0].is_verified) {
    return { message: 'If your account exists and is unverified, a new code has been sent.' };
  }
  const user = users[0];

  await pool.query(
    'UPDATE email_verifications SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
    [user.id]
  );

  const otp     = generateOTP();
  const otpHash = hashToken(otp);
  const expires = new Date(Date.now() + cfg.OTP_EXPIRY_MINUTES * 60 * 1000);

  await pool.query(
    'INSERT INTO email_verifications (user_id, otp_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, otpHash, expires]
  );

  sendOtpEmail(email, otp, user.full_name).catch(err =>
    console.error('[authService.resendOtp] Email send failed:', err.message)
  );

  return { message: 'If your account exists and is unverified, a new code has been sent.' };
};

// ─────────────────────────────────────────────
// LOGIN — returns role + redirectTo for frontend routing
// ─────────────────────────────────────────────

const loginUser = async ({ email, password }, ip, userAgent) => {
  // Brute-force check
  const [attempts] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM login_attempts
     WHERE identifier = ? AND attempted_at > DATE_SUB(NOW(), INTERVAL ${cfg.LOCKOUT_WINDOW_MINUTES} MINUTE)`,
    [email]
  );
  if (attempts[0].cnt >= cfg.MAX_LOGIN_ATTEMPTS) {
    const err = new Error(`Too many failed attempts. Try again in ${cfg.LOCKOUT_WINDOW_MINUTES} minutes.`);
    err.statusCode = 429; throw err;
  }

  const [users] = await pool.query(
    'SELECT id, email, password_hash, full_name, role, is_verified, is_active FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  const user         = users[0];
  const hashToCompare = user ? user.password_hash : DUMMY_HASH;
  const isMatch      = await comparePassword(password, hashToCompare);

  if (!user || !isMatch) {
    await logLoginAttempt(email, 'email', ip);
    const err = new Error('Invalid email or password.'); err.statusCode = 401; throw err;
  }

  if (!user.is_active) {
    const err = new Error('Your account has been disabled. Please contact support.'); err.statusCode = 403; throw err;
  }

  // Admin users bypass email verification requirement
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  if (!user.is_verified && !isAdmin) {
    const err = new Error('Please verify your email first. Check your inbox for the OTP.');
    err.statusCode = 403; err.code = 'EMAIL_NOT_VERIFIED'; throw err;
  }

  await pool.query('DELETE FROM login_attempts WHERE identifier = ? AND attempt_type = ?', [email, 'email']);

  const family       = newTokenFamily();
  const accessToken  = signAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, family });
  const tokenHash    = hashToken(refreshToken);
  const expiresAt    = new Date(Date.now() + cfg.REFRESH_TOKEN_EXPIRY_MS);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, family, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
    [user.id, tokenHash, family, ip || null, userAgent || null, expiresAt]
  );

  await audit(user.id, 'login', ip, userAgent);

  // Determine where the frontend should redirect after login
  const redirectTo = isAdmin ? '/admin/dashboard' : '/';

  return {
    accessToken,
    refreshToken,
    user:       { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    redirectTo,
  };
};

// ─────────────────────────────────────────────
// REFRESH ACCESS TOKEN
// ─────────────────────────────────────────────

const refreshAccessToken = async (rawRefreshToken, ip, userAgent) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    const err = new Error('Invalid or expired refresh token.'); err.statusCode = 401; throw err;
  }

  const { id: userId, family } = decoded;
  const tokenHash = hashToken(rawRefreshToken);

  const [rows] = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
    [tokenHash]
  );

  if (rows.length === 0) {
    await pool.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE family = ?', [family]);
    await audit(userId, 'token_reuse_detected', ip, userAgent, { family });
    const err = new Error('Session invalidated. Please sign in again.'); err.statusCode = 401; throw err;
  }

  const storedToken = rows[0];

  if (storedToken.is_revoked) {
    await pool.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE family = ?', [family]);
    await audit(userId, 'token_reuse_detected', ip, userAgent, { family });
    const err = new Error('Session invalidated. Please sign in again.'); err.statusCode = 401; throw err;
  }

  await pool.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE id = ?', [storedToken.id]);

  const [users] = await pool.query(
    'SELECT id, email, role FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
    [userId]
  );
  if (users.length === 0) {
    const err = new Error('User not found.'); err.statusCode = 401; throw err;
  }
  const user = users[0];

  const accessToken  = signAccessToken({ id: user.id, email: user.email, role: user.role });
  const newRefresh   = signRefreshToken({ id: user.id, family });
  const newHash      = hashToken(newRefresh);
  const expiresAt    = new Date(Date.now() + cfg.REFRESH_TOKEN_EXPIRY_MS);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, family, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
    [user.id, newHash, family, ip || null, userAgent || null, expiresAt]
  );

  return { accessToken, refreshToken: newRefresh };
};

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────

const logoutUser = async (rawRefreshToken, userId, ip, userAgent) => {
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await pool.query(
      'UPDATE refresh_tokens SET is_revoked = 1 WHERE token_hash = ? AND user_id = ?',
      [tokenHash, userId]
    );
  }
  await audit(userId, 'logout', ip, userAgent);
};

const logoutAllDevices = async (userId, ip, userAgent) => {
  await pool.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?', [userId]);
  await audit(userId, 'logout_all_devices', ip, userAgent);
};

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────

const forgotPassword = async (email, ip, userAgent) => {
  const [users] = await pool.query(
    'SELECT id, full_name FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
    [email]
  );

  if (users.length > 0) {
    const user = users[0];
    await pool.query(
      'UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [user.id]
    );

    const rawToken  = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + cfg.RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    );

    sendPasswordResetEmail(email, rawToken, user.full_name).catch(err =>
      console.error('[authService.forgotPassword] Email send failed:', err.message)
    );

    await audit(user.id, 'forgot_password', ip, userAgent);
  }

  return { message: 'If an account with that email exists, a password reset link has been sent.' };
};

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────

const resetPassword = async ({ token, password }, ip, userAgent) => {
  const tokenHash = hashToken(token);

  const [rows] = await pool.query(
    'SELECT * FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW() LIMIT 1',
    [tokenHash]
  );

  if (rows.length === 0) {
    const err = new Error('Invalid or expired password reset link.'); err.statusCode = 400; throw err;
  }

  const reset         = rows[0];
  const password_hash = await hashPassword(password);

  await Promise.all([
    pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, reset.user_id]),
    pool.query('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [reset.id]),
    pool.query('UPDATE refresh_tokens SET is_revoked = 1 WHERE user_id = ?', [reset.user_id]),
  ]);

  await audit(reset.user_id, 'password_reset', ip, userAgent);
  return { message: 'Password reset successfully. Please sign in with your new password.' };
};

// ─────────────────────────────────────────────
// GET ME
// ─────────────────────────────────────────────

const getMe = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, email, full_name, phone, role, avatar_url, created_at
     FROM users WHERE id = ? AND is_active = 1 LIMIT 1`,
    [userId]
  );
  if (rows.length === 0) {
    const err = new Error('User not found.'); err.statusCode = 404; throw err;
  }
  return rows[0];
};

// ─────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────

const updateProfile = async (userId, fields) => {
  const allowed = ['full_name', 'phone', 'address_line1', 'address_line2', 'city', 'state', 'pincode', 'country'];
  const updates = [];
  const values  = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(fields[key] !== null && typeof fields[key] === 'string' ? fields[key].trim() || null : fields[key]);
    }
  }
  if (updates.length === 0) {
    const err = new Error('Nothing to update.'); err.statusCode = 400; throw err;
  }
  values.push(userId);
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
  const [rows] = await pool.query(
    `SELECT id, email, full_name, phone, role, avatar_url, created_at,
            address_line1, address_line2, city, state, pincode, country
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  return rows[0];
};

// ─────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────

const changePassword = async (userId, { oldPassword, newPassword }) => {
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [userId]);
  if (rows.length === 0) {
    const err = new Error('User not found.'); err.statusCode = 404; throw err;
  }
  const isMatch = await comparePassword(oldPassword, rows[0].password_hash);
  if (!isMatch) {
    const err = new Error('Current password is incorrect.'); err.statusCode = 400; throw err;
  }
  const newHash = await hashPassword(newPassword);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
  return { message: 'Password changed successfully.' };
};

// ─────────────────────────────────────────────
// MY ORDERS (customer-facing)
// ─────────────────────────────────────────────

const getMyOrders = async (userId) => {
  // Orders are linked to the customers table by email.
  // First find the customer record matching this user's email.
  const [users] = await pool.query('SELECT email FROM users WHERE id = ? LIMIT 1', [userId]);
  if (users.length === 0) return [];

  const email = users[0].email;
  // Find matching customer record
  const [customers] = await pool.query('SELECT id FROM customers WHERE email = ? LIMIT 1', [email]);
  if (customers.length === 0) return [];

  const customerId = customers[0].id;
  const [orders] = await pool.query(
    'SELECT id, items, total, shipping, status, paymentMethod, paymentStatus, customerInfo, shippingAddress, createdAt FROM orders WHERE customerId = ? ORDER BY createdAt DESC LIMIT 20',
    [customerId]
  );
  return orders;
};

module.exports = {
  seedAdminUser,
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  getMyOrders,
};
