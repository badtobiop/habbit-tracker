import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, createAuthToken, createAuthCookieHeader, SUPER_ADMIN_EMAIL } from '@/lib/auth';
import { sendAdminAlert } from '@/lib/mailer';
import { validateEmailAddress } from '@/lib/email-validator';
import { User } from '@/types';

// In-Memory Brute Force & Rate Limiting Protection Map
interface RateLimitEntry {
  failedAttempts: number;
  lockedUntil: number;
}
const loginRateLimiter = new Map<string, RateLimitEntry>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lock

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    const cleanEmail = emailValidation.normalizedEmail;
    const now = Date.now();

    // 1. Check Rate Limit & Account Lockout
    const rateLimit = loginRateLimiter.get(cleanEmail);
    if (rateLimit && rateLimit.lockedUntil > now) {
      const remainingMinutes = Math.ceil((rateLimit.lockedUntil - now) / 60000);
      return NextResponse.json({
        error: `Security Lockout: Too many failed login attempts. Account temporarily locked for ${remainingMinutes} more minute(s) to protect your security.`,
      }, { status: 429 });
    }

    // 2. Query user from DB
    const user = db.prepare(`
      SELECT id, name, email, password, avatar, companion, role, plan_status, xp, level, current_streak, best_streak, total_completions, bio, created_at, updated_at 
      FROM users 
      WHERE LOWER(email) = ?
    `).get(cleanEmail) as (User & { password: string }) | undefined;

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. Compare Bcrypt Hash Password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      // Record failed attempt
      const attempts = (rateLimit?.failedAttempts || 0) + 1;
      const isNowLocked = attempts >= MAX_FAILED_ATTEMPTS;

      loginRateLimiter.set(cleanEmail, {
        failedAttempts: attempts,
        lockedUntil: isNowLocked ? now + LOCKOUT_DURATION_MS : 0,
      });

      if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
        sendAdminAlert({
          eventType: 'PASSWORD_RESET',
          userName: 'Admin Security Guard',
          userEmail: cleanEmail,
          details: `🚨 SECURITY WARNING: Failed password attempt (${attempts}/${MAX_FAILED_ATTEMPTS}) detected on Master Admin account!`,
        }).catch((err) => console.error('Alert error:', err));
      }

      if (isNowLocked) {
        return NextResponse.json({
          error: 'Security Lockout: 5 failed attempts exceeded. Account temporarily locked for 15 minutes.',
        }, { status: 429 });
      }

      return NextResponse.json({
        error: `Invalid email or password. (${MAX_FAILED_ATTEMPTS - attempts} attempt(s) remaining before security lockout)`,
      }, { status: 401 });
    }

    // 4. Successful login: Clear failed attempts
    loginRateLimiter.delete(cleanEmail);

    // 5. Permanently guarantee Master SuperAdmin role ONLY for utkarshdhakane2@gmail.com
    const isMasterOwner = user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const effectiveRole = isMasterOwner ? 'admin' : 'user';

    if (isMasterOwner && user.role !== 'admin') {
      db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
    }

    const token = await createAuthToken({
      userId: user.id,
      email: user.email,
      role: effectiveRole,
    });

    const sanitizedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      companion: user.companion,
      role: effectiveRole,
      plan_status: user.plan_status,
      xp: user.xp,
      level: user.level,
      current_streak: user.current_streak,
      best_streak: user.best_streak,
      total_completions: user.total_completions,
      bio: user.bio,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    // Trigger Admin notification alert for user login
    const isUserPaid = user.plan_status === 'paid_active' || user.plan_status === 'pro' || isMasterOwner;
    sendAdminAlert({
      eventType: 'USER_LOGIN',
      userName: user.name,
      userEmail: user.email,
      isPaid: isUserPaid,
      details: isUserPaid
        ? `Paid User logged in. Level: ${user.level}, Streak: ${user.current_streak}`
        : `⚠️ Unpaid User logged in (₹49 Payment pending). Level: ${user.level}, Streak: ${user.current_streak}`,
    }).catch((err) => console.error('Alert send error:', err));

    const response = NextResponse.json({
      success: true,
      user: sanitizedUser,
    });

    response.headers.set('Set-Cookie', createAuthCookieHeader(token));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}
