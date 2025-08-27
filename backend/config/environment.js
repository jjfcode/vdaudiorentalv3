const path = require('path');
require('dotenv').config();

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Base configuration
const baseConfig = {
    // Server
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Security
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    
    // reCAPTCHA
    recaptcha: {
        siteKey: process.env.RECAPTCHA_SITE_KEY || 'your-recaptcha-site-key',
        secretKey: process.env.RECAPTCHA_SECRET_KEY || 'your-recaptcha-secret-key'
    },
    
    // Email
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || 'contact@vdaudiorentals.com'
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (isProduction ? 100 : 1000)
    },
    
    // CORS
    cors: {
        origins: process.env.CORS_ORIGIN ? 
            process.env.CORS_ORIGIN.split(',') : 
            (isProduction ? 
                ['https://yourdomain.com', 'https://www.yourdomain.com'] :
                ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5502', 'http://localhost:5502']
            )
    },
    
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
        filePath: process.env.LOG_FILE_PATH || (isProduction ? './logs/production.log' : './logs/development.log'),
        enableDebug: process.env.ENABLE_DEBUG_LOGGING === 'true' || isDevelopment,
        showStackTraces: process.env.SHOW_STACK_TRACES === 'true' || isDevelopment
    },
    
    // Performance
    performance: {
        bodyParserLimit: process.env.BODY_PARSER_LIMIT || '10mb',
        requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000
    }
};

// Environment-specific overrides
const environmentConfig = {
    development: {
        ...baseConfig,
        cors: {
            ...baseConfig.cors,
            origins: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5502', 'http://localhost:5502']
        },
        logging: {
            ...baseConfig.logging,
            level: 'debug',
            enableDebug: true,
            showStackTraces: true
        }
    },
    
    production: {
        ...baseConfig,
        cors: {
            ...baseConfig.cors,
            origins: process.env.CORS_ORIGIN ? 
                process.env.CORS_ORIGIN.split(',') : 
                ['https://yourdomain.com', 'https://www.yourdomain.com']
        },
        logging: {
            ...baseConfig.logging,
            level: 'info',
            enableDebug: false,
            showStackTraces: false
        }
    }
};

// Get current environment config
const getConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    return environmentConfig[env] || environmentConfig.development;
};

// Validate required configuration
const validateConfig = (config) => {
    const required = ['email.user', 'email.pass', 'jwtSecret', 'recaptcha.secretKey'];
    const missing = [];
    
    required.forEach(field => {
        const value = field.split('.').reduce((obj, key) => obj && obj[key], config);
        if (!value) {
            missing.push(field);
        }
    });
    
    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
    
    return true;
};

// Export configuration
module.exports = {
    config: getConfig(),
    isProduction,
    isDevelopment,
    validateConfig,
    getConfig
};
