const { configPusher } = require('../../../config/global');

class PusherMethod {
  constructor() {
    this.pusher = '';
  }

  async sendNotify(userId, content) {
    this.pusher = await configPusher();
    const result = await this.pusher.trigger('notification', `${userId}`, {
      content,
    });
    return result;
  }
}

module.exports = PusherMethod;
