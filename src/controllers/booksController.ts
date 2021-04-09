import { Router, Request, Response } from "express";
import { Types } from "mongoose";
import bookyError from "../bookyErrors";
import { IController } from "../interfaces";
import { useRoleChecker } from "../middlewares";
import Book from "../schemas/book";
import { Role } from "../schemas/user";
import { BookRequest, Pagination } from "../types/requests";
import { body, validationResult } from "express-validator";
import { nameof } from "../helpers";

class BooksController implements IController {
  public path: string;
  public router = Router();

  constructor(path: string, verifyToken: any) {
    this.path = path;
    this.initializePublicRoutes();
    this.initializePrivateRoutes(verifyToken);
  }
  private initializePrivateRoutes(verifyToken: any) {
    this.router.post(
      "/create",
      verifyToken,
      useRoleChecker([Role.admin]),
      body(nameof<BookRequest>("author")).notEmpty(),
      body(nameof<BookRequest>("name")).notEmpty(),
      this.createBook
    );
    this.router.patch(
      "",
      verifyToken,
      useRoleChecker([Role.admin]),
      body().isArray({ min: 0, max: 30 }),
      body(`*.${nameof<BookRequest>("author")}`).notEmpty(),
      body(`*.${nameof<BookRequest>("name")}`).notEmpty(),
      this.createBooks
    );
    this.router.put(
      `/:bookId`,
      verifyToken,
      useRoleChecker([Role.admin]),
      this.updateBook
    );
    this.router.delete(
      `/:bookId`,
      verifyToken,
      useRoleChecker([Role.admin]),
      this.deleteBook
    );
    this.router.get(
      "/:bookId",
      verifyToken,
      useRoleChecker([Role.member, Role.admin]),
      this.getBook
    );
    this.router.get(
      "",
      verifyToken,
      useRoleChecker([Role.member, Role.admin]),
      this.searchBooks
    );
  }

  private initializePublicRoutes() {}

  createBook = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newBookReq: BookRequest = req.body as BookRequest;
    const newBook = new Book({
      name: newBookReq.name,
      author: newBookReq.author,
    });
    newBook
      .save()
      .then((r) => {
        return res.status(200).send({ id: r.id });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).end();
      });
  };

  createBooks = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newBookReqs: BookRequest[] = req.body as BookRequest[];
    const newBooks = newBookReqs.map(
      (newBookReq: BookRequest) =>
        new Book({
          name: newBookReq.name,
          author: newBookReq.author,
        })
    );
    await Book.insertMany(newBooks)
      .then((r) => {
        return res.status(201).send();
      })
      .catch((err) => {
        return res.status(500).end();
      });
  };

  updateBook = async (req: Request, res: Response) => {
    const toUpdateBookReq: BookRequest = req.body as BookRequest;
    const { bookId } = req.params;
    const toUpdateBook = await Book.findById(bookId);

    toUpdateBook
      .update({ author: toUpdateBookReq.author, name: toUpdateBookReq.name })
      .then((r) => {
        res.status(201).end();
      })
      .catch((err) => {
        console.log(err);
        res.status(500).end();
      });
  };

  deleteBook = async (req: Request, res: Response) => {
    const { bookId } = req.params;
    await Book.findByIdAndDelete(bookId)
      .then((r) => {
        res.status(201).end();
      })
      .catch((err) => {
        console.log(err);
        res.status(500).end();
      });
  };

  getBook = async (req: Request, res: Response) => {
    const bookParam = req.params.bookId as string;
    const bookId = Types.ObjectId(bookParam);

    const book = await Book.findById(bookId);

    return book != null
      ? res.status(200).send(book)
      : res.status(404).send(bookyError.BookNotFound(bookParam));
  };

  searchBooks = async (req: Request, res: Response) => {
    const paginatedQuery: Pagination = (req.query as unknown) as Pagination;
    const limit = parseInt(paginatedQuery.limit as string);
    const pageNumber = parseInt(paginatedQuery.pageNumber as string);
    await Book.find(
      {},
      null,
      {
        limit: limit,
        skip: limit * (pageNumber - 1),
      },
      (err, books) => {
        const jsonSearchResBooks = JSON.stringify({
          total: books.length,
          result: books,
          pageNumber: pageNumber,
        });

        res.status(200).end(jsonSearchResBooks);
      }
    );
  };
}

export default BooksController;
