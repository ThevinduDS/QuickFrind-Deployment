// backend/src/config/rateLimiter.js
const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
    points: 5,           // Maximum of 5 login attempts
    duration: 60 * 15,   // Per 15 minutes
});

module.exports = rateLimiter;
