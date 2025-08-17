const { body, validationResult } = require('express-validator');

// Contact form validation rules
const contactValidationRules = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s\-'\.]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods')
        .escape()
        .customSanitizer(value => {
            // Remove any remaining HTML tags
            return value.replace(/<[^>]*>/g, '');
        }),

    body('company')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name must be between 2 and 100 characters')
        .escape()
        .customSanitizer(value => {
            return value.replace(/<[^>]*>/g, '');
        }),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .isLength({ max: 254 })
        .withMessage('Email address is too long')
        .normalizeEmail()
        .customSanitizer(value => {
            return value.toLowerCase();
        }),

    body('phone')
        .trim()
        .isLength({ min: 8, max: 20 })
        .withMessage('Phone number must be between 8 and 20 characters')
        .matches(/^[\+]?[\d\s\-\(\)\.]+$/)
        .withMessage('Phone number contains invalid characters')
        .customSanitizer(value => {
            // Remove all non-digit characters except +, -, (, ), spaces, and periods
            return value.replace(/[^\d\+\-\(\)\s\.]/g, '');
        }),

    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters')
        .escape()
        .customSanitizer(value => {
            // Remove HTML tags and URLs
            let sanitized = value.replace(/<[^>]*>/g, '');
            sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL]');
            return sanitized;
        }),

    body('contactPreference')
        .optional()
        .isIn(['email', 'phone', 'whatsapp', 'sms'])
        .withMessage('Invalid contact preference')
];

// Middleware to validate contact form
const validateContactForm = [
    ...contactValidationRules,
    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg,
                    value: error.value
                }))
            });
        }

        // Additional security checks
        const { name, company, email, phone, message } = req.body;
        
        // Check for suspicious patterns
        const suspiciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /union\s+select/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
        ];

        const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
            pattern.test(name) || pattern.test(company) || 
            pattern.test(email) || pattern.test(phone) || pattern.test(message)
        );

        if (hasSuspiciousContent) {
            return res.status(400).json({
                success: false,
                message: 'Suspicious content detected',
                error: 'SECURITY_VIOLATION'
            });
        }

        // Check for excessive repeated characters
        const hasExcessiveRepeats = (text) => {
            return /(.)\1{10,}/.test(text);
        };

        if (hasExcessiveRepeats(name) || hasExcessiveRepeats(company) || 
            hasExcessiveRepeats(message)) {
            return res.status(400).json({
                success: false,
                message: 'Input contains excessive repeated characters',
                error: 'VALIDATION_ERROR'
            });
        }

        next();
    }
];

// Equipment inquiry validation rules
const inquiryValidationRules = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s\-'\.]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods')
        .escape()
        .customSanitizer(value => {
            return value.replace(/<[^>]*>/g, '');
        }),

    body('company')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name must be between 2 and 100 characters')
        .escape()
        .customSanitizer(value => {
            return value.replace(/<[^>]*>/g, '');
        }),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .isLength({ max: 254 })
        .withMessage('Email address is too long')
        .normalizeEmail()
        .customSanitizer(value => {
            return value.toLowerCase();
        }),

    body('phone')
        .trim()
        .isLength({ min: 8, max: 20 })
        .withMessage('Phone number must be between 8 and 20 characters')
        .matches(/^[\+]?[\d\s\-\(\)\.]+$/)
        .withMessage('Phone number contains invalid characters')
        .customSanitizer(value => {
            return value.replace(/[^\d\+\-\(\)\s\.]/g, '');
        }),

    body('message')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters')
        .escape()
        .customSanitizer(value => {
            let sanitized = value.replace(/<[^>]*>/g, '');
            sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL]');
            return sanitized;
        }),

    body('equipment_id')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Equipment ID is too long')
        .escape(),

    body('equipment_name')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Equipment name must be between 2 and 200 characters')
        .escape()
        .customSanitizer(value => {
            return value.replace(/<[^>]*>/g, '');
        }),

    body('equipment_price')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Equipment price is too long')
        .escape(),

    body('inquiry_type')
        .optional()
        .trim()
        .isIn(['equipment_inquiry', 'general_inquiry'])
        .withMessage('Invalid inquiry type')
];

// Middleware to validate inquiry form
const validateInquiryForm = [
    ...inquiryValidationRules,
    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg,
                    value: error.value
                }))
            });
        }

        // Additional security checks
        const { name, company, email, phone, message, equipment_name } = req.body;
        
        // Check for suspicious patterns
        const suspiciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /union\s+select/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
        ];

        const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
            pattern.test(name) || pattern.test(company) || 
            pattern.test(email) || pattern.test(phone) || 
            pattern.test(message) || pattern.test(equipment_name)
        );

        if (hasSuspiciousContent) {
            return res.status(400).json({
                success: false,
                message: 'Suspicious content detected',
                error: 'SECURITY_VIOLATION'
            });
        }

        // Check for excessive repeated characters
        const hasExcessiveRepeats = (text) => {
            return /(.)\1{10,}/.test(text);
        };

        if (hasExcessiveRepeats(name) || hasExcessiveRepeats(company) || 
            hasExcessiveRepeats(message) || hasExcessiveRepeats(equipment_name)) {
            return res.status(400).json({
                success: false,
                message: 'Input contains excessive repeated characters',
                error: 'VALIDATION_ERROR'
            });
        }

        next();
    }
];

module.exports = {
    validateContactForm,
    validateInquiryForm,
    contactValidationRules,
    inquiryValidationRules
};
