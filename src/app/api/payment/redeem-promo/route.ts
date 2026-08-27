import { NextRequest, NextResponse } from 'next/server';
import { queryOne, executeSql } from '@/lib/turso';
import { getAuthUser } from '@/lib/auth';
import { sendAdminAlert } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please login to redeem giveaway code' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Please enter a giveaway code' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const now = new Date().toISOString();

    // 1. Look up promo code
    const promo = await queryOne<{ id: string; code: string; discount_type: string; max_uses: number; used_count: number; is_active: number }>(`
      SELECT id, code, discount_type, max_uses, used_count, is_active 
      FROM promo_codes 
      WHERE code = ?
    `, [cleanCode]);

    if (!promo || promo.is_active === 0) {
      return NextResponse.json({ error: 'Invalid or expired giveaway code' }, { status: 400 });
    }

    if (promo.used_count >= promo.max_uses) {
      return NextResponse.json({ error: 'This giveaway code has reached its maximum usage limit' }, { status: 400 });
    }

    // 2. Check if user already redeemed this code
    const alreadyRedeemed = await queryOne('SELECT id FROM promo_redemptions WHERE promo_id = ? AND user_id = ?', [promo.id, user.id]);
    if (alreadyRedeemed) {
      return NextResponse.json({ error: 'You have already redeemed this giveaway code' }, { status: 400 });
    }

    // 3. Increment used_count and record redemption
    await executeSql('UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?', [promo.id]);

    const redemptionId = `red_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await executeSql(`
      INSERT INTO promo_redemptions (id, promo_id, user_id, user_email, redeemed_at)
      VALUES (?, ?, ?, ?, ?)
    `, [redemptionId, promo.id, user.id, user.email, now]);

    // 4. Update user plan_status to paid_active
    await executeSql("UPDATE users SET plan_status = 'paid_active', updated_at = ? WHERE id = ?", [now, user.id]);

    // 5. Record payment record with 0 amount
    const paymentId = `gift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await executeSql(`
      INSERT INTO payments (id, user_id, user_email, amount, currency, payment_id, status, payment_method, created_at)
      VALUES (?, ?, ?, 0, 'INR', ?, 'SUCCESS', ?, ?)
    `, [paymentId, user.id, user.email, `code_${cleanCode}`, `GIVEAWAY_CODE (${cleanCode})`, now]);

    // 6. Alert admin
    try {
      await sendAdminAlert({
        eventType: 'PAYMENT_SUCCESS',
        userName: user.name,
        userEmail: user.email,
        amount: 0,
        paymentId: `PROMO_${cleanCode}`,
        details: `Redeemed 100% Free ₹49 Lifetime Pass using Giveaway Code: ${cleanCode}`,
      });
    } catch (err) {
      console.error('Alert error:', err);
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Success! Giveaway Code "${cleanCode}" applied. ₹49 Lifetime Pass activated for free!`,
      plan_status: 'paid_active',
    });
  } catch (error) {
    console.error('Redeem promo error:', error);
    return NextResponse.json({ error: 'Failed to redeem giveaway code' }, { status: 500 });
  }
}
