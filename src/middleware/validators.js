const { body, validationResult } = require('express-validator');

/** Middleware to extract and return validation errors */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(422).json({ status: false, message: first.msg, field: first.path });
  }
  next();
};

const validateRegister = [
  body('full_name').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 150 }).withMessage('Name too long.'),
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email address.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character.'),
  validate,
];

const validateLogin = [
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  validate,
];

const validateForgotPassword = [
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email address.'),
  validate,
];

const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character.'),
  validate,
];

const validateVerifyOtp = [
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email address.'),
  body('otp').trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage('Enter the 6-digit OTP.'),
  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyOtp,
};
