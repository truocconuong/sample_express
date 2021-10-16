const { configZoom } = require('../../../config/global');

class ZoomMethod {
  constructor() {
    this.client = '';
  }

  async get(url) {
    this.client = await configZoom();
    const result = await this.client.get(url);
    return result;
  }

  async post(url, data) {
    this.client = await configZoom();
    const result = await this.client.post(url, data);
    return result;
  }

  async put(url, data, id) {
    this.client = await configZoom();
    const result = await this.client.put(`${url}/${id}`, data);
    return result;
  }

  async delete(url, data, id) {
    this.client = await configZoom();
    const result = await this.client.delete(`${url}/${id}`, data);
    return result;
  }
}

module.exports = ZoomMethod;
