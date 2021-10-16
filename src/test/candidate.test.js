//Require the dev-dependencies
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");
const should = chai.should();
const util = require("./util");

chai.use(chaiHttp);

describe("Candidate",  () => {
    describe("/POST Candidate", () => {
        // beforeEach(async (done) => {
        //   //Before each test we empty the database in your case
        //   await util.removeUserTest("newAcc@gmail.com"); // xoa user
        //   done();
        // });
        it("it should return success", async (done) => {
          let role = await util.getRoleIdByName("Director"); //Member, Leader
          let director = util.getDirector();
          let loginInfor = await util.login(director.email, director.password);
          let userInfor = {
            roleId: role[0].id,
            email: "newAcc@gmail.com",
            name: "newAcc",
            teamId: "1",
            password: "newAcc123",
          };
          chai
            .request(server)
            .post("/api/register")
            .send(userInfor)
            .set({
              authorization: loginInfor.token,
              tokentimestamp:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyOTIxNjFhNS1jYWY1LTQwMjctODIzNS1jYTRjM2Q5YzFiY2EiLCJyb2xlSWQiOiI0ODE4NTAyNy1iMjYxLTQ3NjYtOTFiNy1iMWMxMzQzYjBmMjkiLCJ0aW1lc3RhbXAiOiIxNjEwNzAxNTAwMjkyIiwiaWF0IjoxNjEwNzAxNTAwfQ.fkGFJoPuBBhzbSvSNHu67dw9HEdnRLwmJ7Ipx4OSpug",
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.data.userId.should.be.a("string");
              done();
            });
        });
    
        
      });
})