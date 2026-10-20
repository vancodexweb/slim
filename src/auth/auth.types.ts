import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
}

export interface AuthUser {
  id: string;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}
