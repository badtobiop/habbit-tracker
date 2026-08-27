import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from './turso';
import { User } from '@/types';

export const SUPER_ADMIN_EMAIL = 'utkarshdhakane2@gmail.com';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_anime_habit_tracker_jwt_key_2026_x89f';
const secretKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'anime_habit_auth_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function createAuthToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  // Always ensure SuperAdmin email carries 'admin' role
  const isSuperAdmin = payload.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const assignedRole = isSuperAdmin ? 'admin' : payload.role || 'user';

  return new SignJWT({ ...payload, role: assignedRole })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);
}

export async function verifyAuthToken(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as { userId: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}

/**
 * Server-side helper to strictly authenticate requests and fetch the authenticated User
 * This guarantees user isolation - queries always match the verified token.
 */
export async function getAuthUser(req: NextRequest): Promise<User | null> {
  try {
    let token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      // Also check Authorization header as fallback (e.g. Bearer token)
      const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    const payload = await verifyAuthToken(token);
    if (!payload?.userId) {
      return null;
    }

    const user = await queryOne<User>(
      'SELECT id, name, email, avatar, companion, role, plan_status, xp, level, current_streak, best_streak, total_completions, bio, created_at, updated_at FROM users WHERE id = ?',
      [payload.userId]
    );

    if (!user) {
      return null;
    }

    // Permanently guarantee Master SuperAdmin role for utkarshdhakane2@gmail.com
    if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      user.role = 'admin';
    }

    return user;
  } catch (error) {
    console.error('getAuthUser error:', error);
    return null;
  }
}

export function createAuthCookieHeader(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${isProd ? '; Secure' : ''}`;
}

export function createClearAuthCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
