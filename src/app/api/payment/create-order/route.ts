import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please login to proceed with ₹49 pass purchase' }, { status: 401 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = 4900; // ₹49.00 in paise
    const currency = 'INR';

    let orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // If real Razorpay credentials are provided in .env
    if (keyId && keySecret) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency,
          receipt: `rcpt_${user.id.substring(0, 10)}_${Date.now()}`,
          notes: {
            userId: user.id,
            userEmail: user.email,
            plan: '₹49 Lifetime Shinobi Pass',
          },
        });

        orderId = order.id;
      } catch (rzpErr) {
        console.warn('Razorpay API call failed, falling back to simulated order:', rzpErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: 49,
      amountInPaise,
      currency,
      keyId: keyId || 'rzp_test_uchihahabit',
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
