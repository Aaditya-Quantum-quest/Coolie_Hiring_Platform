const { body } = require('express-validator')

// -------------------------------------------
// CUSTOMER REGISTRATION RULES
// -------------------------------------------
const customerRegisterRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Must be a valid 10-digit Indian mobile number'),

    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('City name too long'),
]

const customerLoginRules = [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
]

// -------------------------------------------
// COOLIE REGISTRATION RULES
// -------------------------------------------
const coolieRegisterRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must have at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must have at least one number'),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Must be a valid 10-digit Indian mobile number'),

    body('alt_phone')
        .optional({ checkFalsy: true })
        .matches(/^[6-9]\d{9}$/).withMessage('Alternate phone must be a valid 10-digit Indian mobile number'),

    body('date_of_birth')
        .notEmpty().withMessage('Date of birth is required')
        .isDate({ format: 'YYYY-MM-DD' }).withMessage('Date of birth must be in YYYY-MM-DD format')
        .custom((value) => {
            const dob = new Date(value)
            const today = new Date()
            const age = today.getFullYear() - dob.getFullYear()
            if (age < 18) throw new Error('Coolie must be at least 18 years old')
            if (age > 65) throw new Error('Age must be 65 or below')
            return true
        }),

    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),

    body('address')
        .trim()
        .notEmpty().withMessage('Address is required')
        .isLength({ min: 10, max: 300 }).withMessage('Address must be 10–300 characters'),

    body('city')
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({ max: 100 }),

    body('state')
        .trim()
        .notEmpty().withMessage('State is required')
        .isLength({ max: 100 }),

    body('pincode')
        .trim()
        .notEmpty().withMessage('Pincode is required')
        .matches(/^\d{6}$/).withMessage('Pincode must be a 6-digit number'),

    body('station_name')
        .trim()
        .notEmpty().withMessage('Station name is required')
        .isLength({ max: 200 }),

    body('station_code')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 20 }),

    body('experience_years')
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),

    body('aadhaar_number')
        .trim()
        .notEmpty().withMessage('Aadhaar number is required')
        .matches(/^\d{12}$/).withMessage('Aadhaar number must be exactly 12 digits'),

    body('secondary_doc_type')
        .notEmpty().withMessage('Secondary document type is required')
        .isIn(['voter_id', 'pan', 'driving_license', 'passport'])
        .withMessage('Secondary doc must be voter_id, pan, driving_license, or passport'),

    body('secondary_doc_number')
        .trim()
        .notEmpty().withMessage('Secondary document number is required')
        .isLength({ min: 5, max: 50 }),

    // Bank details — all optional
    body('bank_name').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('account_number').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
    body('ifsc_code')
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code format'),
    body('upi_id').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),

    body('working_platforms')
        .optional()
        .custom((value) => {
            if (value && typeof value === 'string') {
                try { JSON.parse(value) } catch { throw new Error('working_platforms must be a JSON array') }
            }
            return true
        }),

    body('languages_spoken')
        .optional()
        .custom((value) => {
            if (value && typeof value === 'string') {
                try { JSON.parse(value) } catch { throw new Error('languages_spoken must be a JSON array') }
            }
            return true
        }),
]

const coolieLoginRules = [
    body('coolie_id')
        .trim()
        .notEmpty().withMessage('Coolie ID is required')
        .matches(/^CL-[A-Z]{2,6}-[A-Z0-9]{6}$/).withMessage('Invalid Coolie ID format (e.g. CL-NDLS-X8F4K2)'),
    body('password').notEmpty().withMessage('Password is required'),
]

module.exports = {
    customerRegisterRules,
    customerLoginRules,
    coolieRegisterRules,
    coolieLoginRules,
}
