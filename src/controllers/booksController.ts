import { Router, Request, Response } from "express";
import { IController } from "../interfaces";
import Book from "../schemas/book";
import { BookRequest, Pagination } from "../types/requests";

class BooksController implements IController {
  public path: string;
  public router = Router();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(this.path, this.createBook);
    this.router.patch(this.path, this.createBooks);
    this.router.put(`${this.path}/:bookId`, this.updateBook);
    this.router.delete(`${this.path}/:bookId`, this.deleteBook);
    this.router.get(`${this.path}/:bookId`, this.getBook);
    this.router.get(`${this.path}`, this.searchBooks);
  }

  createBook = (req: Request, res: Response) => {
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
  };

  createBooks = (req: Request, res: Response) => {
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
  };

  updateBook = (req: Request, res: Response) => {
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
  };

  deleteBook = (req: Request, res: Response) => {
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
  };

  getBook = (req: Request, res: Response) => {
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
  };
  searchBooks = (req: Request, res: Response) => {
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
  };
}

export default BooksController;
