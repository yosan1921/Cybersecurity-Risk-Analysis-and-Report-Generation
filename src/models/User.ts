import mongoose, { Document, Model, Schema } from "mongoose";

export type UserRole = "Director" | "Division Head" | "Risk Analyst" | "Staff";

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  // MFA fields
  mfaEnabled: boolean;
  mfaSecret?: string;          // encrypted TOTP secret
  mfaBackupCodes?: string[];   // hashed backup codes
  mfaPending?: boolean;        // true while setup not yet verified
  // SSO fields
  googleId?: string;
  githubId?: string;
  azureId?: string;
  createdAt: Date;
  updatedAt: Date;
}
const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },   // optional — SSO users may have no password
    role: {
      type: String,
      enum: ["Director", "Division Head", "Risk Analyst", "Staff"],
      required: true,
    },
    name: { type: String },
    // MFA
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String },
    mfaBackupCodes: { type: [String], default: [] },
    mfaPending: { type: Boolean, default: false },
    // SSO provider IDs
    googleId: { type: String, sparse: true },
    githubId: { type: String, sparse: true },
    azureId: { type: String, sparse: true },
  },
  {
    timestamps: true,
  }
);
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

