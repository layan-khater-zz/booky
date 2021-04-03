import { verify } from "jsonwebtoken";
export const isValidToken = (req, token: string) => {
  let isValid = false;
  let tokenWithoutBearer = token.split(" ");
  verify(tokenWithoutBearer[1], process.env.SECRET_KEY, (err, user) => {
    req.user = user;

    isValid = !err;
  });
  return isValid;
};
