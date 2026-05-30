const { BlogPost } = require('../models');

exports.list = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await BlogPost.update(
      { status: 'published' },
      { where: { status: 'scheduled', publishDate: { [require('sequelize').Op.lte]: today } } }
    );
    const posts = await BlogPost.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ status: true, data: posts });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

const sanitize = (body) => {
  const data = { ...body };
  if (data.publishDate === '' || data.publishDate === undefined) data.publishDate = null;
  return data;
};

exports.create = async (req, res) => {
  try {
    let slug = (req.body.slug || req.body.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!slug) slug = 'post-' + Date.now();
    const post = await BlogPost.create({ ...sanitize(req.body), slug });
    res.status(201).json({ status: true, data: post });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: 'Post not found' });
    await post.update(sanitize(req.body));
    res.json({ status: true, data: post });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ where: { slug: req.params.slug } });
    if (!post) return res.status(404).json({ status: false, message: 'Post not found' });
    await post.increment('views');
    res.json({ status: true, data: post });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ status: false, message: 'Post not found' });
    const nextStatus = post.status === 'published' ? 'scheduled' : 'published';
    await post.update({ status: nextStatus });
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
