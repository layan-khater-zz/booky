import express from "express";
import mongoose from "mongoose";
import { IController, IApp } from "./interfaces";
import { verifyJwtToken } from "./middlewares/jwt";
import Book from "./schemas/book";
import { BookRequest, Pagination } from "./types/requests";
const app = express();
// middleware

app.listen(8080, () => console.log("listening to 8080"));

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

app.post("/books/create", (req, res) => {
  const newBookReq: BookRequest = req.body as BookRequest;
  const newBook = new Book({
    name: newBookReq.name,
    author: newBookReq.author,
  });
  newBook
    .save()
    .then((r) => {
      console.log(`Book with name ${r.name} created successfuly`);
      res.status(201).end();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).end();
    });
});

app.patch("/books/create", (req, res) => {
  console.log(req.body);
  const newBookReqs: BookRequest[] = req.body as BookRequest[];
  const newBooks = newBookReqs.map(
    (newBookReq: BookRequest) =>
      new Book({
        name: newBookReq.name,
        author: newBookReq.author,
      })
  );
  Book.insertMany(newBooks)
    .then((r) => {
      console.log(`${r.length} books were created successfuly`);
      res.status(201).end(`${r.length} books were created successfuly`);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).end();
    });
});

app.put("/books/:bookId/update", (req, res) => {
  console.log(req.body);
  const toUpdateBookReq: BookRequest = req.body as BookRequest;
  const { bookId } = req.params;
  const toUpdateBook = Book.findById(bookId);

  toUpdateBook
    .update({ author: toUpdateBookReq.author, name: toUpdateBookReq.name })
    .then((r) => {
      console.log(`Book with name ${r.name} has updated successfuly`);
      res.status(201).end();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).end();
    });
});

app.delete("/books/:bookId", (req, res) => {
  const { bookId } = req.params;
  Book.findByIdAndDelete(bookId)
    .then((r) => {
      console.log(`Book with name ${r.name} has deleted successfuly`);
      res.status(201).end();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).end();
    });
});

app.get("/books", (req, res) => {
  const paginatedQuery: Pagination = (req.query as unknown) as Pagination;
  const limit = parseInt(paginatedQuery.limit as string);
  const pageNumber = parseInt(paginatedQuery.pageNumber as string);
  Book.find(
    {},
    null,
    {
      limit: limit,
      skip: limit * (pageNumber - 1),
    },
    (err, books) => {
      console.log(books);
      const jsonSearchResBooks = JSON.stringify({
        total: books.length,
        result: books,
        pageNumber: pageNumber,
      });

      res.status(200).end(jsonSearchResBooks);
    }
  );
});

app.get("/healthcheck", (req, res) => {
  res.send("healthy");
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
  }

  public listen() {
    app.listen(this.port);
  }
}
