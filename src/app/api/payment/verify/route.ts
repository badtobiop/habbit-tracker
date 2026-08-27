import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { sendAdminAlert } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_method = 'UPI / PhonePe' } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Verify signature if secret is present
    if (keySecret && razorpay_signature && razorpay_order_id && razorpay_payment_id) {
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid payment signature verification' }, { status: 400 });
      }
    }

    const now = new Date().toISOString();
    const paymentRecordId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectivePaymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;

    // 1. Update user plan_status to paid_active in Database
    db.prepare(`
      UPDATE users 
      SET plan_status = 'paid_active', updated_at = ?
      WHERE id = ?
    `).run(now, user.id);

    // 2. Insert payment record into payments table
    db.prepare(`
      INSERT INTO payments (id, user_id, user_email, amount, currency, payment_id, order_id, status, payment_method, created_at)
      VALUES (?, ?, ?, ?, 'INR', ?, ?, 'SUCCESS', ?, ?)
    `).run(paymentRecordId, user.id, user.email, 49, effectivePaymentId, razorpay_order_id || null, payment_method, now);

    // 3. Dispatch real-time payment success alert to utkarshdhakane2@gmail.com
    try {
      await sendAdminAlert({
        eventType: 'PAYMENT_SUCCESS',
        userName: user.name,
        userEmail: user.email,
        amount: 49,
        isPaid: true,
        paymentId: effectivePaymentId,
        details: `Paid ₹49 via ${payment_method}. Plan upgraded to 'paid_active' Lifetime Pass.`,
      });
    } catch (err) {
      console.error('Payment alert error:', err);
    }


    return NextResponse.json({
      success: true,
      message: '₹49 Lifetime Shinobi Pass Activated Successfully!',
      plan_status: 'paid_active',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify and activate payment' }, { status: 500 });
  }
}
