const rateLimit = require('express-rate-limit');

// Contact form specific rate limiting
const rateLimitContact = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 contact form submissions per 15 minutes
    message: {
        success: false,
        message: 'Too many contact form submissions. Please wait 15 minutes before trying again.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many contact form submissions. Please wait 15 minutes before trying again.',
            retryAfter: 15,
            error: 'RATE_LIMIT_EXCEEDED'
        });
    },
    // Skip rate limiting for certain conditions (optional)
    skip: (req) => {
        // Skip rate limiting for health checks or admin routes
        return req.path === '/health' || req.path === '/status';
    },
    // Use the recommended key generator for IPv6 compatibility
    keyGenerator: (req) => {
        // Use the ipKeyGenerator helper for IPv6 compatibility
        const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent')?.substring(0, 50) || 'unknown';
        return `${ip}-${userAgent}`;
    },
    // Custom headers
    headers: true,
    // Store rate limit info in response headers
    standardHeaders: true,
    legacyHeaders: false
});

// General API rate limiting (more permissive)
const rateLimitAPI = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per 15 minutes
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Slow down middleware for gradual throttling
const slowDownAPI = require('express-slow-down')({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes, then...
    delayMs: () => 500 // Fixed: use simple function for v2 compatibility
});

module.exports = {
    rateLimitContact,
    rateLimitAPI,
    slowDownAPI
};
