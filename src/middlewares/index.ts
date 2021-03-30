import { isValidToken } from "../services/jwt";

export const verifyJwtToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).end();

  if (!isValidToken(req, token)) return res.status(401).end("Invalid token");

  next();
};

export const IsAdmin = (req, res, next) => {};
export const IsUser = (req, res, next) => {};
export const IsPartiallyAuthenticated = (req, res, next) => {};
