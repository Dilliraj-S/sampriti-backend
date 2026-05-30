const { BlogPost } = require('../models');

exports.list = async (req, res) => {
  try {
    const posts = await BlogPost.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ status: true, data: posts });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const post = await BlogPost.create({ ...req.body, slug });
    res.status(201).json({ status: true, data: post });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: 'Post not found' });
    await post.update(req.body);
    res.json({ status: true, data: post });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ where: { slug: req.params.slug } });
    if (!post) return res.status(404).json({ status: false, message: 'Post not found' });
    res.json({ status: true, data: post });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: 'Post not found' });
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await post.update({ status: newStatus });
    res.json({ status: true, data: post });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: 'Post not found' });
    await post.destroy();
    res.json({ status: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
