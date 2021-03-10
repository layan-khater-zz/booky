import express, { Router } from "express";

export interface IController {
  path: string;
  router: Router;
}
export interface IApp {
  app: express.Application;
  port: number;
}
