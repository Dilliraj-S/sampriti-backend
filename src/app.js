const express      = require('express');
const http         = require('http');
const cors         = require('cors');
const path         = require('path');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const fs           = require('fs');
const mysql        = require('mysql2/promise');
require('dotenv').config();

const { syncDB }        = require('./models');
const adminRoutes       = require('./routes/adminRoutes');
const authRoutes        = require('./routes/authRoutes');
const { seedAdminUser } = require('./services/authService');
const { requireAdmin }  = require('./middleware/adminAuth');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;

const { initSocketIO } = require('./websocket');
initSocketIO(server);

// ── Trust Hostinger's nginx reverse proxy ─────────────────────────────────────
// Required for express-rate-limit to correctly read client IPs via X-Forwarded-For
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));

// ── CORS — credentials: true required for HttpOnly cookie on /api/auth/refresh ─
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      ...(process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean),
    ];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// ── Body & cookie parsers ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', cors(), express.static(path.join(__dirname, '../public/uploads')));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Sampriti Botanicals Backend API is running' });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api',       require('./routes/publicRoutes'));

// ── 404 — catch-all: always return JSON, never HTML ──────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ status: false, message: err.message });
});

// ── Run auth DB migration then start server ───────────────────────────────────
const runMigration = async () => {
  const sqlPath = path.join(__dirname, 'db/migrations/001_auth_tables.sql');
  if (!fs.existsSync(sqlPath)) return;

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);



  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'sampriti',
    multipleStatements: false,
  });

  for (const stmt of statements) {
    try {
      await conn.query(stmt);
    } catch (stmtErr) {
      console.warn(`[migration] Skipped statement (${stmtErr.message.substring(0, 80)}): ${stmt.substring(0, 60)}...`);
    }
  }
  await conn.end();
  console.log('[migration] Auth tables verified/created.');
};

syncDB()
  .then(() => runMigration())
  .then(() => seedAdminUser())
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Startup error:', err.message);
    process.exit(1);
  });
