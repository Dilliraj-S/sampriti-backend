const { BlogPost } = require('../models');
const { Op } = require('sequelize');
const slugify = require('../utils/slugify');

/**
 * Sanitizes blog post body data.
 * Converts empty or undefined publishDate to null.
 * @param {object} body
 * @returns {object}
 */
const sanitize = (body) => {
  const data = { ...body };
  if (data.publishDate === '' || data.publishDate === undefined) data.publishDate = null;
  return data;
};

/**
 * Auto-publishes any scheduled posts whose publishDate has passed.
 * This side-effect must run before fetching posts.
 * @returns {Promise<void>}
 */
const autoPublishScheduled = async () => {
  const today = new Date().toISOString().split('T')[0];
  await BlogPost.update(
    { status: 'published' },
    { where: { status: 'scheduled', publishDate: { [Op.lte]: today } } }
  );
};

/**
 * Generate a slug for a blog post.
 * @param {string} title
 * @param {string} [slug]
 * @returns {string}
 */
const generateBlogSlug = (title, slug) => {
  const base = slug || title || '';
  const generated = slugify(base);
  return generated || `post-${Date.now()}`;
};

/**
 * Get all blog posts. Auto-publishes scheduled posts first.
 * @returns {Promise<BlogPost[]>}
 */
const getAllPosts = async () => {
  await autoPublishScheduled();
  return BlogPost.findAll({ order: [['createdAt', 'DESC']] });
};

/**
 * Get a single blog post by slug and increment its view count.
 * @param {string} slug
 * @returns {Promise<BlogPost>}
 */
const getPostBySlug = async (slug) => {
  const post = await BlogPost.findOne({ where: { slug } });
  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    throw err;
  }
  await post.increment('views');
  return post;
};

/**
 * Create a new blog post.
 * @param {object} data
 * @returns {Promise<BlogPost>}
 */
const createPost = async (data) => {
  const slug = generateBlogSlug(data.title, data.slug);
  return BlogPost.create({ ...sanitize(data), slug });
};

/**
 * Update an existing blog post by ID.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<BlogPost>}
 */
const updatePost = async (id, data) => {
  const post = await BlogPost.findByPk(id);
  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    throw err;
  }
  await post.update(sanitize(data));
  return post;
};

/**
 * Toggle a blog post's status between 'published' and 'scheduled'.
 * @param {number} id
 * @returns {Promise<BlogPost>}
 */
const togglePostStatus = async (id) => {
  const post = await BlogPost.findByPk(id);
  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    throw err;
  }
  const nextStatus = post.status === 'published' ? 'scheduled' : 'published';
  await post.update({ status: nextStatus });
  return post;
};

/**
 * Delete a blog post by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
const deletePost = async (id) => {
  const post = await BlogPost.findByPk(id);
  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    throw err;
  }
  await post.destroy();
};

module.exports = { getAllPosts, getPostBySlug, createPost, updatePost, togglePostStatus, deletePost };
