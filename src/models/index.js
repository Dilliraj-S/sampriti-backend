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
const Section = require('./Section');

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.belongsToMany(Section, { through: 'product_sections', foreignKey: 'productId', otherKey: 'sectionId', as: 'sections' });
Section.belongsToMany(Product, { through: 'product_sections', foreignKey: 'sectionId', otherKey: 'productId', as: 'products' });

const SECTION_NAMES = ['home', 'influence', 'infusions', 'skincare', 'fragrance', 'ceremony', 'atmosphere'];

const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    await BlogPost.update({ status: 'published' }, { where: { status: 'draft' } });
    for (const name of SECTION_NAMES) {
      await Section.findOrCreate({ where: { name } });
    }
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
  Section,
  SECTION_NAMES,
};