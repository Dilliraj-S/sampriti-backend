const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Dedicated raw mysql2 pool for the auth system.
 * Completely separate from Sequelize (used by admin routes).
 * Uses DB_PASS env key matching the existing .env convention.
 */
const pool = mysql.createPool({
  host:               process.env.DB_HOST || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER || 'root',
  password:           process.env.DB_PASS || '',
  database:           process.env.DB_NAME || 'sampriti',
  waitForConnections: true,
  connectionLimit:    20,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
});

module.exports = pool;
