const { Location, Job } = require('../../models');

const getAllLocation = () => Location.findAll({
  attributes: ['id', 'name', 'address', 'descLocation'],
  order: [['createdAt', 'DESC']],
});

const getAllLocationApply = () => Location.findAll({
  attributes: ['id', 'name', 'address', 'descLocation'],
  order: [['createdAt', 'DESC']],
  include: {
    model: Job,
  },
});

const postLocation = async (data) => {
  let location = await Location.create({
    name: data.name,
    address: data.address,
    office: data.office,
    descLocation: data.descLocation,
    linkMap: data.linkMap,
  });
  return location;
};

const updateLocation = async (id, data) => {
  let location = await Location.findByPk(id);
  if (!location) {
    return false;
  }
  location.name = data.name;
  location.address = data.address;
  location.office = data.office;
  location.descLocation = data.descLocation;
  location.linkMap = data.linkMap;
  await location.save();
  return location;
};

const deleteLocation = async (id) => {
  let location = await Location.findByPk(id);
  if (!location) {
    return false;
  }
  location.destroy();
  return location;
};

const checkLocation = async (id) => {
  let location = await Location.findByPk(id);
  return location;
};

module.exports = {
  getAllLocation,
  postLocation,
  updateLocation,
  deleteLocation,
  checkLocation,
  getAllLocationApply,
};
