/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');
const logger = require('../src/config/logger'); // adjust path as needed

// 🔐 User A’s JWT (hard-coded as you provided)
const tokenA =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODFiZGUzMzBkNDBiYzZkNTNlM2ZmYjciLCJpYXQiOjE3NDY3MjU5NTYsImV4cCI6MTc0NjcyNzc1NiwidHlwZSI6ImFjY2VzcyJ9.nT2mHP4Jl-09nq_-dNzgmwtgdEc6anLDac26g02uq2g';

// 🔐 User B’s JWT (hard-coded as you provided)
const tokenB =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODFjZTdlZjJjYjA3NzgxZDA0Yjg1NjAiLCJpYXQiOjE3NDY3MjYwMjQsImV4cCI6MTc0NjczODAyNCwidHlwZSI6ImFjY2VzcyJ9.2V4mG_ocK0EDKdYs_n_3akmdWSwozPuCg3jWUSeXTzo';

// Decode the `sub` claim (user IDs) from each token
const userAId = jwt.decode(tokenA).sub; // "681bde330d40bc6d53e3ffb7"
const userBId = jwt.decode(tokenB).sub; // "681c47b20eb02bdd11d395de"

const socket = io('http://localhost:3000', {
  path: '/ws',
  auth: { token: tokenA },
});

socket.on('connect', () => {
  logger.info('✅ User A connected: socket=%s, userId=%s', socket.id, userAId);

  // Join a common room
  socket.emit('join_group', 'room1', () => {
    logger.info('🔸 User A joined room1');
  });

  // Send a group message after 2s
  setTimeout(() => {
    socket.emit('group_message', { groupId: 'room1', message: `Hello room from A hoy (${userAId})` }, (ack) =>
      logger.debug('👥 group_message ack: %o', ack)
    );
  }, 2000);

  // Send a private message to User B after 4s
  setTimeout(() => {
    socket.emit('private_message', { to: userBId, message: `Hi B (${userBId}), this is AB!` }, (ack) =>
      logger.debug('✉️ private_message ack: %o', ack)
    );
  }, 4000);
});

socket.on('group_message', ({ from, groupId, message }) => {
  logger.info('📥 [A] Group %s from %s: %s', groupId, from, message);
});

socket.on('private_message', ({ from, message }) => {
  logger.info('📩 [A] Private from %s: %s HOLA', from, message);
});

socket.on('connect_error', (err) => {
  logger.error('❌ A connect error: %s', err.message);
});
