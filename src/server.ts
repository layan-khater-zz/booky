import App from "./app";
import AuthController from "./controllers/AuthController";
import BooksController from "./controllers/booksController";
import { verifyJwtToken } from "./middlewares";
import { config } from "dotenv";
config();
export const createApp = (dburl: string, port: number) => {
  const app = new App(
    [
      new AuthController("/auth", verifyJwtToken),
      new BooksController("/books", verifyJwtToken),
    ],
    port,
    dburl
  );
  app.listen();
  app.connectDb();

  return app.app;
};
const env = process.env.NODE_ENV || "development";
console.log(process.env.NODE_ENV);
let dburl = process.env.DB_URL;
if (env === "test") {
  dburl = process.env.DB_URL_TEST;
}

console.log(dburl);
export default createApp(dburl, 8080);
