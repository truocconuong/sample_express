class SocketIO {
  constructor() {
    this.socket = global.socket;
    this.io = global.io;
  }

  async sendNotification(userId, content) {
    try {
      let result;
      if (this.io !== undefined) {
        result = await this.io.to(userId).emit('notification', { content });
      }
      return result;
    } catch (error) {
      console.log('=> socket', error);
      return error;
    }
  }
}

module.exports = SocketIO;
