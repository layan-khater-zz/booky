import { should, request, use, assert } from "chai";
import { config } from "dotenv";
import server from "../server";
import { registrationRequest } from "./testData";
import { before } from "mocha";
import chaiHttp from "chai-http";
import User from "../schemas/user";
config();
use(chaiHttp);

describe("auth apis", () => {
  before("test setup", async () => {
    const registration = await request(server)
      .post("/auth/register")
      .send(registrationRequest);
    assert.equal(registration.status, 200);

    // // get member token
    // const memberLogin = await request(server).post("/auth/login").send({
    //   email: registrationRequest.email,
    //   password: registrationRequest.password,
    //  });
    // assert.notEqual(memberLogin.body.token, "");
    // assert.equal(memberLogin.status, 200);
    // memberToken = memberLogin.body.token;

    // //get admin token
    // const adminLogin = await request(server).post("/auth/login").send({
    //   email: "admin@booky.com",
    //   password: "Pass@123",
    // });
    // assert.notEqual(adminLogin.body.token, "");
    // assert.equal(adminLogin.status, 200);
    // adminToken = adminLogin.body.token;
  });
  it("register an exists account return 400", () => {
    request(server)
      .post("/auth/register")
      .send(registrationRequest)
      .end((err, res) => {
        assert.equal(res.status, 400);
      });
  });

  it("register account without password", () => {
    const regReq = { ...registrationRequest };
    regReq.password = "";
    request(server)
      .post("/auth/register")
      .send(regReq)
      .end((err, res) => {
        assert.equal(res.status, 400);
      });
  });

  it("register account with short password", () => {
    const regReq = { ...registrationRequest };
    regReq.password = "123";
    request(server)
      .post("/auth/register")
      .send(regReq)
      .end((err, res) => {
        assert.equal(res.status, 400);
      });
  });

  it("register account without email", () => {
    const regReq = { ...registrationRequest };
    regReq.email = "";
    request(server)
      .post("/auth/register")
      .send(regReq)
      .end((err, res) => {
        assert.equal(res.status, 400);
      });
  });

  it("register account with wrong email structure", () => {
    const regReq = { ...registrationRequest };
    regReq.email = "layan";
    request(server)
      .post("/auth/register")
      .send(regReq)
      .end((err, res) => {
        assert.equal(res.status, 400);
      });
  });

  it("login successfully", () => {
    request(server)
      .post("/auth/login")
      .send({
        email: registrationRequest.email,
        password: registrationRequest.password,
      })
      .end((err, res) => {
        assert.notEqual(res.body.token, "");
        assert.equal(res.status, 200);
      });
  });

  it("login with wrong password", () => {
    request(server)
      .post("/auth/login")
      .send({
        email: registrationRequest.email,
        password: "any",
      })
      .end((err, res) => {
        assert.equal(res, undefined);
        assert.equal(err.statusCode, 401);
        assert.equal(err.rawResponse, "Invalid Email or Password");
      });
  });

  it("login with wrong email", () => {
    request(server)
      .post("/auth/login")
      .send({
        email: "layan@gmail.com",
        password: "Pass@123",
      })
      .end((err, res) => {
        assert.equal(res, undefined);
        assert.equal(err.statusCode, 404);
        assert.equal(err.rawResponse, "Invalid Email or Password");
      });
  });

  it("login without password", () => {
    request(server)
      .post("/auth/login")
      .send({
        email: "layan.khater3@gmail.com",
        password: "",
      })
      .end((err, res) => {
        assert.equal(res.status, 400);
      });
  });

  it("login without email", () => {
    request(server)
      .post("/auth/login")
      .send({
        email: "",
        password: "Pass@123",
      })
      .end((err, res) => {
        assert.equal(res.status, 400);
      });
  });

  after("remove account", (done) => {
    User.deleteOne({ email: registrationRequest.email }, {}, done);
  });
});
