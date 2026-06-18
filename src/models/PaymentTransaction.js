const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentTransaction = sequelize.define('PaymentTransaction', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  paypalOrderId: { type: DataTypes.STRING(255), allowNull: true },
  paypalCaptureId: { type: DataTypes.STRING(255), allowNull: true },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  currency: { type: DataTypes.STRING(10), defaultValue: 'USD' },
  status: {
    type: DataTypes.ENUM('created', 'approved', 'completed', 'failed', 'refunded', 'partially_refunded'),
    defaultValue: 'created',
  },
  payerEmail: { type: DataTypes.STRING(255), allowNull: true },
  payerId: { type: DataTypes.STRING(255), allowNull: true },
  paymentMethod: { type: DataTypes.STRING(50), defaultValue: 'paypal' },
  failureReason: { type: DataTypes.TEXT, allowNull: true },
  ipAddress: { type: DataTypes.STRING(45), allowNull: true },
  webhookEvents: { type: DataTypes.JSON, allowNull: true },
}, { timestamps: true, tableName: 'payment_transactions' });

module.exports = PaymentTransaction;
