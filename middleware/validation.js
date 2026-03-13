const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  phone: body('phone')
    .matches(/^(\+91|91)?[6789]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  
  message: body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
};

// Form-specific validations
const reportValidation = [
  body('reporterPhone')
    .matches(/^(\+91|91)?[6789]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('exactLocation').trim().isLength({ min: 5 }).withMessage('Exact location is required'),
  body('area').trim().isLength({ min: 2 }).withMessage('Area is required'),
  body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('locationType').isIn(['road', 'hospital', 'home', 'public_place', 'river', 'railway', 'forest', 'other']).withMessage('Invalid location type'),
  body('dateFound').isISO8601().withMessage('Valid date is required'),
  body('timeFound').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required'),
  body('gender').isIn(['male', 'female', 'other', 'unknown']).withMessage('Invalid gender'),
  body('bodyCondition').isIn(['recent', 'decomposed', 'advanced', 'skeletal', 'unknown']).withMessage('Invalid body condition'),
  body('agreeToTerms').isBoolean().custom(value => value === true).withMessage('Terms agreement is required'),
  body('consentToShare').isBoolean().custom(value => value === true).withMessage('Consent to share is required'),
  validate
];

const feedbackValidation = [
  commonValidations.name,
  commonValidations.email,
  body('feedbackType').isIn(['service_experience', 'website', 'volunteer', 'donation', 'complaint', 'suggestion', 'appreciation', 'other']).withMessage('Invalid feedback type'),
  body('experienceRating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  commonValidations.message,
  body('wouldRecommend').isIn(['yes', 'maybe', 'no']).withMessage('Recommendation is required'),
  validate
];

const volunteerValidation = [
  commonValidations.name,
  commonValidations.email,
  commonValidations.phone,
  body('registrationType').isIn(['individual', 'group']).withMessage('Invalid registration type'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),
  body('address').trim().isLength({ min: 10 }).withMessage('Complete address is required'),
  body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('pincode').isPostalCode('IN').withMessage('Valid pincode is required'),
  body('occupation').trim().isLength({ min: 2 }).withMessage('Occupation is required'),
  body('availability').isIn(['weekdays_morning', 'weekdays_evening', 'weekends', 'full_time', 'on_call', 'flexible']).withMessage('Invalid availability'),
  body('agreeToTerms').isBoolean().custom(value => value === true).withMessage('Terms agreement is required'),
  body('agreeToBackgroundCheck').isBoolean().custom(value => value === true).withMessage('Background check agreement is required'),
  validate
];

const contactValidation = [
  commonValidations.name,
  commonValidations.email,
  commonValidations.phone,
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  commonValidations.message,
  validate
];

const donationValidation = [
  commonValidations.name,
  commonValidations.email,
  commonValidations.phone,
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod').isIn(['card', 'netbanking', 'upi', 'wallet', 'bank_transfer']).withMessage('Invalid payment method'),
  body('donationType').optional().isIn(['one_time', 'monthly', 'yearly']).withMessage('Invalid donation type'),
  body('purpose').optional().isIn(['general', 'cremation_services', 'volunteer_support', 'infrastructure', 'emergency_fund', 'specific_campaign']).withMessage('Invalid purpose'),
  validate
];

const boardValidation = [
  commonValidations.name,
  commonValidations.email,
  commonValidations.phone,
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('address').trim().isLength({ min: 10 }).withMessage('Complete address is required'),
  body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('currentPosition').trim().isLength({ min: 2 }).withMessage('Current position is required'),
  body('organization').trim().isLength({ min: 2 }).withMessage('Organization is required'),
  body('experience').isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('qualifications').trim().isLength({ min: 10 }).withMessage('Qualifications are required'),
  body('positionInterested').isIn(['board_member', 'advisory_member', 'treasurer', 'secretary', 'any']).withMessage('Invalid position'),
  body('motivationStatement').trim().isLength({ min: 50, max: 2000 }).withMessage('Motivation statement must be between 50 and 2000 characters'),
  body('timeCommitment').isIn(['5_hours_month', '10_hours_month', '15_hours_month', '20_plus_hours_month']).withMessage('Invalid time commitment'),
  validate
];

const legacyValidation = [
  commonValidations.name,
  commonValidations.email,
  commonValidations.phone,
  body('legacyType').isIn(['will_bequest', 'life_insurance', 'retirement_plan', 'charitable_trust', 'other']).withMessage('Invalid legacy type'),
  body('timeframe').optional().isIn(['immediate', '1_2_years', '3_5_years', '5_plus_years', 'uncertain']).withMessage('Invalid timeframe'),
  body('estimatedValue').optional().trim().isLength({ max: 50 }).withMessage('Estimated value too long'),
  body('specificPurpose').optional().trim().isLength({ max: 500 }).withMessage('Purpose description too long'),
  validate
];

const schemeValidation = [
  commonValidations.name,
  commonValidations.email,
  commonValidations.phone,
  body('schemeName').trim().isLength({ min: 5, max: 200 }).withMessage('Scheme name is required'),
  body('schemeType').isIn(['central', 'state', 'local', 'ngo', 'private']).withMessage('Invalid scheme type'),
  body('incomeCategory').isIn(['bpl', 'apl', 'middle_class', 'other']).withMessage('Invalid income category'),
  body('familySize').isInt({ min: 1, max: 20 }).withMessage('Family size must be between 1 and 20'),
  body('address').trim().isLength({ min: 10 }).withMessage('Complete address is required'),
  body('city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('pincode').isPostalCode('IN').withMessage('Valid pincode is required'),
  body('agreeToTerms').isBoolean().custom(value => value === true).withMessage('Terms agreement is required'),
  validate
];

const expansionValidation = [
  commonValidations.name,
  commonValidations.email,
  commonValidations.phone,
  body('requestedCity').trim().isLength({ min: 2, max: 100 }).withMessage('City name is required'),
  body('requestedState').trim().isLength({ min: 2, max: 100 }).withMessage('State name is required'),
  body('population').optional().custom((value) => {
    if (!value) return true; // Allow empty values
    const numValue = parseInt(value.toString().replace(/[^\d]/g, ''));
    return numValue >= 1000;
  }).withMessage('Population must be at least 1000'),
  body('localSupport').isIn(['individual', 'organization', 'government', 'community', 'multiple']).withMessage('Invalid local support type'),
  body('organization').optional().trim().isLength({ max: 200 }).withMessage('Organization name too long'),
  body('whyNeeded').trim().isLength({ min: 50, max: 2000 }).withMessage('Justification must be between 50 and 2000 characters'),
  validate
];

module.exports = {
  validate,
  reportValidation,
  feedbackValidation,
  volunteerValidation,
  contactValidation,
  donationValidation,
  boardValidation,
  legacyValidation,
  schemeValidation,
  expansionValidation
};