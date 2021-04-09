import { request, assert } from "chai";
import { config } from "dotenv";
import Book from "../schemas/book";
import User from "../schemas/user";
import server from "../server";
import { bookRequest, registrationRequest } from "./testData";
config();
describe("book apis", () => {
  let memberToken: string;
  let adminToken: string;
  let newBookId: string;
  before("test setup", async () => {
    const registration = await request(server)
      .post("/auth/register")
      .send(registrationRequest);
    assert.equal(registration.status, 200);

    // get member token
    const memberLogin = await request(server).post("/auth/login").send({
      email: registrationRequest.email,
      password: registrationRequest.password,
    });
    assert.notEqual(memberLogin.body.token, "");
    assert.equal(memberLogin.status, 200);
    memberToken = memberLogin.body.token;

    //get admin token
    const adminLogin = await request(server).post("/auth/login").send({
      email: "admin@booky.com",
      password: "Pass@123",
    });
    assert.notEqual(adminLogin.body.token, "");
    assert.equal(adminLogin.status, 200);
    adminToken = adminLogin.body.token;
  });

  it("create book successfully (admin token)", () => {
    request(server)
      .post("/books/create")
      .auth(adminToken, { type: "bearer" })
      .send(bookRequest)
      .end((err, res) => {
        assert.equal(res.status, 200);
        newBookId = res.body.id;
      });
  });

  it("create book (member token)", () => {
    request(server)
      .post("/books/create")
      .auth(memberToken, { type: "bearer" })
      .send(bookRequest)
      .end((err, res) => {
        assert.equal(err.statusCode, 401);
        assert.equal(err.rawResponse, "UnAuthorized: Invalid Role");
      });
  });
  it("create book without author", () => {});
  it("create book without name", () => {});

  it("get books (member token)", () => {
    request(server)
      .get("/books")
      .auth(memberToken, { type: "bearer" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.total, 1);
      });
  });

  it("get books (admin token)", () => {
    request(server)
      .get("/books")
      .auth(memberToken, { type: "bearer" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.total, 1);
      });
  });

  it("get book by id", () => {
    request(server)
      .get(`/books/${newBookId}`)
      .auth(memberToken, { type: "bearer" })
      .end((err, res) => {
        assert.equal(res.status, 200);
      });
  });
  it("create patch books", () => {
    const books = Array.from(Array(3).keys()).map(() => bookRequest);
    request(server)
      .patch("/books")
      .auth(adminToken, { type: "bearer" })
      .send(books)
      .end((err, res) => {
        assert.equal(res.status, 201);
      });
  });

  it("create patch books empty body", () => {});

  after("remove account", async () => {
    await User.deleteOne({ email: registrationRequest.email }, {});
    await Book.deleteMany();
  });
});
