import bookyError from "../bookyErrors";
import { Role } from "../schemas/user";
import { isValidToken } from "../services/jwt";

export const verifyJwtToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).end();

  if (!isValidToken(req, token))
    return res.status(401).end(bookyError.InvalidToken);

  next();
};

export const useRoleChecker = (allowedRoles: Role[]) => (req, res, next) => {
  let role: Role = parseInt(req.user.role, 10);
  return allowedRoles.includes(role)
    ? next()
    : res.status(401).send(bookyError.InvalidRole);
};
