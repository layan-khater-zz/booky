import { verify } from "jsonwebtoken";
export const isValidToken = (req, token: string) => {
  let isValid = false;
  verify(token, process.env.SECRET_KEY, (err, user) => {
    req.user = user;

    isValid = !!err;
  });
  return isValid;
};
