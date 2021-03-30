import { Document, model, Schema } from "mongoose";
import { IUser } from "./user";

export interface IOtp extends Document {
  token: string;
  type: OtpType;
  isVerified: boolean;
  user: IUser;
}
export enum OtpType {
  none = "none",
  totp = "totp",
  otp = "otp",
}

const otpTokensSchema = new Schema<IOtp>({
  token: { type: String, required: true },
  type: { enum: Object.values(OtpType), default: OtpType.none },
  isVerified: { type: Boolean, default: false },
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
});

const OtpToken = model<IOtp>("OtpTokens", otpTokensSchema);

export default OtpToken;
