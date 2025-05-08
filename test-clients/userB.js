/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');
const logger = require('../src/config/logger'); // adjust path if needed

// 🔐 User A’s JWT (hard-coded)
const tokenA =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODFiZGUzMzBkNDBiYzZkNTNlM2ZmYjciLCJpYXQiOjE3NDY2OTA2ODUsImV4cCI6MTc0NjY5MjQ4NSwidHlwZSI6ImFjY2VzcyJ9.p-p3rrdMtWdsoyBWChHxmirsVJ_AQeSXsNsscd-qOE0';

// 🔐 User B’s JWT (hard-coded)
const tokenB =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODFjNDdiMjBlYjAyYmRkMTFkMzk1ZGUiLCJpYXQiOjE3NDY2OTA3NjEsImV4cCI6MTc0NjY5MjU2MSwidHlwZSI6ImFjY2VzcyJ9.6vpiDCRakhdrNq05jXDVlfBY_7Fxf38zCS_bKmbrHnI';

// Decode the `sub` claim (user IDs)
const userAId = jwt.decode(tokenA).sub;
const userBId = jwt.decode(tokenB).sub;

const socket = io('http://localhost:3000', {
  path: '/ws',
  auth: { token: tokenB },
});

socket.on('connect', () => {
  logger.info('✅ User B connected: socket=%s, userId=%s', socket.id, userBId);

  // Join the group
  socket.emit('join_group', 'room1', () => {
    logger.info('🔸 User B joined room1');
  });

  // Send group message after 2s
  setTimeout(() => {
    socket.emit('group_message', { groupId: 'room1', message: `Hello room from B (${userBId})` }, (ack) =>
      logger.debug('👥 group_message ack: %o', ack)
    );

    // Leave the group after 1 more second
    setTimeout(() => {
      socket.emit('leave_group', 'room1', () => {
        logger.info('🚪 User B left room1');
      });
    }, 1000);
  }, 2000);

  // Send private message to User A after 4s
  setTimeout(() => {
    socket.emit('private_message', { to: userAId, message: `Hey A (${userAId}), B here!` }, (ack) =>
      logger.debug('✉️ private_message ack: %o', ack)
    );
  }, 4000);
});

socket.on('group_message', ({ from, groupId, message }) => {
  logger.info('📥 [B] Group %s from %s: %s', groupId, from, message);
});

socket.on('private_message', ({ from, message }) => {
  logger.info('📩 [B] Private from %s: %s', from, message);
});

socket.on('connect_error', (err) => {
  logger.error('❌ B connect error: %s', err.message);
});
