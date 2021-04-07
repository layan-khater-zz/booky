import { should, request, use, expect } from "chai";
import chaiHttp from "chai-http";
import server from "../server";
import { RegistrationRequest } from "../types/requests";
import { config } from "dotenv";
//config();
console.log(process.env["NODE_ENV"]);
use(chaiHttp);
describe("auth api", () => {
  describe("register Endpoint", () => {
    request(server)
      .post("/auth/register")
      .send({
        email: "layan.khater335@gmail.com",
        name: "layan khater",
        password: "Pass@123",
      } as RegistrationRequest)
      .end((err, res) => {
        console.log(res.status);
        expect(res).to.have.status(200);
      });
  });
});
