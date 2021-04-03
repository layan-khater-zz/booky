import { hashSync } from "bcryptjs";
import express, { Request, Response } from "express";
import mongoose, { connect, connection, Connection } from "mongoose";
import { IController, IApp } from "./interfaces";
import User, { IUser, Role } from "./schemas/user";
class App implements IApp {
  public app: express.Application;
  public port: number;
  private db: Connection;
  constructor(controllers: IController[], port: number, url: string) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.intializeControllers(controllers);
    this.intializeDbConnection(url);
    this.db = connection;
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((req, res, next) => {
      res.setHeader("Content-Type", "application/json");
      next();
    });
  }

  private intializeControllers(controllers: IController[]) {
    controllers.forEach((c) => {
      this.app.use(c.path, c.router);
    });
    this.app.get("/healthcheck", this.healthCheck);
  }
  private intializeDbConnection = (url: string) => {
    connect(
      url,
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
      (err: any) => {
        if (err) throw err;
      }
    );
  };
  connectDb = () => {
    this.db.once("open", async () => {
      console.log("we are connected!");
      const userAdmin = await User.find({ email: "admin@booky.com" });
      if (userAdmin.length == 0) {
        const newUser = new User({
          name: "system admin",
          email: "admin@booky.com",
          password: hashSync("Pass@123"),
          role: Role.admin,
        } as IUser);
        await newUser.save();
      }
    });
  };

  healthCheck = (req: Request, res: Response) => {
    res.send("healthy");
  };

  public listen = () => {
    this.app.listen(this.port, () => console.log("listening to 8080"));
  };
}

export default App;
