const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../config/logger');

module.exports = (io) => {
  // 1️⃣ Authentication middleware
  io.use((socket, next) => {
    const { token } = socket.handshake.auth;
    try {
      const { sub: userId } = jwt.verify(token, config.jwt.secret);
      // eslint-disable-next-line no-param-reassign
      socket.userId = userId;
      socket.join(userId);
      logger.info('🛡️ Authenticated socket %s for user %s', socket.id, userId);
      next();
    } catch (err) {
      logger.warn('❌ Authentication failed for socket %s: %s', socket.id, err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('🔌 User connected: socket=%s, userId=%s', socket.id, socket.userId);

    // 2️⃣ Private messaging
    socket.on('private_message', ({ to, message }) => {
      logger.debug('✉️ Private message from user %s to user %s: %s', socket.userId, to, message);
      io.to(to).emit('private_message', {
        from: socket.userId,
        message,
      });
    });

    // 3️⃣ Group messaging
    socket.on('join_group', (groupId) => {
      socket.join(groupId);
      logger.info('👥 User %s joined group %s', socket.userId, groupId);
    });

    socket.on('group_message', ({ groupId, message }) => {
      logger.debug('🗣️ Group message in %s from user %s: %s', groupId, socket.userId, message);
      io.to(groupId).emit('group_message', {
        from: socket.userId,
        message,
      });
    });

    socket.on('leave_group', (groupId) => {
      socket.leave(groupId);
      logger.info('🚪 User %s left group %s', socket.userId, groupId);
    });

    socket.on('disconnect', (reason) => {
      logger.info('❌ Socket disconnected: socket=%s, userId=%s, reason=%s', socket.id, socket.userId, reason);
    });
  });
};
