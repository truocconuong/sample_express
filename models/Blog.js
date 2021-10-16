module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define('Blog', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING,
    },
    slug: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT("long"),
    },
    firstPara: {
      type: DataTypes.TEXT("long"),
    },
    img: {
      type: DataTypes.TEXT("long"),
    },
    isShow: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
  });
  Blog.associate = function (models) {
   
  };
  return Blog;
};
