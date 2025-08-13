import { Request, Response } from "express";
import UserModel from "../models/User";
import SessionModel from "../models/Session";
import { registerSchema, loginSchema } from "../validators/auth";
import { hash, compare } from "../utils/hash";
import { signAccessToken, makeRefreshToken } from "../utils/jwt";
import { Types } from "mongoose";

const COOKIE_NAME = process.env.COOKIE_NAME || "refresh_token";
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", error: { code: "INVALID_INPUT", message: parsed.error.message } });
  }

  const { email, password, name } = parsed.data;

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return res.status(409).json({ status: "error", error: { code: "USER_EXISTS", message: "Email already registered" } });
  }

  const passwordHash = await hash(password);
  const user = await UserModel.create({ email, name, passwordHash });

  // issue tokens
  const accessToken = signAccessToken(user._id.toString(), user.roles);
  const refreshToken = makeRefreshToken();
  const refreshHash = await hash(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await SessionModel.create({ userId: user._id, refreshTokenHash: refreshHash, ip: req.ip, userAgent: req.get("user-agent"), expiresAt });

  res.cookie(COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  });

  return res.status(201).json({ status: "ok", data: { accessToken, user: { id: user._id, email: user.email, name: user.name } } });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", error: { code: "INVALID_INPUT", message: parsed.error.message } });
  }

  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ status: "error", error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });

  const ok = await compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ status: "error", error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });

  const accessToken = signAccessToken(user._id.toString(), user.roles);
  const refreshToken = makeRefreshToken();
  const refreshHash = await hash(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await SessionModel.create({ userId: user._id, refreshTokenHash: refreshHash, ip: req.ip, userAgent: req.get("user-agent"), expiresAt });

  res.cookie(COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  });

  user.lastLoginAt = new Date();
  await user.save();

  return res.json({ status: "ok", data: { accessToken, user: { id: user._id, email: user.email, name: user.name } } });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ status: "error", error: { code: "NO_REFRESH_TOKEN", message: "Refresh token missing" } });

  // find matching session by hashing provided token and comparing
  const sessions = await SessionModel.find({ expiresAt: { $gt: new Date() } });

  // For performance, in production we'd store hashed token and search directly; here we compare
  let found: any = null;
  for (const s of sessions) {
    const match = await compare(token, s.refreshTokenHash);
    if (match) {
      found = s;
      break;
    }
  }

  if (!found) return res.status(401).json({ status: "error", error: { code: "INVALID_REFRESH", message: "Refresh token invalid" } });

  // rotate tokens: issue new refresh token
  const newRefresh = makeRefreshToken();
  const newHash = await hash(newRefresh);
  found.refreshTokenHash = newHash;
  found.expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await found.save();

  const accessToken = signAccessToken(found.userId.toString());
  res.cookie(COOKIE_NAME, newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  });

  return res.json({ status: "ok", data: { accessToken } });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    // remove session(s) matching this token
    const sessions = await SessionModel.find({});
    for (const s of sessions) {
      // compare and delete
      // NOTE: scanning all sessions is not optimal — use hashed lookup in production
      // but acceptable for MVP
      // eslint-disable-next-line no-await-in-loop
      const match = await compare(token, s.refreshTokenHash);
      if (match) {
        await s.deleteOne();
      }
    }
  }

  res.clearCookie(COOKIE_NAME);
  return res.json({ status: "ok", data: null });
}