import { compareSync, hashSync } from "bcryptjs";
import { Router, Request, Response } from "express";
import { IController } from "../interfaces";
import User, { IUser, Role } from "../schemas/user";
import {
  LoginRequest,
  RegistrationRequest,
  setupSecondFactorRequest,
  ValidateSecondFactorRequest,
} from "../types/requests";
import { sign } from "jsonwebtoken";
import * as speakeasy from "speakeasy";
import * as uuid from "uuid";
import OtpToken, { OtpType } from "../schemas/otp";
import { useRoleChecker } from "../middlewares";
import bookyError from "../bookyErrors";
import { body, validationResult } from "express-validator";
import { nameof } from "../helpers";

class AuthController implements IController {
  public path: string;
  public router = Router();
  constructor(path: string, verfiyToken: any) {
    this.path = path;
    this.initializePublicRoutes();
    this.initializePrivateRoutes(verfiyToken);
  }
  private initializePrivateRoutes(verifyJwtToken: any) {
    this.router.post(
      `/setupSecondFactor`,
      verifyJwtToken,
      useRoleChecker([Role.member, Role.admin]),
      this.setupSecondFactor
    );
    this.router.post(
      `/validateSecondFactor`,
      verifyJwtToken,
      useRoleChecker([Role.member, Role.admin]),
      this.validateSecondFactor
    );
  }

  private initializePublicRoutes() {
    this.router.post(
      `/login`,
      body(nameof<RegistrationRequest>("email")).notEmpty().isEmail(),
      body(nameof<RegistrationRequest>("password")).notEmpty(),
      this.login
    );
    this.router.post(
      `/register`,
      body(nameof<RegistrationRequest>("email")).notEmpty().isEmail(),
      body(nameof<RegistrationRequest>("password"))
        .notEmpty()
        .isLength({ min: 6 }),
      body(nameof<RegistrationRequest>("name")).notEmpty(),
      this.register
    );
    // this.router.post(`/setupSecondFactor`, this.generate2FaQrCodeUrl);
  }

  setupSecondFactor = async (req, res: Response) => {
    const reqUser = req.user;

    const user = await User.findById(reqUser.id);

    const secretKey = speakeasy.generateSecret({
      name: user.email,
      issuer: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
    });

    await User.updateOne(
      {
        _id: reqUser.id,
      },
      {
        secondFactorKey: secretKey.base32,
      }
    );
    return res.status(200).send({
      otpauthUrl: secretKey.otpauth_url,
      base32: secretKey.base32,
    });
  };

  validateSecondFactor = async (req, res: Response) => {
    const secondFactorRequest = req.body as ValidateSecondFactorRequest;
    const reqUser = req.user;
    const user = await User.findById(reqUser.id);

    const verified = speakeasy.totp.verify({
      secret: user.secondFactorKey,
      encoding: "base32",
      token: secondFactorRequest.code,
    });
    if (!verified) return res.status(400).send(bookyError.InvalidCode);
    await user.updateOne({
      isSecondFactorEnabled: true,
    });
    return res.status(200).end();
  };

  login = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const loginRequest: LoginRequest = req.body as LoginRequest;

    if (loginRequest.otp) {
      const otp = await OtpToken.findOne({
        token: loginRequest.otp,
      }).populate("user");
      if (!otp) return res.status(404).end("Otp Not found");
      const verified = speakeasy.totp.verify({
        secret: otp.user.secondFactorKey,
        encoding: "base32",
        token: loginRequest.code,
      });
      if (verified) {
        const token = sign(
          { id: otp.user._id, role: otp.user.role },
          process.env.SECRET_KEY,
          {
            expiresIn: "2 days",
          }
        );
        return res.status(200).send({ token });
      } else {
        return res.status(400).end("Otp is not varified");
      }
    }
    try {
      const user = await User.findOne({ email: loginRequest.email });
      if (!user) return res.status(404).end("Invalid Email or Password");

      if (user.isSecondFactorEnabled) {
        const newOtp = new OtpToken({
          token: uuid.v1(),
          type: OtpType.totp,
          user: user,
        });

        await newOtp.save();
        return res.status(200).send({
          otp: newOtp.token,
        });
      } else {
        const isValidPassword = compareSync(
          loginRequest.password,
          user.password
        );
        if (!isValidPassword)
          return res.status(401).send("Invalid Email or Password");
      }

      const token = sign(
        { id: user._id, role: user.role },
        process.env.SECRET_KEY,
        {
          expiresIn: "2 days",
        }
      );

      return res.status(200).send({ token });
    } catch {
      return res.status(500).end("Internal server error");
    }
  };

  register = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newUserReq: RegistrationRequest = req.body as RegistrationRequest;
    const users = await User.find({ email: newUserReq.email });
    if (users.length != 0) {
      return res.status(400).send(bookyError.EmailAlreadyExist);
    }

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
        return res.status(200).end();
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).end();
      });
  };
}

export default AuthController;
