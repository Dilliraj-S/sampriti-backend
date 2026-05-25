const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.INTEGER, allowNull: true },
  customer: { type: DataTypes.STRING(200) },
  rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('approved', 'pending', 'rejected'), defaultValue: 'pending' },
}, { timestamps: true, tableName: 'reviews' });

module.exports = Review;
