const { configUserIdZoom } = require('../../../config/global');
const ZoomMethod = require('./zoomMethod');

class Zoom {
  constructor() {
    this.method = new ZoomMethod();
    this.url = 'https://api.zoom.us/v2/users';
  }

  async createMeeting(data) {
    const zoomId = await configUserIdZoom();
    const url = `${this.url}/${zoomId}/meetings`;
    return this.method.post(url, data);
  }
}

module.exports = Zoom;
