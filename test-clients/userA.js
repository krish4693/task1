/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');

// 🔐 User A’s JWT (hard-coded as you provided)
const tokenA =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODFiZGUzMzBkNDBiYzZkNTNlM2ZmYjciLCJpYXQiOjE3NDY2OTA2ODUsImV4cCI6MTc0NjY5MjQ4NSwidHlwZSI6ImFjY2VzcyJ9.p-p3rrdMtWdsoyBWChHxmirsVJ_AQeSXsNsscd-qOE0';

// 🔐 User B’s JWT (hard-coded as you provided)
const tokenB =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODFjNDdiMjBlYjAyYmRkMTFkMzk1ZGUiLCJpYXQiOjE3NDY2OTA3NjEsImV4cCI6MTc0NjY5MjU2MSwidHlwZSI6ImFjY2VzcyJ9.6vpiDCRakhdrNq05jXDVlfBY_7Fxf38zCS_bKmbrHnI';

// Decode the `sub` claim (user IDs) from each token
const userAId = jwt.decode(tokenA).sub; // "681bde330d40bc6d53e3ffb7"
const userBId = jwt.decode(tokenB).sub; // "681c47b20eb02bdd11d395de"

const socket = io('http://localhost:3000', {
  path: '/ws',
  auth: { token: tokenA },
});

socket.on('connect', () => {
  console.log(`✅ User A connected: socket=${socket.id}, userId=${userAId}`);

  // Join a common room
  socket.emit('join_group', 'room1', () => {
    console.log('🔸 User A joined room1');
  });

  // Send a group message after 2s
  setTimeout(() => {
    socket.emit('group_message', { groupId: 'room1', message: `Hello room from A hoy (${userAId})` }, (ack) =>
      console.log('👥 group_message ack:', ack)
    );
  }, 2000);

  // Send a private message to User B after 4s
  setTimeout(() => {
    socket.emit('private_message', { to: userBId, message: `Hi B (${userBId}), this is AB!` }, (ack) =>
      console.log('✉️ private_message ack:', ack)
    );
  }, 4000);
});

socket.on('group_message', ({ from, groupId, message }) => {
  console.log(`📥 [A] Group ${groupId} from ${from}: ${message}`);
});

socket.on('private_message', ({ from, message }) => {
  console.log(`📩 [A] Private from ${from}: ${message} HOLA`);
});

socket.on('connect_error', (err) => {
  console.error('❌ A connect error:', err.message);
});
