import App from "./app";
import AuthController from "./controllers/AuthController";
import BooksController from "./controllers/booksController";

const app = new App(
  [new AuthController("/auth"), new BooksController("/books")],
  8080,
  process.env.DB_URL
);
app.listen();
app.connectDb();
