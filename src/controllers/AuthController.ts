import { compareSync, hashSync } from "bcryptjs";
import { Router, Request, Response } from "express";
import { IController } from "../interfaces";
import User, { IUser } from "../schemas/user";
import { LoginRequest, RegistrationRequest } from "../types/requests";
import { sign } from "jsonwebtoken";

class AuthController implements IController {
  public path: string;
  public router = Router();
  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/login`, this.login);
    this.router.post(`${this.path}/register`, this.register);
  }

  login(req: Request, res: Response) {
    const loginRequest: LoginRequest = req.body as LoginRequest;

    User.findOne({ email: loginRequest.email }, (err, user: IUser) => {
      if (err) res.status(500).end("Internal server error");
      if (!user) res.status(404).end("Invalid Email or Password");

      const isValidPassword = compareSync(loginRequest.password, user.password);
      if (!isValidPassword) res.status(401).end("Invalid Email or Password");
      const token = sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "2 days",
      });

      res.status(200).send({ token });
    });
  }

  register(req: Request, res: Response) {
    const newUserReq: RegistrationRequest = req.body as RegistrationRequest;
    const hashedPassword = hashSync(newUserReq.password);
    const newUser = new User({
      name: newUserReq.name,
      email: newUserReq.email,
      password: hashedPassword,
    } as IUser);

    newUser
      .save()
      .then((r) => {
        console.log(`User Registration has been succeed`);
        res.status(200).end();
      })
      .catch((err) => {
        console.log(err);
        res.status(500).end();
      });
  }
}

export default AuthController;
