# 🚀 Production Environment Setup Guide

This guide will help you set up your VD Audio Rental backend for production deployment.

## 📋 Prerequisites

- Node.js 16+ installed
- Access to your production server
- Email service credentials (Gmail, SendGrid, etc.)
- Domain name for CORS configuration

## 🔧 Quick Setup

### 1. Run the Setup Script

```bash
npm run setup:prod
```

This will:
- Create a `.env.production` file
- Generate a secure JWT secret
- Set up the basic production configuration

### 2. Configure Email Settings

Edit `.env.production` and update these values:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO=contact@vdaudiorentals.com
```

**Important**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" (not your regular password)
3. Use the app password in `EMAIL_PASS`

### 3. Configure CORS

Update the `CORS_ORIGIN` in `.env.production`:

```bash
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### 4. Start Production Server

```bash
npm run start:prod
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.production` to version control
- Use strong, unique passwords
- Rotate JWT secrets regularly

### Rate Limiting
- Current settings: 100 requests per 15 minutes per IP
- Adjust based on your traffic patterns
- Monitor for abuse

### CORS
- Only allow your actual domains
- Don't use wildcards (`*`) in production

## 📧 Email Configuration Examples

### Gmail
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### AWS SES
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-ses-smtp-username
EMAIL_PASS=your-ses-smtp-password
```

## 🚀 Deployment Options

### PM2 (Recommended)
```bash
npm install -g pm2
pm2 start start.js --name "vd-audio-rental" --env production
pm2 startup
pm2 save
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Systemd Service
Create `/etc/systemd/system/vd-audio-rental.service`:

```ini
[Unit]
Description=VD Audio Rental Backend
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/path/to/your/app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node start.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## 📊 Monitoring & Logging

### Health Check
Your server includes a health check endpoint:
```
GET /api/health
```

### Logs
- Application logs go to console
- Consider using a log aggregation service
- Monitor for errors and performance issues

## 🔧 Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP credentials
   - Verify firewall settings
   - Check email service limits

2. **CORS errors**
   - Verify `CORS_ORIGIN` settings
   - Check domain spelling
   - Ensure HTTPS is used in production

3. **Rate limiting too strict**
   - Adjust `RATE_LIMIT_MAX_REQUESTS`
   - Monitor actual traffic patterns

### Testing Production

You can test production mode locally:
```bash
NODE_ENV=production npm start
```

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Test email configuration separately
4. Check server firewall and network settings

---

**Remember**: Always test in a staging environment before deploying to production!

