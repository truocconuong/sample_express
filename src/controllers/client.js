const jwt = require('jsonwebtoken');
const clientService = require('../service/client');
const util = require('../common/util');
const config = require('../../config');
const bitly = require('../service/bitly');

async function getClient(req, res) {
  try {
    const { pageSize, pageNumber } = req.query;
    const client = await clientService.getListClient(pageSize, pageNumber);
    return res.send(util.sendSuccess(client));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getDetailClient(req, res) {
  try {
    const { id } = req.params;
    const client = await clientService.getDetailClient(id);
    if (!client) {
      return res.send(util.sendError(404, 'Client not found !'));
    }
    return res.send(util.sendSuccess({ client }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function postClient(req, res) {
  try {
    const data = req.body;
    let client = await clientService.postClient(data);
    return res.send(util.sendSuccess({ client }));
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}
async function updateClient(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    let client = await clientService.updateClient(id, data);
    if (!client) {
      return res.send(util.sendError(404, 'Client not found !'));
    }
    return res.send(util.sendSuccess({ clientId: client.id }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    let client = await clientService.deleteClient(id);
    if (!client) {
      return res.send(util.sendError(404, 'Client not found !'));
    }
    return res.send(util.sendSuccess({ clientId: client.id }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getAllClient(req, res) {
  try {
    let clients = await clientService.getAllClient();
    return res.send(util.sendSuccess({ clients }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function generateToken(req, res) {
  try {
    const { id } = req.params;
    let client = await clientService.getDetailClient(id);
    if (!client) {
      return res.status(404).send(util.error(util.INTERNAL_SERVER_ERROR, 'Job not exists'));
    }
    let token = jwt.sign(
      {
        clientId: client.id,
      },
      config.app.secretKey,
    );
    await clientService.updateClientFreestyle(client.id, {
      token,
    });
    return res.send(util.sendSuccess({ client }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function shortLinkAllowCandidate(req, res) {
  const { link } = req.body;
  try {
    const fullLink = `${process.env.SITE_ALLOW_CANDIDATE}/public/candidate/${link}`;
    const generateShort = await bitly.genUrlShort(fullLink);
    return res.send(util.sendSuccess({ url: generateShort.link }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, error));
  }
}

async function shortLinkShareRecruiter(req, res) {
  const { link } = req.body;
  try {
    const fullLink = `${process.env.SITE_VN_FETCH_TECH}/${link}`;
    const generateShort = await bitly.genUrlShort(fullLink);
    return res.send(util.sendSuccess({ url: generateShort.link }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, error));
  }
}

async function getAllJobOfClient(req, res) {
  const { id } = req.params;
  try {
    const clients = await clientService.getAllJobOfClient(id);
    return res.send(util.sendSuccess({ clients }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, error));
  }
}

module.exports = {
  getClient,
  getDetailClient,
  postClient,
  updateClient,
  deleteClient,
  getAllClient,
  generateToken,
  shortLinkAllowCandidate,
  getAllJobOfClient,
  shortLinkShareRecruiter,
};
