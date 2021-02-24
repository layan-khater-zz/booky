import { compareSync, hashSync } from "bcryptjs";
import express from "express";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";
import { verifyJwtToken } from "./middlewares/jwt";
import Book from "./schemas/book";
import User, { IUser } from "./schemas/user";
import {
  BookRequest,
  LoginRequest,
  Pagination,
  RegistrationRequest,
} from "./types/requests";
const app = express();
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

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

app.use(verifyJwtToken);
app.post("/auth/login", (req, res) => {
  const loginRequest: LoginRequest = req.body as LoginRequest;

  User.findOne({ email: loginRequest.email }, (err, user: IUser) => {
    if (err) res.status(500).end("Internal server error");
    if (!user) res.status(404).end("Invalid Email or Password");

    const isValidPassword = compareSync(loginRequest.password, user.password);
    if (!isValidPassword) res.status(401).end("Invalid Email or Password");
    const token = sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "2 days",
    });

    res.status(200).send({ token });
  });
});

app.post("/auth/register", (req, res) => {
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
