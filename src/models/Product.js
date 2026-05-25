const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  subtitle: { type: DataTypes.STRING(300) },
  categoryId: { type: DataTypes.INTEGER, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING(500) },
  hoverImage: { type: DataTypes.STRING(500) },
  essenceTitle: { type: DataTypes.STRING(200) },
  essence: { type: DataTypes.TEXT },
  keyIngredients: { type: DataTypes.TEXT },
  howToUse: { type: DataTypes.TEXT },
  usageDetails: { type: DataTypes.JSON },
  aroma: { type: DataTypes.STRING(300) },
  suitedTo: { type: DataTypes.STRING(300) },
  benefits: { type: DataTypes.TEXT },
  format: { type: DataTypes.STRING(100) },
  status: { type: DataTypes.ENUM('active', 'out_of_stock', 'low_stock'), defaultValue: 'active' },
}, { timestamps: true, tableName: 'products' });

module.exports = Product;