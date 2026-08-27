import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll, executeSql } from '@/lib/turso';
import { getAuthUser, SUPER_ADMIN_EMAIL } from '@/lib/auth';
import { sendAdminAlert } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase() && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized: Master Admin clearance required' }, { status: 403 });
    }

    const promoCodes = await queryAll(`
      SELECT id, code, discount_type, max_uses, used_count, is_active, created_at
      FROM promo_codes
      ORDER BY created_at DESC
    `);

    const redemptions = await queryAll(`
      SELECT r.id, r.user_email, r.redeemed_at, p.code
      FROM promo_redemptions r
      JOIN promo_codes p ON r.promo_id = p.id
      ORDER BY r.redeemed_at DESC
      LIMIT 50
    `);

    return NextResponse.json({
      success: true,
      promoCodes,
      redemptions,
    });
  } catch (error) {
    console.error('Giveaway fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch giveaway data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase() && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized: Master Admin clearance required' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;
    const now = new Date().toISOString();

    // 1. Action: Direct Free Pass Grant via User Email
    if (action === 'grant_email') {
      const { targetEmail } = body;
      if (!targetEmail || !targetEmail.trim()) {
        return NextResponse.json({ error: 'Target Gmail / Email address is required' }, { status: 400 });
      }

      const cleanEmail = targetEmail.trim().toLowerCase();

      // Check if user exists
      const targetUser = await queryOne<{ id: string; name: string; email: string }>(
        'SELECT id, name, email FROM users WHERE LOWER(email) = ?',
        [cleanEmail]
      );

      if (!targetUser) {
        return NextResponse.json({
          error: `User with email "${cleanEmail}" is not registered yet. Ask them to register first, then gift them access!`,
        }, { status: 404 });
      }

      // Update plan_status to paid_active
      await executeSql("UPDATE users SET plan_status = 'paid_active', updated_at = ? WHERE id = ?", [now, targetUser.id]);

      // Record free pass gift transaction
      const paymentId = `gift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await executeSql(`
        INSERT INTO payments (id, user_id, user_email, amount, currency, payment_id, status, payment_method, created_at)
        VALUES (?, ?, ?, 0, 'INR', ?, 'SUCCESS', 'ADMIN_FREE_GIVEAWAY', ?)
      `, [paymentId, targetUser.id, targetUser.email, `gift_by_admin`, now]);

      try {
        await sendAdminAlert({
          eventType: 'PAYMENT_SUCCESS',
          userName: targetUser.name,
          userEmail: targetUser.email,
          amount: 0,
          paymentId: 'ADMIN_FREE_GIFT',
          details: `Gifted 100% Free ₹49 Lifetime Pass by Master Admin (utkarshdhakane2@gmail.com)`,
        });
      } catch (err) {
        console.error('Alert error:', err);
      }

      return NextResponse.json({
        success: true,
        message: `🎁 Free ₹49 Lifetime Pass successfully gifted to ${targetUser.name} (${cleanEmail})!`,
      });
    }

    // 2. Action: Generate Secret Giveaway Promo Code
    if (action === 'create_code') {
      const { customCode, maxUses = 1 } = body;
      const codeToUse = (customCode && customCode.trim())
        ? customCode.trim().toUpperCase()
        : `UCHIHA_GIFT_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Check if code already exists
      const existing = await queryOne('SELECT id FROM promo_codes WHERE code = ?', [codeToUse]);
      if (existing) {
        return NextResponse.json({ error: `Code "${codeToUse}" already exists. Please choose a different code.` }, { status: 400 });
      }

      const promoId = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await executeSql(`
        INSERT INTO promo_codes (id, code, discount_type, max_uses, used_count, is_active, created_by, created_at)
        VALUES (?, ?, '100_percent_free', ?, 0, 1, ?, ?)
      `, [promoId, codeToUse, Number(maxUses) || 1, user.email, now]);

      return NextResponse.json({
        success: true,
        message: `Promo Code "${codeToUse}" generated successfully!`,
        code: codeToUse,
      });
    }

    return NextResponse.json({ error: 'Invalid giveaway action' }, { status: 400 });
  } catch (error) {
    console.error('Giveaway action error:', error);
    return NextResponse.json({ error: 'Failed to process giveaway action' }, { status: 500 });
  }
}
