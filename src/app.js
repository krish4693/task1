const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpecUser, swaggerSpecAdmin } = require('./config/swagger');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');

// ← Import your two limiters
const { authLimiter, globalLimiter } = require('./config/rateLimiter');

const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

// ─── 1. GLOBAL RATE LIMITER ─────────────────────────────────────
// Apply to all requests, before any other middleware or routes
app.use(globalLimiter);

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// ─── 2. AUTH-SPECIFIC RATE LIMITER ──────────────────────────────
// Wrap only the auth routes in production (login, signup, forgot-password, etc.)
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes (this now includes /v1/auth, /v1/users, etc.)
app.use('/v1', routes);

// Serve “user” docs:
app.use('/api/docs/user', swaggerUi.serveFiles(swaggerSpecUser, {}), swaggerUi.setup(swaggerSpecUser, { explorer: true }));

// Serve “admin” docs:
app.use(
  '/api/docs/admin',
  swaggerUi.serveFiles(swaggerSpecAdmin, {}),
  swaggerUi.setup(swaggerSpecAdmin, { explorer: true })
);

// Admin routes (protect these with JWT + role check inside controller)
app.use('/v1/admin', require('./routes/v1/admin.route'));

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
