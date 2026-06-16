module.exports = {
  ACCESS_TOKEN_SECRET:      process.env.ACCESS_TOKEN_SECRET  || 'dev_access_secret_change_in_prod',
  REFRESH_TOKEN_SECRET:     process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret_change_in_prod',
  ACCESS_TOKEN_EXPIRY:      '15m',
  REFRESH_TOKEN_EXPIRY:     '7d',
  REFRESH_TOKEN_EXPIRY_MS:  7 * 24 * 60 * 60 * 1000,
  BCRYPT_ROUNDS:            12,
  OTP_EXPIRY_MINUTES:       10,
  RESET_TOKEN_EXPIRY_MINUTES: 30,
  MAX_LOGIN_ATTEMPTS:       5,
  LOCKOUT_WINDOW_MINUTES:   15,
};
