const router       = require('express').Router();
const ctrl         = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const { loginLimiter, authLimiter } = require('../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyOtp,
} = require('../middleware/validators');

router.post('/register',         authLimiter,  validateRegister,        ctrl.register);
router.post('/verify-email',                   validateVerifyOtp,       ctrl.verifyEmail);
router.post('/resend-otp',       authLimiter,                           ctrl.resendOtp);
router.post('/login',            loginLimiter, validateLogin,           ctrl.login);
router.post('/refresh',                                                  ctrl.refresh);
router.post('/logout',           authenticate,                           ctrl.logout);
router.post('/logout-all',       authenticate,                           ctrl.logoutAll);
router.post('/forgot-password',  authLimiter,  validateForgotPassword,  ctrl.forgotPassword);
router.post('/reset-password',   authLimiter,  validateResetPassword,   ctrl.resetPassword);
router.get('/me',                authenticate,                           ctrl.getMe);

module.exports = router;
