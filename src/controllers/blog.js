const multer = require('multer');
const util = require('../common/util');
const blogService = require('../service/blog');

let storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads');
  },
  filename(req, file, cb) {
    let filename = `${Date.now()}-hoangkhanhdev-${file.originalname}`;
    return cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  let math = ['image/png', 'image/jpeg', 'image/jpg'];
  if (math.indexOf(file.mimetype) === -1) {
    let errorMess = `The file ${file.originalname} is invalid. Only allowed to upload file png, jpeg and jpg`;
    return cb(errorMess, false);
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
}).single('imageBlog');

async function uploadImgBlog(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      return res.send(util.sendError(400, err));
    }
    let pathFile = '';
    pathFile = await req.file.path.split('\\').join('/');
    try {
      return res.send(util.sendSuccess({ link: pathFile }));
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send(util.error(util.INTERNAL_SERVER_ERROR, error));
    }
  });
}

async function insertBlog(req, res) {
  const data = req.body;
  try {
    console.log(data);
    let blog = await blogService.insertBlog(data);
    return res.send(util.sendSuccess({ blogId: blog.id }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
}

async function getBlogById(req, res) {
  const { id } = req.params;
  try {
    const blog = await blogService.getBlogById(id);
    return res.send(util.sendSuccess({ blog }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
}

async function getListBlog(req, res) {
  const { pageSize, pageNumber } = req.query;
  console.log(pageSize, pageNumber);
  try {
    const listBlog = await blogService.getListBlog(pageNumber, pageSize);
    return res.send(util.sendSuccess({ listBlog }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
}

async function getListBlogPotal(req, res) {
  const { pageSize, pageNumber } = req.query;
  console.log(pageSize, pageNumber);
  try {
    const [listBlog, countBlog] = await Promise.all([
      blogService.getListBlogPortal(pageNumber, pageSize),
      blogService.countBlog(),
    ]);

    return res.send(util.sendSuccess({ listBlog, count: countBlog }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
}

async function updateBlog(req, res) {
  const data = req.body;
  try {
    const resultUpdate = await blogService.updateBlog(data);
    if (resultUpdate) {
      return res.send(util.sendSuccess());
    }
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  uploadImgBlog,
  insertBlog,
  getBlogById,
  getListBlog,
  updateBlog,
  getListBlogPotal,
};
