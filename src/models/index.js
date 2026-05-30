const sequelize = require('../config/database');
const Product = require('./Product');
const Category = require('./Category');
const Customer = require('./Customer');
const Order = require('./Order');
const Banner = require('./Banner');
const Coupon = require('./Coupon');
const ShippingZone = require('./ShippingZone');
const Review = require('./Review');
const BlogPost = require('./BlogPost');
const Setting = require('./Setting');

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    await BlogPost.update({ status: 'published' }, { where: { status: 'draft' } });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Database sync failed:', error.message);
  }
};

module.exports = {
  sequelize,
  syncDB,
  Product,
  Category,
  Customer,
  Order,
  Banner,
  Coupon,
  ShippingZone,
  Review,
  BlogPost,
  Setting,
};