const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  location: { type: DataTypes.ENUM('homepage_hero', 'category_banner', 'homepage_section', 'announcement_bar', 'popup_banner'), defaultValue: 'homepage_hero' },
  image: { type: DataTypes.STRING(500) },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, { timestamps: true, tableName: 'banners' });

module.exports = Banner;
