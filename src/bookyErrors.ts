const UnAuthorized = "UnAuthorized:";
const BadRequest = "BadRequest:";
const NotFound = "NotFound:";

const bookyError = {
  InvalidToken: `${UnAuthorized} Invalid Token`,
  InvalidRole: `${UnAuthorized} Invalid Role`,
  EmailAlreadyExist: {
    type: BadRequest,
    message: "Account with the provide email is already exist.",
  },
  InvalidCode: {
    type: BadRequest,
    message: "Invalid Code.",
  },
  BookNotFound: (bookId: string) => ({
    type: NotFound,
    message: `Book with Id ${bookId} is not found.`,
  }),
};

export default bookyError;
