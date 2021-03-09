import express, { Router } from "express";

interface IController {
  path: string;
  router: Router;
}
interface IApp {
  app: express.Application;
  port: number;
}

export { IController, IApp };
