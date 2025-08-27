const axios = require('axios');

// reCAPTCHA verification middleware
const verifyRecaptcha = async (req, res, next) => {
    try {
        const { recaptchaToken } = req.body;
        
        if (!recaptchaToken) {
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA token is required'
            });
        }
        
        // Verify the token with Google
        const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        
        if (!secretKey) {
            console.error('RECAPTCHA_SECRET_KEY not configured');
            return res.status(500).json({
                success: false,
                message: 'reCAPTCHA configuration error'
            });
        }
        
        const verificationResponse = await axios.post(verificationUrl, null, {
            params: {
                secret: secretKey,
                response: recaptchaToken
            }
        });
        
        const { success, score, action } = verificationResponse.data;
        
        if (!success) {
            console.log('reCAPTCHA verification failed:', verificationResponse.data);
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification failed. Please try again.'
            });
        }
        
        // For v2 checkbox, success is sufficient
        // For v3, you might want to check score and action
        if (score !== undefined && score < 0.5) {
            console.log('reCAPTCHA score too low:', score);
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification failed. Please try again.'
            });
        }
        
        // Add verification result to request for logging
        req.recaptchaResult = {
            success: true,
            score: score,
            action: action
        };
        
        next();
        
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'reCAPTCHA verification error. Please try again.'
        });
    }
};

module.exports = {
    verifyRecaptcha
};
