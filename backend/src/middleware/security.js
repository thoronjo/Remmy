const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const VALID_STAGES = [
  'intake',
  'narrowing',
  'gut_check',
  'resistance',
  'anxiety_analysis',
  'deadline',
  'committed',
  'implementation',
  'checkin',
];

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    error: 'Too many requests. Take a breath. Come back in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'AI request limit reached. Remmy needs a break too.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const validateAIRequest = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message cannot be empty')
    .isLength({ max: 2000 }).withMessage('Message too long - max 2000 characters'),
  body('stage')
    .trim()
    .notEmpty().withMessage('Stage is required')
    .isIn(VALID_STAGES).withMessage('Invalid stage'),
  body('context')
    .optional()
    .isObject().withMessage('Context must be an object'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Invalid input',
      details: errors.array().map((e) => e.msg),
    });
  }
  next();
};

module.exports = {
  apiLimiter,
  aiLimiter,
  validateAIRequest,
  handleValidationErrors,
  VALID_STAGES,
};
