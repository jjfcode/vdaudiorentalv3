#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 VD Audio Rental Backend Startup Check');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envProductionPath = path.join(__dirname, '.env.production');

if (!fs.existsSync(envPath) && !fs.existsSync(envProductionPath)) {
    console.log('❌ No environment file found!');
    console.log('📝 Please create one of the following files:\n');
    
    console.log('For Development (recommended for local work):');
    console.log('1. Copy env.example to .env');
    console.log('2. Fill in your email credentials\n');
    
    console.log('For Production:');
    console.log('1. Copy production-config.env to .env.production');
    console.log('2. Fill in your production values\n');
    
    console.log('🔧 Setup Instructions:');
    console.log('1. Copy env.example to .env for development');
    console.log('2. Fill in your email credentials');
    console.log('3. Set your JWT secret');
    console.log('4. Configure CORS origins\n');
    
    console.log('💡 For Gmail setup:');
    console.log('- Enable 2-factor authentication');
    console.log('- Generate an App Password');
    console.log('- Use the App Password in EMAIL_PASS\n');
    
    process.exit(1);
}

// Load environment variables
if (fs.existsSync(envProductionPath)) {
    require('dotenv').config({ path: envProductionPath });
    console.log('📁 Production environment file loaded (.env.production)');
} else {
    require('dotenv').config();
    console.log('📁 Development environment file loaded (.env)');
}

// Import configuration
const { config, isProduction, isDevelopment, validateConfig } = require('./config/environment');

console.log(`🌍 Environment detected: ${config.nodeEnv}`);
console.log(`🚀 Port: ${config.port}\n`);

// Check required environment variables
const requiredVars = [
    'EMAIL_USER',
    'EMAIL_PASS',
    'JWT_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    console.log('\n📝 Please update your environment file and try again.\n');
    process.exit(1);
}

// Check email configuration
console.log('✅ Environment variables loaded successfully');
console.log('📧 Email configuration:');
console.log(`   Host: ${config.email.host}`);
console.log(`   Port: ${config.email.port}`);
console.log(`   User: ${config.email.user}`);
console.log(`   From: ${config.email.from}`);
console.log(`   To: ${config.email.to}\n`);

// Check security settings
console.log('🔒 Security configuration:');
console.log(`   JWT Secret: ${config.jwtSecret ? '✅ Set' : '❌ Missing'}`);
console.log(`   Bcrypt Rounds: ${config.bcryptRounds}\n`);

// Check CORS configuration
console.log('🌍 CORS configuration:');
console.log(`   Allowed origins: ${config.cors.origins.join(', ')}\n`);

// Check rate limiting
console.log('⚡ Rate limiting:');
console.log(`   Max requests: ${config.rateLimit.max} per ${Math.round(config.rateLimit.windowMs / 1000 / 60)} minutes\n`);

// Check logging configuration
console.log('📝 Logging configuration:');
console.log(`   Level: ${config.logging.level}`);
console.log(`   Debug enabled: ${config.logging.enableDebug}`);
console.log(`   Stack traces: ${config.logging.showStackTraces}\n`);

console.log('✅ All checks passed! Starting server...\n');

// Start the server
require('./server');
