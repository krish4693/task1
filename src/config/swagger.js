// src/config/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const baseDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'User & Admin API docs',
  },
  servers: [{ url: 'http://localhost:3000' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const optionsUser = {
  definition: baseDefinition,
  apis: [
    './src/routes/v1/auth.route.js',
    './src/routes/v1/user/**/*.js', // any other user-only routes
  ],
};

const optionsAdmin = {
  definition: baseDefinition,
  apis: [
    './src/routes/v1/admin.route.js', // admin-only routes
    './src/routes/v1/user-management.js',
  ],
};

const swaggerSpecUser = swaggerJSDoc(optionsUser);
const swaggerSpecAdmin = swaggerJSDoc(optionsAdmin);

module.exports = { swaggerSpecUser, swaggerSpecAdmin };
