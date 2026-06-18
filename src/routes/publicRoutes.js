const { Router } = require('express');
const router = Router();
const productCtrl = require('../controllers/productController');

router.get('/products/search', productCtrl.search);

module.exports = router;
