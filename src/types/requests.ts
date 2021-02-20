export type Pagination = {
  limit: string;
  pageNumber: string;
  sortBy: string;
  sort: "desc" | "asc";
};

export type SearchResposne<T> = {
  total: number;
  pageNumber: number;
  result: T[];
};

export type BookReq = {
  name: string;
  author: string;
};
