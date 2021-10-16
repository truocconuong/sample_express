const PusherMethod = require('./pusherMethod');

class Pusher {
  constructor() {
    this.method = new PusherMethod();
  }

  async sendNotification(userId, content) {
    const result = await this.method.sendNotify(userId, content);
    return result;
  }
}

module.exports = Pusher;
