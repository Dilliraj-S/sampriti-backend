const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlogPost = sequelize.define('BlogPost', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(300), allowNull: false },
  slug: { type: DataTypes.STRING(300), allowNull: false, unique: true },
  category: { type: DataTypes.STRING(100) },
  content: { type: DataTypes.TEXT },
  excerpt: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING(500) },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('draft', 'published', 'scheduled'), defaultValue: 'draft' },
  publishDate: { type: DataTypes.DATEONLY },
}, { timestamps: true, tableName: 'blog_posts' });

module.exports = BlogPost;
