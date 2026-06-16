require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

const email    = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

console.log('ADMIN_EMAIL:', email);
console.log('ADMIN_PASSWORD set:', !!password);

if (!email || !password) {
  console.error('ERROR: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
  process.exit(1);
}

(async () => {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'sampriti',
  });

  const hash = await bcrypt.hash(password, 12);

  const [rows] = await conn.query('SELECT id, role FROM users WHERE email = ? LIMIT 1', [email]);

  if (rows.length > 0) {
    await conn.query(
      "UPDATE users SET password_hash = ?, role = 'admin', is_verified = 1, is_active = 1, full_name = 'Admin' WHERE email = ?",
      [hash, email]
    );
    console.log('✅ Admin user UPDATED in DB:', email);
  } else {
    await conn.query(
      "INSERT INTO users (email, password_hash, full_name, role, is_verified, is_active) VALUES (?, ?, 'Admin', 'admin', 1, 1)",
      [email, hash]
    );
    console.log('✅ Admin user CREATED in DB:', email);
  }

  const [verify] = await conn.query('SELECT id, email, role, is_verified, is_active FROM users WHERE email = ?', [email]);
  console.log('✅ Verified DB record:', JSON.stringify(verify[0]));

  await conn.end();
  console.log('Done. You can now login with:', email);
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
