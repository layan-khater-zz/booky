import App from "./app";
import AuthController from "./controllers/AuthController";
import BooksController from "./controllers/booksController";
import { verifyJwtToken } from "./middlewares";

const app = new App(
  [
    new AuthController("/auth", verifyJwtToken),
    new BooksController("/books", verifyJwtToken),
  ],
  8080,
  process.env.DB_URL
);
app.listen();
app.connectDb();
