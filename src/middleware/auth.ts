import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", error: { code: "UNAUTHORIZED", message: "Missing Authorization header" } });
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "") as any;
    req.user = { id: payload.sub, roles: payload.roles || ["user"] };
    next();
  } catch (err) {
    return res.status(401).json({ status: "error", error: { code: "TOKEN_INVALID", message: "Invalid access token" } });
  }
}