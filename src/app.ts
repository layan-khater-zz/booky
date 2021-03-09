import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { IController, IApp } from "./interfaces";
import { verifyJwtToken } from "./middlewares/jwt";

const url = "mongodb://localhost:27017/booky";

mongoose.connect(
  url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err: any) => {
    if (err) throw err;
  }
);

const db = mongoose.connection;

db.once("open", () => {
  console.log("we are connected!");
});

class App implements IApp {
  public app: express.Application;
  public port: number;
  constructor(controllers: IController[], port: number) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.intializeControllers(controllers);
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((req, res, next) => {
      res.setHeader("Content-Type", "application/json");
      next();
    });
    this.app.use(verifyJwtToken);
  }
  private intializeControllers(controllers: IController[]) {
    controllers.forEach((c) => {
      this.app.use(c.path, c.router);
    });
    this.app.get("/healthcheck", this.healthCheck);
  }

  healthCheck = (req: Request, res: Response) => {
    res.send("healthy");
  };

  public listen() {
    this.app.listen(this.port, () => console.log("listening to 8080"));
  }
}

export default App;
