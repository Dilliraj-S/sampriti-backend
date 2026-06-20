const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.INTEGER, allowNull: true },
  productSlug: { type: DataTypes.STRING(200) },
  name: { type: DataTypes.STRING(200) },
  email: { type: DataTypes.STRING(200) },
  rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  title: { type: DataTypes.STRING(300) },
  comment: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('approved', 'pending', 'rejected'), defaultValue: 'pending' },
}, { timestamps: true, tableName: 'reviews' });

module.exports = Review;
