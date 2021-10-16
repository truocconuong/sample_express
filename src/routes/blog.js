const Router = require('express').Router();
const { errors } = require('celebrate');
const controller = require('../controllers');

const blogController = controller.Blog;

Router.post('/api/upload/blog-image', blogController.uploadImgBlog);

Router.post('/api/blog', blogController.insertBlog);

Router.get('/api/blog/:id', blogController.getBlogById);

Router.get('/api/blogs', blogController.getListBlog);

Router.get('/api/portal/blogs', blogController.getListBlogPotal);

Router.patch('/api/blog', blogController.updateBlog);

Router.use(errors());
module.exports = Router;
