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

export type BookRequest = {
  name: string;
  author: string;
};

export type RegistrationRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};
