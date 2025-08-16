# VD Audio Rental - Secure Backend System

A secure, production-ready Node.js backend for handling contact form submissions with comprehensive security features.

## 🚀 Features

- **🔒 Enterprise Security**: Helmet, CORS, Rate Limiting, Input Validation
- **📧 Professional Email**: Nodemailer with HTML templates and auto-responses
- **🛡️ Anti-Spam**: Rate limiting, input sanitization, XSS protection
- **📊 Monitoring**: Request logging, error tracking, health checks
- **🌍 Production Ready**: Environment configuration, graceful shutdown

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Email service (Gmail, Outlook, etc.)

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

3. **Configure email settings:**
   - For Gmail: Enable 2FA and generate App Password
   - For other providers: Use appropriate SMTP settings

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=contact@vdaudiorentals.com

# Security
JWT_SECRET=your-super-secret-key
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# CORS
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

### Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Direct Server Start
```bash
npm run server
```

## 📡 API Endpoints

### Contact Form Submission
```
POST /api/contact/submit
```

**Request Body:**
```json
{
  "name": "John Doe",
  "company": "Audio Company",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Hello, I need audio equipment...",
  "contactPreference": "email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "data": {
    "name": "John Doe",
    "company": "Audio Company",
    "email": "john@example.com",
    "submittedAt": "2025-01-27T10:30:00.000Z"
  }
}
```

### Health Check
```
GET /api/health
```

### Contact API Status
```
GET /api/contact/status
```

## 🔒 Security Features

### Input Validation & Sanitization
- **XSS Protection**: HTML tag removal, script injection prevention
- **SQL Injection Protection**: Pattern detection and blocking
- **Input Length Limits**: Prevents buffer overflow attempts
- **Character Whitelisting**: Only allows safe characters

### Rate Limiting
- **Contact Form**: 3 submissions per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP
- **Gradual Slowdown**: Progressive response delays for abuse

### Security Headers
- **Helmet**: Comprehensive security headers
- **CORS**: Configurable cross-origin restrictions
- **HSTS**: HTTPS enforcement
- **CSP**: Content Security Policy

## 📧 Email Features

### Admin Notification
- Professional HTML template
- Complete contact information
- Submission metadata (IP, timestamp, user agent)
- Branded with VD Audio Rental styling

### User Auto-Response
- Confirmation email with message preview
- Next steps explanation
- Contact information and business hours
- Professional branding and styling

## 🐛 Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "message": "Too many contact form submissions. Please wait 15 minutes before trying again.",
  "retryAfter": 15,
  "error": "RATE_LIMIT_EXCEEDED"
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 📊 Monitoring & Logging

### Request Logging
- Timestamp, method, path, IP address
- User agent information
- Response status codes

### Error Tracking
- Detailed error logging
- Stack traces (development only)
- Error categorization and handling

### Health Monitoring
- Server uptime tracking
- API endpoint status
- Environment information

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production email service
3. Set strong JWT secret
4. Configure CORS origins for production domain

### Security Considerations
- Use HTTPS in production
- Set secure cookie options
- Enable HSTS
- Configure proper CORS origins

### Performance
- Enable compression
- Set appropriate rate limits
- Monitor server resources
- Use PM2 or similar process manager

## 🔧 Troubleshooting

### Common Issues

**Email not sending:**
- Check SMTP credentials
- Verify 2FA and App Password setup
- Check firewall/network restrictions

**Rate limiting too strict:**
- Adjust `RATE_LIMIT_MAX_REQUESTS` in .env
- Modify rate limiting middleware

**CORS errors:**
- Update `CORS_ORIGIN` in .env
- Check frontend domain configuration

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## 📝 License

This backend system is part of the VD Audio Rental website project.

## 🤝 Support

For technical support or questions about the backend system, please contact the development team.
