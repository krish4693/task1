// src/index.js
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
// eslint-disable-next-line import/no-unresolved
const socketSetup = require('./socket'); // your src/sockets/index.js

let server;

// 1️⃣ Connect to MongoDB first
mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('✅ Connected to MongoDB');

    // 2️⃣ Create a raw HTTP server that wraps your Express app
    server = http.createServer(app);

    // 3️⃣ Attach Socket.IO to that HTTP server
    // eslint-disable-next-line global-require
    const { Server } = require('socket.io');
    const io = new Server(server, {
      path: '/ws', // WebSocket handshake endpoint
      cors: { origin: '*' }, // Adjust your CORS in production
    });
    socketSetup(io);
    logger.info('🔌 Socket.IO initialized at path /ws');

    // 4️⃣ Start the HTTP + WebSocket server
    server.listen(config.port, () => {
      logger.info(`🚀 Server listening on port ${config.port}`);
    });
  })
  .catch((err) => {
    logger.error('❌ MongoDB connection failed', err);
    process.exit(1);
  });

// 5️⃣ Graceful shutdown handlers
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('🛑 HTTP & WebSocket server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('❌ Unexpected error', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('⚡ SIGTERM received');
  exitHandler();
});
