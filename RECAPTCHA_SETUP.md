# reCAPTCHA Setup Guide for VD Audio Rental

## Overview
This guide explains how to set up Google reCAPTCHA v2 for the equipment inquiry form to prevent spam and bot submissions.

## Prerequisites
- Google account
- Access to Google reCAPTCHA admin console

## Step 1: Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to add a new site
3. Fill in the form:
   - **Label**: VD Audio Rental Equipment Inquiry
   - **reCAPTCHA type**: Select "reCAPTCHA v2" → "I'm not a robot" Checkbox
   - **Domains**: Add your domain(s):
     - `localhost` (for development)
     - `yourdomain.com` (for production)
     - `www.yourdomain.com` (for production)
4. Accept the terms and click "Submit"
5. Copy both the **Site Key** and **Secret Key**

## Step 2: Configure Environment Variables

Create or update your `.env` file in the `backend/` directory:

```bash
# reCAPTCHA Configuration
RECAPTCHA_SITE_KEY=your-actual-site-key-here
RECAPTCHA_SECRET_KEY=your-actual-secret-key-here
```

## Step 3: Update Frontend Site Key

In `index.html`, replace the placeholder with your actual site key:

```html
<div class="g-recaptcha" data-sitekey="YOUR_ACTUAL_SITE_KEY_HERE"></div>
```

## Step 4: Test the Integration

1. Start your backend server
2. Open the equipment inquiry form
3. Verify the reCAPTCHA widget appears
4. Test form submission with and without completing reCAPTCHA
5. Check backend logs for verification results

## Security Features

- **Bot Protection**: Prevents automated form submissions
- **Rate Limiting**: Combined with existing rate limiting middleware
- **Verification Logging**: All reCAPTCHA results are logged and included in admin emails
- **CSP Headers**: Content Security Policy updated to allow reCAPTCHA scripts

## Troubleshooting

### reCAPTCHA Widget Not Loading
- Check if the site key is correct
- Verify the domain is added to reCAPTCHA admin console
- Check browser console for JavaScript errors

### Verification Failing
- Ensure the secret key is correct in environment variables
- Check backend logs for verification errors
- Verify the reCAPTCHA token is being sent in the request

### CSP Errors
- The server.js has been updated to allow reCAPTCHA domains
- If you see CSP violations, check the helmet configuration

## Production Deployment

1. Update your production environment variables
2. Ensure your production domain is added to reCAPTCHA admin console
3. Test the form on production before going live
4. Monitor logs for any verification issues

## API Endpoints

The inquiry endpoint now requires a `recaptchaToken` in the request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "equipment_name": "Yamaha CL5",
  "recaptchaToken": "03AGdBq24..."
}
```

## Support

If you encounter issues:
1. Check the backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple reCAPTCHA verification first
4. Check Google reCAPTCHA status page for any service issues
