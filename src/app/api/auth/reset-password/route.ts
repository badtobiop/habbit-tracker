import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, SUPER_ADMIN_EMAIL } from '@/lib/auth';
import { validateEmailAddress } from '@/lib/email-validator';

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
    }

    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    const cleanEmail = emailValidation.normalizedEmail;

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    // Check if account exists
    const user = db.prepare('SELECT id, name, email FROM users WHERE LOWER(email) = ?').get(cleanEmail) as { id: string; name: string; email: string } | undefined;

    if (!user) {
      return NextResponse.json({
        error: `No registered account found for ${cleanEmail}. Please use the Signup page to register.`,
      }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE users 
      SET password = ?, updated_at = ?
      WHERE id = ?
    `).run(hashedPassword, now, user.id);

    return NextResponse.json({
      success: true,
      message: `Password for ${user.name} (${user.email}) has been successfully updated! You can now log in.`,
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}
