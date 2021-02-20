import { Document, Schema, model } from "mongoose";

interface IBook extends Document {
  name: string;
  author: string;
}
const bookSchema = new Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
});

const Book = model<IBook>("Book", bookSchema);
export default Book;
