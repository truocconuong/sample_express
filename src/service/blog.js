const { Blog } = require('../../models');

const insertBlog = async (data) => {
  try {
    let blog = await Blog.create(data);
    return blog;
  } catch (err) {
    console.log(err);
    if (err) {
      throw new Error();
    }
    return false;
  }
};

const getBlogById = async (id) => {
  try {
    let blog = await Blog.findByPk(id);
    return blog;
  } catch (error) {
    if (error) {
      throw new Error();
    }
    return false;
  }
};

const getListBlog = async (pageNumber, pageSize) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  try {
    let listBlog = Blog.findAll({
      where: {
        isShow: true,
      },
      limit,
      offset: skip,
    });
    return listBlog;
  } catch (error) {
    if (error) {
      throw new Error();
    }
    return false;
  }
};

const getListBlogPortal = async (pageNumber, pageSize) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  try {
    let listBlog = Blog.findAll({
      limit,
      offset: skip,
    });
    return listBlog;
  } catch (error) {
    if (error) {
      throw new Error();
    }
    return false;
  }
};

const countBlog = async () => {
  try {
    let count = await Blog.count();
    return count;
  } catch (error) {
    if (error) {
      throw new Error();
    }
    return false;
  }
};

const updateBlog = async (data) => {
  try {
    let blog = await Blog.findByPk(data.id);
    if (blog) {
      blog.update(data);
      return true;
    }
    return false;
  } catch (error) {
    if (error) {
      throw new Error();
    }
    return false;
  }
};

module.exports = {
  insertBlog,
  getBlogById,
  getListBlog,
  updateBlog,
  getListBlogPortal,
  countBlog,
};
