import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export type AuthRequest = Request & { admin?: string };
export function signToken(username: string) { return jwt.sign({ sub: username }, config.JWT_SECRET, { expiresIn: '8h' }); }
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.radar_token ?? req.headers.authorization?.replace(/^Bearer\s+/i, '');
  try { req.admin = String(jwt.verify(token, config.JWT_SECRET).sub); next(); }
  catch { res.status(401).json({ error: '请先登录管理后台' }); }
}
