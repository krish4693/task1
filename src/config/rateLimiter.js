const rateLimit = require('express-rate-limit');

module.exports = {
  globalLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
  }),

  authLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many auth attempts, please try again after 15 minutes.',
  }),
};
