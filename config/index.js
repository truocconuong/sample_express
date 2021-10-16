require('dotenv').config();

const envVariables = {
  env: process.env.NODE_ENV,
  app: {
    secretKey: process.env.APP_SECRET_KEY,
    secretKeyRefresh: process.env.APP_SECRET_KEY_REFRESH,
    port: process.env.APP_PORT || 3030,
    linkFetchTech: 'https://vn.fetch.tech/careers/',
    apiKeySignHire: '202..lo87W6LDs738kMgrnIvWtvIq72L',
    apiPostRequest: 'https://www.signalhire.com/api/v1/candidate/search',
    apiCheckRequest: 'https://www.signalhire.com/api/v1/candidate/request',
    apiGetCandidate: 'https://www.signalhire.com/api/v1/candidate',
  },
};
module.exports = envVariables;
