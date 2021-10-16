const {
  Client, Job, CandidateJob, Lane,
} = require('../../models');

const getListClient = (pageSize, pageNumber) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => Client.findAll({
    offset: skip,
    limit,
    order: [['id', 'DESC']],
    attributes: ['id', 'name', 'about', 'website', 'createdAt'],
  });
  const getCount = () => Client.count();
  return new Promise(async (resolved, reject) => {
    try {
      const list = await getList();
      const count = await getCount();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const getDetailClient = async (id) => {
  let client = await Client.findByPk(id);
  if (!client) {
    return false;
  }
  return client;
};

const postClient = async (data) => {
  let client = await Client.create({
    name: data.name,
    about: data.about,
    website: data.website || '',
    background: data.background || '#ffff',
  });
  return client;
};

const updateClient = async (id, data) => {
  let client = await Client.findByPk(id);
  if (!client) {
    return false;
  }
  client.name = data.name;
  client.about = data.about;
  client.website = data.website;
  client.background = data.background;
  await client.save();
  return client;
};

const deleteClient = async (id) => {
  const client = await Client.findByPk(id);
  if (!client) {
    return false;
  }
  await Client.destroy({
    where: {
      id: Number(id),
    },
  });
  return client;
};

const getAllClient = async () => {
  let clients = await Client.findAll({
    attributes: ['id', 'name'],
    include: {
      model: Job,
    },
  });
  return clients;
};

const updateClientFreestyle = async (id, data) => {
  let client = await Client.findByPk(id);
  if (client) {
    await client.update(data);
  }
  return client;
};

const getAllJobOfClient = async (id) => {
  const jobs = await Job.findAll({
    where: {
      clientId: id,
    },
    include: {
      model: CandidateJob,
      include: {
        model: Lane,
      },
    },
  });
  return jobs;
};

module.exports = {
  getListClient,
  getDetailClient,
  postClient,
  updateClient,
  deleteClient,
  getAllClient,
  updateClientFreestyle,
  getAllJobOfClient,
};
