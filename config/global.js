const Pusher = require('pusher');
const axios = require('axios');
const { BitlyClient } = require('bitly');
const _ = require('lodash');
const systemparameter = require('../src/service/systemparameter');

async function getConfigDatabase() {
  const config = {};
  const settings = await systemparameter.getSystems();
  _.map(settings, (setting) => {
    config[setting.key] = setting.value;
  });
  return config;
}

async function configPusher() {
  const config = await getConfigDatabase();
  return new Pusher({
    appId: config.APPID,
    key: config.KEY,
    secret: config.SECRET,
    cluster: config.CLUSTER,
    useTLS: true,
  });
}

async function configZoom() {
  const config = await getConfigDatabase();
  const client = axios.create({
    headers: {
      Authorization: `Bearer ${config.ZOOM_TOKEN}`,
    },
  });
  return client;
}

async function configBitly() {
  const config = await getConfigDatabase();
  return new BitlyClient(config.APP_SECRET_KEY_BITLY);
}

async function configUserIdZoom() {
  const config = await getConfigDatabase();
  return config.ZOOM_ID;
}

async function configGoogleDrive() {
  const config = await getConfigDatabase();
  return {
    driverToken: config.DRIVER_TOKEN.replace(/\\n/g, '\n'),
    driverAccount: config.DRIVER_ACCOUNT,
    driverFolderCv: config.DRIVER_FOLDER_CV,
  };
}

module.exports = {
  configPusher,
  configZoom,
  configBitly,
  configUserIdZoom,
  configGoogleDrive,
  getConfigDatabase,
};
