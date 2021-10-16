const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Passport = require('passport');
const serveIndex = require('serve-index')

const app = express();
require('./controllers/passport')(Passport);
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

const routes = require('./routes');
const config = require('../config');
const { CronJob } = require('./controllers');
const stream = require('stream');
const fs = require('fs');

app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.options('*', cors());
CronJob.activeJobNotification(); // chạy thông báo active job
// CronJob.serviceEmail(); // chạy service email
// CronJob.serviceRefinePdf(); // refine pdf
CronJob.sendEmailListJobRecruiter(); // send email list job recruiter

CronJob.sendEmailListCandidateRecruiter(); // notification

app.use(routes);
server.listen(config.app.port, () => console.info(`Server listening on port ${config.app.port}!`));
io.on('connection', (socket) => {
  socket.on('join', (data) => {
    socket.join(data);
    if (global.socket === undefined && global.io === undefined) {
      global.socket = socket;
      global.io = io;
    }
  });
});


module.exports = server;
