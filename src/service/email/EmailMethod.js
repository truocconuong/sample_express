const nodemailer = require('nodemailer');

class EmailMethod {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
      },
    });
  }

  async sendMail(dataSend) {
    try {
      const result = await this.transporter.sendMail(dataSend);
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
module.exports = { EmailMethod };
