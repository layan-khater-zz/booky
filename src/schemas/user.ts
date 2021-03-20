import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  secondFactorKey: string;
  isSecondFactorEnabled: boolean;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  secondFactorKey: { type: String },
  isSecondFactorEnabled: { type: Boolean },
});

const User = model<IUser>("Users", userSchema);

export default User;
