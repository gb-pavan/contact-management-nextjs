const rateLimit = require('express-rate-limit');

// Create a rate limiter for login and registration endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes."
});

module.exports = authLimiter;
