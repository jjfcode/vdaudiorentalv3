@echo off
echo 🚀 VD Audio Rental Backend - Windows Startup
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo 💡 Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo ✅ Dependencies ready
echo.

REM Check environment file
if not exist ".env" (
    if not exist ".env.production" (
        echo ❌ No environment file found!
        echo.
        echo 📝 Please create one of the following:
        echo   1. Copy env.example to .env for development
        echo   2. Copy production-config.env to .env.production for production
        echo.
        echo 💡 Or run: npm run deploy
        echo.
        pause
        exit /b 1
    ) else (
        echo 📁 Production environment detected
        set NODE_ENV=production
    )
) else (
    echo 📁 Development environment detected
    set NODE_ENV=development
)

echo.
echo 🚀 Starting server...
echo 🌍 Environment: %NODE_ENV%
echo.

REM Start the server
if "%NODE_ENV%"=="production" (
    npm run start:prod
) else (
    npm run dev
)

pause
