const axios = require('axios');
const config = require('../../../config');

const getIdRequestSignHire = async (params) => {
  try {
    let response = await axios.post(config.app.apiPostRequest, params, {
      headers: {
        apikey: config.app.apiKeySignHire,
      },
    });
    return response.data.requestId;
  } catch (err) {
    console.log(err);
    return false;
  }
};
// eslint-disable-next-line consistent-return
const checkRequest = async (id) => {
  try {
    let response = await axios.get(`${config.app.apiCheckRequest}/${id}`, {
      headers: {
        apikey: config.app.apiKeySignHire,
      },
    });
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

// eslint-disable-next-line consistent-return
const getCandidateSingHire = async (idCandidate) => {
  try {
    let response = await axios.get(`${config.app.apiGetCandidate}/${idCandidate}`, {
      headers: {
        apikey: config.app.apiKeySignHire,
      },
    });
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getIdRequestSignHire,
  checkRequest,
  getCandidateSingHire,
};
