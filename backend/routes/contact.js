const express = require('express');
const { body, validationResult } = require('express-validator');
const contactController = require('../controllers/contactController');
const { validateContactForm } = require('../middleware/validation');
const { rateLimitContact } = require('../middleware/rateLimit');
const { verifyRecaptcha } = require('../middleware/recaptcha');

const router = express.Router();

// Contact form submission with validation, rate limiting, and reCAPTCHA
router.post('/submit', 
    rateLimitContact,
    verifyRecaptcha,
    validateContactForm,
    contactController.submitContactForm
);

// Get contact form status (for checking if backend is accessible)
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Contact API is operational',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
