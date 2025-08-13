import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export function signAccessToken(userId: string, roles: string[] = []) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not set");
  }

  const expiresIn = (process.env.ACCESS_TOKEN_EXPIRES_MINUTES
    ? `${process.env.ACCESS_TOKEN_EXPIRES_MINUTES}m`
    : "15m") as SignOptions["expiresIn"];

  const options: SignOptions = {
    subject: String(userId),
    expiresIn,
  };

  return jwt.sign({ roles }, secret, options);
}

// Refresh tokens are random strings stored hashed in DB (not JWT)
export function makeRefreshToken() {
  return uuidv4();
}
