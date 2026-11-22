const rateLimit = require('express-rate-limit');

// Strict rate limiter for login attempts (10 requests per 15 minutes per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

// Strict rate limiter for account registrations (5 accounts per hour per IP)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many accounts registered from this IP. Please try again after an hour.'
  }
});

module.exports = {
  loginLimiter,
  registerLimiter
};
