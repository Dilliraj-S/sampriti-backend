const { Router } = require('express');
const router = Router();
const productCtrl = require('../controllers/productController');
const reviewCtrl = require('../controllers/reviewController');

router.get('/products/search', productCtrl.search);
router.post('/reviews', reviewCtrl.create);
router.get('/reviews/product/:slug', reviewCtrl.productReviews);

module.exports = router;
