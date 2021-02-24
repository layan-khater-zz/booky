import { isValidToken } from "../services/jwt";

export const verifyJwtToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).end();

  if (!isValidToken(token)) return res.status(401).end("Invalid token");

  next();
};
