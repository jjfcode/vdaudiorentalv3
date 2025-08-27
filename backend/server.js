const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const path = require('path');

// Import configuration
const { config, isProduction, validateConfig } = require('./config/environment');

// Validate configuration
try {
    validateConfig(config);
} catch (error) {
    console.error('❌ Configuration error:', error.message);
    process.exit(1);
}

const app = express();
const PORT = config.port;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Import routes
const contactRoutes = require('./routes/contact');
const inquiryRoutes = require('./routes/inquiry');

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://www.google.com", "https://www.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'self'", "https://www.google.com"],
            objectSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS Configuration
const corsOptions = {
    origin: config.cors.origins,
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Trust proxy for accurate IP detection
    trustProxy: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60)
        });
    }
});

// Speed Limiting (gradual slowdown)
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes, then...
    delayMs: 500 // begin adding 500ms of delay per request above 50
});

// Apply rate limiting only to API routes
app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// Body parsing middleware
app.use(express.json({ limit: config.performance.bodyParserLimit }));
app.use(express.urlencoded({ extended: true, limit: config.performance.bodyParserLimit }));

// Request logging middleware
app.use((req, res, next) => {
    if (config.logging.enableDebug) {
        const timestamp = new Date().toISOString();
        const realIP = req.ip || req.connection.remoteAddress;
        const forwardedIP = req.get('X-Forwarded-For');
        console.log(`[${timestamp}] ${req.method} ${req.path} - Real IP: ${realIP} - Forwarded: ${forwardedIP} - User-Agent: ${req.get('User-Agent')}`);
    }
    next();
});

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/inquiry', inquiryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'VD Audio Rental Backend is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Simple healthcheck for Render
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// Handle frontend routes for specific pages
app.get('/speakers', (req, res) => {
    if (config.logging.enableDebug) {
        console.log(`[Frontend Route] Serving speakers.html for: ${req.path}`);
    }
    res.sendFile(path.join(__dirname, '..', 'pages', 'speakers.html'));
});

app.get('/mixers', (req, res) => {
    if (config.logging.enableDebug) {
        console.log(`[Frontend Route] Serving mixers.html for: ${req.path}`);
    }
    res.sendFile(path.join(__dirname, '..', 'pages', 'mixers.html'));
});

app.get('/outboard', (req, res) => {
    if (config.logging.enableDebug) {
        console.log(`[Frontend Route] Serving outboard.html for: ${req.path}`);
    }
    res.sendFile(path.join(__dirname, '..', 'pages', 'outboard.html'));
});

app.get('/wireless', (req, res) => {
    if (config.logging.enableDebug) {
        console.log(`[Frontend Route] Serving wireless.html for: ${req.path}`);
    }
    res.sendFile(path.join(__dirname, '..', 'pages', 'wireless.html'));
});

app.get('/wired', (req, res) => {
    if (config.logging.enableDebug) {
        console.log(`[Frontend Route] Serving wired.html for: ${req.path}`);
    }
    res.sendFile(path.join(__dirname, '..', 'pages', 'wired.html'));
});

app.get('/snakes', (req, res) => {
    if (config.logging.enableDebug) {
        console.log(`[Frontend Route] Serving snakes.html for: ${req.path}`);
    }
    res.sendFile(path.join(__dirname, '..', 'pages', 'snakes.html'));
});

app.get('/players', (req, res) => {
    if (config.logging.enableDebug) {
        console.log(`[Frontend Route] Serving players.html for: ${req.path}`);
    }
    res.sendFile(path.join(__dirname, '..', 'pages', 'players.html'));
});

app.get('/intercom', (req, res) => {
    if (config.logging.enableDebug) {
        console.log(`[Frontend Route] Serving intercom.html for: ${req.path}`);
    }
    res.sendFile(path.join(__dirname, '..', 'pages', 'intercom.html'));
});

app.get('/iem', (req, res) => {
    if (config.logging.enableDebug) {
        console.log(`[Frontend Route] Serving iem.html for: ${req.path}`);
    }
    res.sendFile(path.join(__dirname, '..', 'pages', 'iem.html'));
});

// Catch-all route for other frontend routes
app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // For all other routes, serve the main index.html
    if (config.logging.enableDebug) {
        console.log(`[Frontend Route] Serving index.html for: ${req.path}`);
    }
    
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    // Don't expose internal errors in production
    const message = isProduction ? 'Internal server error' : err.message;
    
    res.status(err.status || 500).json({
        success: false,
        message: message,
        ...(config.logging.showStackTraces && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 VD Audio Rental Backend running on port ${PORT}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
    console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
    console.log(`🔍 Inquiry API: http://localhost:${PORT}/api/inquiry`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 CORS Origins: ${config.cors.origins.join(', ')}`);
    console.log(`📊 Rate Limit: ${config.rateLimit.max} requests per ${Math.round(config.rateLimit.windowMs / 1000 / 60)} minutes`);
    console.log(`🔍 Log Level: ${config.logging.level}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app; 