const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  type: { type: DataTypes.ENUM('percentage', 'flat'), defaultValue: 'percentage' },
  value: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  minOrder: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  limit: { type: DataTypes.INTEGER, defaultValue: 100 },
  expiry: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, { timestamps: true, tableName: 'coupons' });

module.exports = Coupon;
