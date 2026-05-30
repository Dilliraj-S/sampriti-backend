const router = require('express').Router();
const productCtrl = require('../controllers/productController');
const categoryCtrl = require('../controllers/categoryController');
const orderCtrl = require('../controllers/orderController');
const customerCtrl = require('../controllers/customerController');
const bannerCtrl = require('../controllers/bannerController');
const inventoryCtrl = require('../controllers/inventoryController');
const couponCtrl = require('../controllers/couponController');
const shippingCtrl = require('../controllers/shippingController');
const reviewCtrl = require('../controllers/reviewController');
const blogCtrl = require('../controllers/blogController');
const settingCtrl = require('../controllers/settingController');
const dashboardCtrl = require('../controllers/dashboardController');
const uploadCtrl = require('../controllers/uploadController');
const upload = require('../middleware/upload');

// Dashboard
router.get('/dashboard', dashboardCtrl.dashboard);

// Products
router.get('/products', productCtrl.list);
router.get('/products/latest', productCtrl.latest);
router.get('/products/slug/:slug', productCtrl.getBySlug);
router.get('/products/:id', productCtrl.get);
router.post('/products', productCtrl.create);
router.put('/products/:id', productCtrl.update);
router.delete('/products/:id', productCtrl.remove);

// Categories
router.get('/categories', categoryCtrl.list);
router.post('/categories', categoryCtrl.create);
router.put('/categories/:id', categoryCtrl.update);
router.delete('/categories/:id', categoryCtrl.remove);

// Orders
router.get('/orders', orderCtrl.list);
router.put('/orders/:id/status', orderCtrl.updateStatus);
router.get('/orders/stats', orderCtrl.stats);

// Customers
router.get('/customers', customerCtrl.list);
router.post('/customers', customerCtrl.create);
router.put('/customers/:id', customerCtrl.update);
router.delete('/customers/:id', customerCtrl.remove);
router.get('/customers/stats', customerCtrl.stats);

// Banners
router.get('/banners', bannerCtrl.list);
router.post('/banners', bannerCtrl.create);
router.put('/banners/:id', bannerCtrl.update);
router.delete('/banners/:id', bannerCtrl.remove);
router.patch('/banners/:id/toggle', bannerCtrl.toggleStatus);

// Inventory
router.get('/inventory', inventoryCtrl.list);
router.put('/inventory/:id/stock', inventoryCtrl.updateStock);

// Coupons
router.get('/coupons', couponCtrl.list);
router.post('/coupons', couponCtrl.create);
router.put('/coupons/:id', couponCtrl.update);
router.delete('/coupons/:id', couponCtrl.remove);

// Shipping Zones
router.get('/shipping-zones', shippingCtrl.list);
router.post('/shipping-zones', shippingCtrl.create);
router.put('/shipping-zones/:id', shippingCtrl.update);
router.delete('/shipping-zones/:id', shippingCtrl.remove);

// Reviews
router.get('/reviews', reviewCtrl.list);
router.put('/reviews/:id/status', reviewCtrl.updateStatus);
router.delete('/reviews/:id', reviewCtrl.remove);
router.get('/reviews/stats', reviewCtrl.stats);

// Blog/Content
router.get('/content', blogCtrl.list);
router.get('/content/:slug', blogCtrl.getBySlug);
router.post('/content', blogCtrl.create);
router.put('/content/:id', blogCtrl.update);
router.patch('/content/:id/toggle', blogCtrl.toggleStatus);
router.delete('/content/:id', blogCtrl.remove);

// Settings
router.get('/settings', settingCtrl.list);
router.put('/settings', settingCtrl.update);

// Upload
router.post('/upload', upload.single('file'), uploadCtrl.uploadImage);
router.delete('/upload/:filename', uploadCtrl.deleteImage);

module.exports = router;
