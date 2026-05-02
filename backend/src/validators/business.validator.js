const { body } = require('express-validator');

const businessRegisterRules = [
    body('business_type')
        .isIn(['restaurant', 'hotel'])
        .withMessage('Business type must be either restaurant or hotel'),

    body('business_name')
        .trim()
        .notEmpty()
        .withMessage('Business name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Business name must be between 2 and 100 characters'),

    body('full_name')
        .trim()
        .notEmpty()
        .withMessage('Owner full name is required'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('phone_primary')
        .trim()
        .notEmpty()
        .withMessage('Primary phone number is required')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),

    body('city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),

    body('pincode')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('Pincode must be 6 digits')
        .isNumeric()
        .withMessage('Pincode must be numeric'),

    body('gst_number')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 15, max: 15 })
        .withMessage('GST number must be exactly 15 characters'),
];

const businessLoginRules = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
];

module.exports = {
    businessRegisterRules,
    businessLoginRules,
};
