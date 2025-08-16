#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 VD Audio Rental Backend Startup Check');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('📝 Please create a .env file with the following variables:\n');
    
    const envExample = fs.readFileSync(path.join(__dirname, 'env.example'), 'utf8');
    console.log(envExample);
    
    console.log('\n🔧 Setup Instructions:');
    console.log('1. Copy env.example to .env');
    console.log('2. Fill in your email credentials');
    console.log('3. Set your JWT secret');
    console.log('4. Configure CORS origins\n');
    
    console.log('💡 For Gmail setup:');
    console.log('- Enable 2-factor authentication');
    console.log('- Generate an App Password');
    console.log('- Use the App Password in EMAIL_PASS\n');
    
    process.exit(1);
}

// Check required environment variables
require('dotenv').config();
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
    console.log('\n📝 Please update your .env file and try again.\n');
    process.exit(1);
}

// Check email configuration
console.log('✅ Environment variables loaded successfully');
console.log('📧 Email configuration:');
console.log(`   Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
console.log(`   Port: ${process.env.EMAIL_PORT || 587}`);
console.log(`   User: ${process.env.EMAIL_USER}`);
console.log(`   From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
console.log(`   To: ${process.env.EMAIL_TO || 'contact@vdaudiorentals.com'}\n`);

// Check security settings
console.log('🔒 Security configuration:');
console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`   Bcrypt Rounds: ${process.env.BCRYPT_ROUNDS || 12}`);
console.log(`   Rate Limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${Math.round((process.env.RATE_LIMIT_WINDOW_MS || 900000) / 1000 / 60)} minutes\n`);

// Check CORS configuration
console.log('🌍 CORS configuration:');
const corsOrigins = process.env.CORS_ORIGIN ? 
    process.env.CORS_ORIGIN.split(',') : 
    ['http://localhost:3000', 'http://localhost:5000'];
console.log(`   Allowed origins: ${corsOrigins.join(', ')}\n`);

console.log('✅ All checks passed! Starting server...\n');

// Start the server
require('./server');
