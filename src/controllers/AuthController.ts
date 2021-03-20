import { compareSync, hashSync } from "bcryptjs";
import { Router, Request, Response } from "express";
import { IController } from "../interfaces";
import User, { IUser } from "../schemas/user";
import {
  LoginRequest,
  RegistrationRequest,
  setupSecondFactorRequest,
  ValidateSecondFactorRequest,
} from "../types/requests";
import { sign } from "jsonwebtoken";
import * as speakeasy from "speakeasy";
import * as uuid from "uuid";
import OtpToken, { IOtp, OtpType } from "../schemas/otp";

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
    this.router.post(`${this.path}/2fa/generateQr`, this.register);
  }

  generate2FaQrCodeUrl = (req: Request, res: Response) => {
    const secretCode = speakeasy.generateSecret({
      name: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
    });

    res.status(200).send({
      otpauthUrl: secretCode.otpauth_url,
      base32: secretCode.base32,
    });
  };

  setupSecondFactor = (req, res: Response) => {
    const secondFactorRequest = req.body as setupSecondFactorRequest;
    const reqUser = req.user;

    const verified = speakeasy.totp.verify({
      secret: secondFactorRequest.secretKey,
      encoding: "base32",
      token: secondFactorRequest.code,
    });

    if (!verified) {
      res.status(401).send("Code is Invalid");
    }

    User.updateOne(
      {
        _id: reqUser.id,
      },
      {
        isSecondFactorEnabled: true,
        secondFactorKey: secondFactorRequest.secretKey,
      }
    );
  };

  validateSecondFactor = (req, res: Response) => {
    const secondFactorRequest = req.body as ValidateSecondFactorRequest;
    const reqUser = req.user;

    const verified = speakeasy.totp.verify({
      secret: reqUser.id,
      encoding: "base32",
      token: secondFactorRequest.code,
    });
    if (!verified) res.status(401);

    res.status(200);
  };

  login = (req: Request, res: Response) => {
    const loginRequest: LoginRequest = req.body as LoginRequest;

    if (loginRequest.otp) {
      OtpToken.findOne(
        {
          token: loginRequest.otp,
        },
        (err, otp: IOtp) => {
          if (err) res.status(500).end("Internal server error");
          if (!otp) res.status(404).end("Otp Not found");

          if (otp.isVerified) {
            const token = sign({ id: otp.user._id }, process.env.SECRET_KEY, {
              expiresIn: "2 days",
            });
            res.status(200).send({ token });
          } else {
            res.status(400).end("Otp is not varified");
          }
        }
      );
    }
    User.findOne({ email: loginRequest.email }, (err, user: IUser) => {
      if (err) res.status(500).end("Internal server error");
      if (!user) res.status(404).end("Invalid Email or Password");

      const isValidPassword = compareSync(loginRequest.password, user.password);
      if (!isValidPassword) res.status(401).end("Invalid Email or Password");

      if (user.isSecondFactorEnabled) {
        const newOtp = new OtpToken({
          token: uuid.v1(),
          type: OtpType.totp,
          user: user,
        });
        newOtp.save().then(() => {
          res.status(200).send({
            otp: newOtp.token,
          });
        });
      }

      const token = sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "2 days",
      });

      res.status(200).send({ token });
    });
  };

  register = (req: Request, res: Response) => {
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
  };
}

export default AuthController;
