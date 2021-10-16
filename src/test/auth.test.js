// Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

let should = chai.should();

chai.use(chaiHttp);

describe('Login', () => {
  it('it should return JWT token', (done) => {
    let userInfor = {
      email: 'hoangkhanh@gmail.com',
      password: '123456789',
    };
    chai.request(server).post('/api/sigin').send(userInfor).end((err, res) => {
      res.should.have.status(200);
      console.log(res);
      done();
    });
  });
});
