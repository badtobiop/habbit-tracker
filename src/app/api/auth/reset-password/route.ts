import { NextRequest, NextResponse } from 'next/server';
import { queryOne, executeSql } from '@/lib/turso';
import { hashPassword } from '@/lib/auth';
import { validateEmailAddress } from '@/lib/email-validator';
import { sendPasswordResetOTPEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'verify-and-reset', email, otp, newPassword } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    const cleanEmail = emailValidation.normalizedEmail;

    // STEP 1: SEND OTP TO USER EMAIL
    if (action === 'send-otp') {
      const user = await queryOne<{ id: string; name: string; email: string }>(
        'SELECT id, name, email FROM users WHERE LOWER(email) = ?',
        [cleanEmail]
      );

      if (!user) {
        return NextResponse.json({
          error: `No registered account found for ${cleanEmail}. Please create an account on the signup page first.`,
        }, { status: 404 });
      }

      // Generate secure 6-digit OTP
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
      const isEmailSent = await sendPasswordResetOTPEmail(cleanEmail, user.name, generatedOtp);

      return NextResponse.json({
        success: true,
        message: isEmailSent
          ? `A 6-digit OTP has been dispatched to ${cleanEmail}. Check your inbox or spam folder.`
          : `OTP generated for ${cleanEmail}. (If SMTP is not configured on your server, OTP is recorded in security audit logs).`,
        emailSent: isEmailSent,
        otpHint: process.env.NODE_ENV !== 'production' && !process.env.SMTP_USER ? generatedOtp : undefined,
      });
    }

    // STEP 2: VERIFY OTP AND RESET PASSWORD
    if (action === 'verify-and-reset') {
      if (!otp || !newPassword) {
        return NextResponse.json({ error: 'Email, OTP code, and new password are required' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
      }

      const resetRecord = await queryOne<{ otp: string; expires_at: number }>(
        'SELECT otp, expires_at FROM password_resets WHERE LOWER(email) = ?',
        [cleanEmail]
      );

      if (!resetRecord) {
        return NextResponse.json({ error: 'No active OTP request found for this email. Please request a new OTP.' }, { status: 400 });
      }

      if (Date.now() > resetRecord.expires_at) {
        await executeSql('DELETE FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);
        return NextResponse.json({ error: 'OTP has expired (10 minutes limit). Please request a new OTP.' }, { status: 400 });
      }

      if (resetRecord.otp.trim() !== String(otp).trim()) {
        return NextResponse.json({ error: 'Invalid OTP code. Please check the code sent to your email.' }, { status: 400 });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      const now = new Date().toISOString();

      await executeSql(`
        UPDATE users 
        SET password = ?, updated_at = ?
        WHERE LOWER(email) = ?
      `, [hashedPassword, now, cleanEmail]);

      // Clean up used OTP
      await executeSql('DELETE FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);

      return NextResponse.json({
        success: true,
        message: 'Master password successfully updated! You can now log in.',
      });
    }

    return NextResponse.json({ error: 'Invalid action requested' }, { status: 400 });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to process password reset request.' }, { status: 500 });
  }
}
