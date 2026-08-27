import nodemailer from 'nodemailer';
import { db } from './db';
import { SUPER_ADMIN_EMAIL } from './auth';

export interface AlertPayload {
  eventType: 'NEW_USER_SIGNUP' | 'USER_LOGIN' | 'PAYMENT_SUCCESS' | 'PASSWORD_RESET';
  userName: string;
  userEmail: string;
  details?: string;
  amount?: number;
  paymentId?: string;
  isPaid?: boolean;
}

export async function sendAdminAlert({ eventType, userName, userEmail, details, amount, paymentId, isPaid }: AlertPayload): Promise<void> {
  const now = new Date().toISOString();
  const alertId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Default payment status if not explicitly passed
  let paymentStatusText = isPaid ? 'PAID & UNLOCKED' : 'UNPAID (Payment Pending)';
  if (eventType === 'PAYMENT_SUCCESS') paymentStatusText = 'PAID (₹49 Received)';

  try {
    // 1. Record in admin_alerts database audit table
    db.prepare(`
      INSERT INTO admin_alerts (id, event_type, user_name, user_email, created_at, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(alertId, eventType, userName || 'Anonymous', userEmail, now, details || paymentStatusText);
  } catch (dbErr) {
    console.error('Failed to log admin alert in DB:', dbErr);
  }

  // 2. Dispatch Email Alert if SMTP is configured in environment
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 7000,
        greetingTimeout: 7000,
        socketTimeout: 7000,
      });


      const isMasterAdminUser = userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

      let subject = `⚡ Shinobi Alert: ${eventType}`;
      let headerTitle = 'Uchiha Habit Tracker • Activity Alert';
      let statusColor = '#ef4444';
      let statusBadge = '⚠️ SIGNED IN (Payment Pending)';

      if (eventType === 'PAYMENT_SUCCESS') {
        subject = `💰 [PAYMENT SUCCESS] ₹${amount || 49} RECEIVED from ${userName} (${userEmail}) - Lifetime Pass Unlocked!`;
        headerTitle = '💰 Payment Received • ₹49 Lifetime Pass Active';
        statusColor = '#10b981';
        statusBadge = '✅ PAYMENT COMPLETED (₹49 Received via UPI/PhonePe)';
      } else if (eventType === 'NEW_USER_SIGNUP') {
        subject = `🔥 [NEW SIGNUP] Shinobi Registered: ${userName} (${userEmail})${isMasterAdminUser ? ' [Master Admin]' : ''}`;
        headerTitle = '🔥 New User Registered';
        statusColor = '#f59e0b';
        statusBadge = isMasterAdminUser ? '👑 MASTER SUPERADMIN ACCOUNT' : '⚠️ REGISTERED (₹49 Pass Pending)';
      } else if (eventType === 'USER_LOGIN') {
        subject = isMasterAdminUser
          ? `👑 [MASTER ADMIN LOGIN] Utkarsh logged into Shinobi Portal`
          : isPaid
          ? `⚡ [PAID USER] Shinobi Logged In: ${userName} (${userEmail})`
          : `⚠️ [UNPAID USER] Shinobi Logged In: ${userName} (${userEmail})`;
        headerTitle = isMasterAdminUser ? '👑 Master Admin Logged In' : '⚡ User Logged In';
        statusColor = isMasterAdminUser ? '#9333ea' : isPaid ? '#10b981' : '#f59e0b';
        statusBadge = isMasterAdminUser ? '👑 MASTER ADMIN (Full Access)' : isPaid ? '✅ ACTIVE PAID SHINOBI' : '⚠️ UNPAID VISITOR';
      } else if (eventType === 'PASSWORD_RESET') {
        subject = `🔐 [PASSWORD RESET] Security Alert for ${userName} (${userEmail})`;
        headerTitle = '🔐 Password Reset Activity';
        statusColor = '#38bdf8';
        statusBadge = '🔑 PASSWORD RESET INITIATED';
      }


      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #050508; color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid ${statusColor}; max-width: 600px; margin: auto;">
          <h2 style="color: ${statusColor}; margin-top: 0; font-size: 20px;">
            ${headerTitle}
          </h2>
          
          <div style="background-color: #18181b; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: bold; color: ${statusColor}; margin-bottom: 16px; border-left: 4px solid ${statusColor};">
            ${statusBadge}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #27272a;">
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: bold;">User Name:</td>
              <td style="padding: 10px 0; color: #ffffff; font-weight: bold;">${userName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #27272a;">
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: bold;">User Email:</td>
              <td style="padding: 10px 0; color: #ef4444; font-weight: bold;">${userEmail}</td>
            </tr>
            <tr style="border-bottom: 1px solid #27272a;">
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: bold;">Payment Status:</td>
              <td style="padding: 10px 0; color: ${statusColor}; font-weight: bold;">
                ${eventType === 'PAYMENT_SUCCESS' || isPaid ? '✅ ₹49 Lifetime Pass Active' : '❌ Unpaid (₹49 Payment Pending)'}
              </td>
            </tr>
            ${amount ? `
            <tr style="border-bottom: 1px solid #27272a;">
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: bold;">Amount Paid:</td>
              <td style="padding: 10px 0; color: #10b981; font-weight: bold; font-size: 16px;">₹${amount} INR (Direct to Bank via UPI)</td>
            </tr>` : ''}
            ${paymentId ? `
            <tr style="border-bottom: 1px solid #27272a;">
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: bold;">Razorpay Payment ID:</td>
              <td style="padding: 10px 0; color: #38bdf8; font-mono;">${paymentId}</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px solid #27272a;">
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: bold;">Timestamp:</td>
              <td style="padding: 10px 0; color: #ffffff;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
            </tr>
            ${details ? `
            <tr>
              <td style="padding: 10px 0; color: #a1a1aa; font-weight: bold;">Notes:</td>
              <td style="padding: 10px 0; color: #cbd5e1;">${details}</td>
            </tr>` : ''}
          </table>

          <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #27272a; font-size: 11px; color: #71717a; text-align: center;">
            Official Security & Revenue Dispatch for SuperAdmin: ${SUPER_ADMIN_EMAIL}
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Uchiha Habit Alert" <${smtpUser}>`,
        to: SUPER_ADMIN_EMAIL,
        subject,
        html: htmlContent,
      });

      console.log(`[ALERT] Successfully sent email alert for ${userEmail} to ${SUPER_ADMIN_EMAIL}`);
    } catch (mailErr) {
      console.error('[ALERT] Failed to send email alert:', mailErr);
    }
  } else {
    console.log(`[ALERT RECORDED] Event: ${eventType} | Status: ${paymentStatusText} | User: ${userName} (${userEmail}) | Target Admin: ${SUPER_ADMIN_EMAIL}`);
  }
}

