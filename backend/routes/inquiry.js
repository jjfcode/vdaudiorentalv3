const express = require('express');
const { body, validationResult } = require('express-validator');
const inquiryController = require('../controllers/inquiryController');
const { validateInquiryForm } = require('../middleware/validation');
const { rateLimitInquiry } = require('../middleware/rateLimit');
const { verifyRecaptcha } = require('../middleware/recaptcha');

const router = express.Router();

// Equipment inquiry submission with validation, rate limiting, and reCAPTCHA
router.post('/', 
    rateLimitInquiry,
    verifyRecaptcha,
    validateInquiryForm,
    inquiryController.submitInquiry
);

// Get inquiry form status (for checking if backend is accessible)
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Equipment Inquiry API is operational',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
