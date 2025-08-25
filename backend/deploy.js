#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 VD Audio Rental - Deployment Script');
console.log('=====================================\n');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ This script must be run from the backend directory');
    process.exit(1);
}

// Check current environment
const envPath = path.join(__dirname, '.env');
const envProductionPath = path.join(__dirname, '.env.production');
const productionConfigPath = path.join(__dirname, 'production-config.env');

console.log('📁 Checking environment files...');

if (fs.existsSync(envProductionPath)) {
    console.log('✅ Production environment file (.env.production) found');
    console.log('🌍 Current environment: PRODUCTION');
} else if (fs.existsSync(envPath)) {
    console.log('✅ Development environment file (.env) found');
    console.log('🌍 Current environment: DEVELOPMENT');
} else {
    console.log('❌ No environment files found');
    process.exit(1);
}

console.log('\n🔧 Deployment Options:');
console.log('1. Switch to PRODUCTION mode');
console.log('2. Switch to DEVELOPMENT mode');
console.log('3. Create production environment file');
console.log('4. Validate current configuration');
console.log('5. Exit\n');

// Simple CLI interaction
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Select an option (1-5): ', (answer) => {
    switch(answer.trim()) {
        case '1':
            switchToProduction();
            break;
        case '2':
            switchToDevelopment();
            break;
        case '3':
            createProductionEnv();
            break;
        case '4':
            validateConfiguration();
            break;
        case '5':
            console.log('👋 Goodbye!');
            rl.close();
            break;
        default:
            console.log('❌ Invalid option. Please select 1-5.');
            rl.close();
    }
});

function switchToProduction() {
    console.log('\n🔄 Switching to PRODUCTION mode...');
    
    if (!fs.existsSync(envProductionPath)) {
        console.log('❌ Production environment file (.env.production) not found');
        console.log('💡 Please create it first using option 3');
        rl.close();
        return;
    }
    
    // Set NODE_ENV to production
    process.env.NODE_ENV = 'production';
    
    console.log('✅ Environment set to PRODUCTION');
    console.log('🚀 You can now start the server with: npm run start:prod');
    console.log('📝 Or manually set NODE_ENV=production before starting');
    
    rl.close();
}

function switchToDevelopment() {
    console.log('\n🔄 Switching to DEVELOPMENT mode...');
    
    if (!fs.existsSync(envPath)) {
        console.log('❌ Development environment file (.env) not found');
        console.log('💡 Please create it first using option 3');
        rl.close();
        return;
    }
    
    // Set NODE_ENV to development
    process.env.NODE_ENV = 'development';
    
    console.log('✅ Environment set to DEVELOPMENT');
    console.log('🚀 You can now start the server with: npm run dev');
    console.log('📝 Or manually set NODE_ENV=development before starting');
    
    rl.close();
}

function createProductionEnv() {
    console.log('\n📝 Creating production environment file...');
    
    if (fs.existsSync(envProductionPath)) {
        console.log('⚠️  Production environment file already exists');
        rl.question('Overwrite? (y/N): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
                createFile();
            } else {
                console.log('❌ Operation cancelled');
                rl.close();
            }
        });
    } else {
        createFile();
    }
    
    function createFile() {
        try {
            // Read the production config template
            const template = fs.readFileSync(productionConfigPath, 'utf8');
            
            // Create .env.production
            fs.writeFileSync(envProductionPath, template);
            
            console.log('✅ Production environment file (.env.production) created');
            console.log('📝 Please edit it with your actual production values');
            console.log('🔑 Important: Change all placeholder values!');
            
        } catch (error) {
            console.error('❌ Error creating production environment file:', error.message);
        }
        
        rl.close();
    }
}

function validateConfiguration() {
    console.log('\n🔍 Validating current configuration...');
    
    try {
        // Import configuration
        const { config, validateConfig } = require('./config/environment');
        
        // Validate
        validateConfig(config);
        
        console.log('✅ Configuration is valid!');
        console.log('\n📊 Current settings:');
        console.log(`   Environment: ${config.nodeEnv}`);
        console.log(`   Port: ${config.port}`);
        console.log(`   CORS Origins: ${config.cors.origins.join(', ')}`);
        console.log(`   Rate Limit: ${config.rateLimit.max} requests per ${Math.round(config.rateLimit.windowMs / 1000 / 60)} minutes`);
        console.log(`   Log Level: ${config.logging.level}`);
        
    } catch (error) {
        console.error('❌ Configuration validation failed:', error.message);
    }
    
    rl.close();
}
