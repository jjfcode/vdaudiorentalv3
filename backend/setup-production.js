#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Setting up VD Audio Rental Production Environment...\n');

// Check if .env.production already exists
const envPath = path.join(__dirname, '.env.production');
if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.production already exists. Backing up to .env.production.backup');
    fs.copyFileSync(envPath, path.join(__dirname, '.env.production.backup'));
}

// Read the template
const templatePath = path.join(__dirname, 'production-config.env');
if (!fs.existsSync(templatePath)) {
    console.error('❌ production-config.env template not found!');
    process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');

// Generate secure JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Replace placeholders with generated values
let productionEnv = template
    .replace('your-super-secure-jwt-secret-key-here', jwtSecret)
    .replace('yourdomain.com', 'yourdomain.com') // Keep this for manual editing
    .replace('your-email@gmail.com', 'your-email@gmail.com') // Keep this for manual editing
    .replace('your-app-password', 'your-app-password'); // Keep this for manual editing

// Write the production environment file
fs.writeFileSync(envPath, productionEnv);

console.log('✅ .env.production created successfully!');
console.log('🔐 JWT secret generated automatically');
console.log('\n📝 IMPORTANT: You need to manually edit the following values:');
console.log('   - CORS_ORIGIN: Set to your actual domain(s)');
console.log('   - EMAIL_USER: Your email address');
console.log('   - EMAIL_PASS: Your email app password');
console.log('   - EMAIL_FROM: Your sender email address');
console.log('   - EMAIL_TO: Your contact email address');
console.log('\n🔒 Security note: JWT secret has been automatically generated');
console.log('\n🚀 Ready to deploy! Run: npm run start:prod');

