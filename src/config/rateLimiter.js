const rateLimit = require('express-rate-limit');

module.exports = {
  // 1️⃣ Global limiter (all endpoints)
  globalLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // max requests per IP
    standardHeaders: true, // RFC-compliant headers
    legacyHeaders: false, // disable X-RateLimit-* headers
    message: 'Too many requests, please try again later.',
  }),

  // 2️⃣ Auth-specific limiter (tighter for login/signup)
  authLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // only 10 attempts per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many auth attempts, please try again after 15 minutes.',
  }),
};
