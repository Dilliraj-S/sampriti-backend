const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShippingZone = sequelize.define('ShippingZone', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  pinCodes: { type: DataTypes.STRING(500) },
  rate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  freeAbove: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  deliveryTime: { type: DataTypes.STRING(100) },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, { timestamps: true, tableName: 'shipping_zones' });

module.exports = ShippingZone;
