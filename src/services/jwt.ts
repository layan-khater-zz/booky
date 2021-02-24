import { verify } from "jsonwebtoken";
export const isValidToken = (token: string) => {
  let isValid = false;
  verify(token, process.env.SECRET_KEY, (err) => {
    isValid = !!err;
  });
  return isValid;
};
