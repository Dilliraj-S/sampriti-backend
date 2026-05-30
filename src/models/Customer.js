const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(200), unique: true },
  phone: { type: DataTypes.STRING(20) },
  city: { type: DataTypes.STRING(100) },
  ordersCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalSpent: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, { timestamps: true, tableName: 'customers' });

module.exports = Customer;
