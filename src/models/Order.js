const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  customerId: { type: DataTypes.INTEGER, allowNull: true },
  items: { type: DataTypes.JSON },
  total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  status: { type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
  paymentMethod: { type: DataTypes.STRING(50) },
  paymentStatus: { type: DataTypes.ENUM('pending', 'success', 'refunded', 'failed'), defaultValue: 'pending' },
}, { timestamps: true, tableName: 'orders' });

module.exports = Order;
