// src/sockets/index.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (io) => {
  // 1. Authenticate once on connection
  io.use((socket, next) => {
    const { token } = socket.handshake.auth;
    try {
      const { sub: userId } = jwt.verify(token, config.jwt.secret);
      // eslint-disable-next-line no-param-reassign
      socket.userId = userId;
      socket.join(userId);
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // 2. Private messaging
    socket.on('private_message', ({ to, message }) => {
      // send to a single socket id
      io.to(to).emit('private_message', {
        from: socket.userId,
        message,
      });
    });

    // 3. Group messaging
    socket.on('join_group', (groupId) => {
      socket.join(groupId);
    });
    socket.on('group_message', ({ groupId, message }) => {
      io.to(groupId).emit('group_message', {
        from: socket.userId,
        message,
      });
    });
    socket.on('leave_group', (groupId) => {
      // eslint-disable-next-line no-console
      console.log(`User ${socket.userId} left group ${groupId}`);
      socket.leave(groupId);
    });
  });
};
