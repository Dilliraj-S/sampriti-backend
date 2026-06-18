const { Router } = require('express');
const router = Router();
const rateLimit = require('express-rate-limit');
const paymentCtrl = require('../controllers/paymentController');
const authenticate = require('../middleware/authenticate');

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { status: false, message: 'Too many payment requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/orders', paymentLimiter, paymentCtrl.createOrder);
router.post('/paypal/create-paypal-order', paymentLimiter, paymentCtrl.createPaypalOrder);
router.post('/paypal/capture-order', paymentLimiter, paymentCtrl.captureOrder);
router.post('/paypal/webhook', paymentCtrl.webhook);
router.get('/transactions/:orderId', paymentCtrl.getTransactionStatus);
router.get('/transactions', authenticate, paymentCtrl.listTransactions);

module.exports = router;