export async function sendPasswordResetOTPEmail(email: string, userName: string, otp: string): Promise<boolean> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn(`[OTP DISPATCH] SMTP credentials not set in env. OTP for ${email} is: ${otp}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #f8fafc; padding: 28px; border-radius: 16px; border: 2px solid #ef4444; max-width: 550px; margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #ef4444; margin: 0; font-size: 24px; letter-spacing: 1px;">UCHIHA HABIT</h1>
          <p style="color: #a1a1aa; font-size: 12px; margin: 4px 0 0 0;">Password Reset Verification Protocol</p>
        </div>
        
        <p style="font-size: 15px; color: #e2e8f0;">Greetings <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">
          A password reset request was initiated for your shinobi account. Use the following One-Time Password (OTP) code to verify your identity and set a new password:
        </p>

        <div style="background-color: #18181b; border: 1px dashed #ef4444; padding: 18px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ef4444; font-family: monospace;">${otp}</span>
          <p style="color: #71717a; font-size: 11px; margin: 8px 0 0 0;">This OTP will expire in 10 minutes.</p>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.4;">
          If you did not request this password reset, please ignore this email. Your account remains completely secure.
        </p>

        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #27272a; font-size: 11px; color: #52525b; text-align: center;">
          Uchiha Habit Tracker • Security Shield System
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Uchiha Habit Security" <${smtpUser}>`,
      to: email,
      subject: `🔐 Your Password Reset OTP Code: ${otp}`,
      html: htmlContent,
    });

    console.log(`[OTP SENT] Sent OTP to ${email}`);
    return true;
  } catch (mailErr) {
    console.error('[OTP SEND ERROR]', mailErr);
    return false;
  }
}

