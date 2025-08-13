import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export function signAccessToken(userId: string, roles: string[] = []) {
  const secret = process.env.JWT_ACCESS_SECRET || "";
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_MINUTES ? `${process.env.ACCESS_TOKEN_EXPIRES_MINUTES}m` : "15m";
  return jwt.sign({ roles }, secret, { subject: userId, expiresIn });
}

// refresh tokens are random strings stored hashed in DB (not JWT)
export function makeRefreshToken() {
  return uuidv4();
}