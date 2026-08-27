import { NextRequest, NextResponse } from 'next/server';
import { queryOne, executeSql } from '@/lib/turso';
import { hashPassword, createAuthToken, createAuthCookieHeader, SUPER_ADMIN_EMAIL } from '@/lib/auth';
import { sendAdminAlert, sendSignupOTPEmail } from '@/lib/mailer';
import { validateEmailAddress } from '@/lib/email-validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'verify-and-signup', name, email, password, otp, avatar = 'shadow_hunter', companion = 'shadow_wolf' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Strict Email Format & Spam Domain Validation
    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    const cleanEmail = emailValidation.normalizedEmail;

    // STEP 1: SEND SIGNUP VERIFICATION OTP
    if (action === 'send-otp') {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Please enter your shinobi username' }, { status: 400 });
      }

      // Check if user already exists
      const existing = await queryOne('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      if (existing) {
        return NextResponse.json({
          error: 'An account with this email already exists. Please log in instead.',
        }, { status: 400 });
      }

      // Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const now = new Date().toISOString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

      // Store OTP in database
      await executeSql(`
        INSERT INTO password_resets (email, otp, expires_at, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          otp = excluded.otp,
          expires_at = excluded.expires_at,
          created_at = excluded.created_at
      `, [cleanEmail, generatedOtp, expiresAt, now]);

      // Send OTP to user's real email
      const isEmailSent = await sendSignupOTPEmail(cleanEmail, name.trim(), generatedOtp);

      return NextResponse.json({
        success: true,
        message: isEmailSent
          ? `A 6-digit verification code has been dispatched to ${cleanEmail}. Check your inbox or spam folder.`
          : `Verification code generated for ${cleanEmail}.`,
        emailSent: isEmailSent,
        otpHint: process.env.NODE_ENV !== 'production' && !process.env.SMTP_USER ? generatedOtp : undefined,
      });
    }

    // STEP 2: VERIFY OTP AND COMPLETE REGISTRATION
    if (action === 'verify-and-signup') {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }

      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
      }

      if (!otp) {
        return NextResponse.json({ error: '6-digit OTP verification code is required' }, { status: 400 });
      }

      // Verify OTP from database
      const otpRecord = await queryOne<{ otp: string; expires_at: number }>(
        'SELECT otp, expires_at FROM password_resets WHERE LOWER(email) = ?',
        [cleanEmail]
      );

      if (!otpRecord) {
        return NextResponse.json({
          error: 'No active OTP verification found. Please request a new verification code.',
        }, { status: 400 });
      }

      if (Date.now() > otpRecord.expires_at) {
        await executeSql('DELETE FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);
        return NextResponse.json({
          error: 'Verification code has expired (10 minutes limit). Please request a new code.',
        }, { status: 400 });
      }

      if (otpRecord.otp.trim() !== String(otp).trim()) {
        return NextResponse.json({
          error: 'Invalid 6-digit verification code. Please check the code sent to your email.',
        }, { status: 400 });
      }

      // Check duplicate email again
      const existing = await queryOne('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(password);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();

      // Check if this is the Master Owner utkarshdhakane2@gmail.com
      const isMasterOwner = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();
      const role = isMasterOwner ? 'admin' : 'user';

      await executeSql(`
        INSERT INTO users (id, name, email, password, avatar, companion, role, plan_status, xp, level, current_streak, best_streak, total_completions, bio, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'free', 0, 1, 0, 0, 0, 'On a quest to awaken boundless discipline.', ?, ?)
      `, [userId, name.trim(), cleanEmail, hashedPassword, avatar, companion, role, now, now]);

      // Create starter habits for the new user
      const starterHabits = [
        { name: 'Morning Focus Meditation', category: 'Mindset', difficulty: 'easy', icon: 'Sparkles', color: '#dc2626', time: '07:30' },
        { name: 'Deep Coding / Study Quest (1hr)', category: 'Coding', difficulty: 'hard', icon: 'Code', color: '#ef4444', time: '10:00' },
        { name: 'Physical Training (Gym/Cardio)', category: 'Fitness', difficulty: 'medium', icon: 'Flame', color: '#b91c1c', time: '18:00' },
        { name: 'Read 15 Pages of Book', category: 'Study', difficulty: 'easy', icon: 'BookOpen', color: '#991b1b', time: '21:30' },
      ];

      for (const h of starterHabits) {
        const hId = `hab_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        await executeSql(`
          INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_days, reminder_time, difficulty, icon, color, is_archived, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 'daily', '[]', ?, ?, ?, ?, 0, ?, ?)
        `, [hId, userId, h.name, 'Daily discipline quest to level up your shinobi rank.', h.category, h.time, h.difficulty, h.icon, h.color, now, now]);
      }

      // Clean up used OTP
      await executeSql('DELETE FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);

      // Trigger Admin notification alert for new verified signup
      try {
        await sendAdminAlert({
          eventType: 'NEW_USER_SIGNUP',
          userName: name.trim(),
          userEmail: cleanEmail,
          isPaid: false,
          details: 'New user verified email and registered on the Shinobi platform.',
        });
      } catch (err) {
        console.error('Alert send error:', err);
      }

      const token = await createAuthToken({ userId, email: cleanEmail, role });

      const response = NextResponse.json({
        success: true,
        user: {
          id: userId,
          name: name.trim(),
          email: cleanEmail,
          avatar,
          companion,
          role,
          plan_status: 'free',
          xp: 0,
          level: 1,
          current_streak: 0,
          best_streak: 0,
          total_completions: 0,
        },
      });

      response.headers.set('Set-Cookie', createAuthCookieHeader(token));
      return response;
    }

    return NextResponse.json({ error: 'Invalid action requested' }, { status: 400 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
