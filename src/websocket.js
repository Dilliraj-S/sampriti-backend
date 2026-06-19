const { Server } = require('socket.io');

let io;

function initSocketIO(server) {
  io = new Server(server, {
    cors: {
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
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocketIO, getIO };
