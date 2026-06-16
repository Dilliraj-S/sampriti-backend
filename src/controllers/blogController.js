const blogService = require('../services/blogService');

exports.list = async (req, res) => {
  try {
    const data = await blogService.getAllPosts();
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const data = await blogService.getPostBySlug(req.params.slug);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await blogService.createPost(req.body);
    res.status(201).json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await blogService.updatePost(req.params.id, req.body);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const data = await blogService.togglePostStatus(req.params.id);
    res.json({ status: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await blogService.deletePost(req.params.id);
    res.json({ status: true, message: 'Post deleted' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ status: false, message: err.message });
  }
};
