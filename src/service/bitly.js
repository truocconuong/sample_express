const axios = require('axios');
const { configBitly, getConfigDatabase } = require('../../config/global');

async function genUrlShort(urlLong) {
  const bitly = await configBitly();
  const response = await bitly.shorten(urlLong);
  return response;
}

async function getClick(idUrlShort) {
  const config = await getConfigDatabase();
  // tự call api lấy total click, không qua thư viện node-bitly nữa
  let res = await axios.get(`https://api-ssl.bitly.com/v4/bitlinks/${idUrlShort}/clicks/summary`, {
    headers: {
      Authorization: `Bearer ${config.APP_SECRET_KEY_BITLY}`,
    },
  });
  return res.data.total_clicks;
}

module.exports = {
  genUrlShort,
  getClick,
};
