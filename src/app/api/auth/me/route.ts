import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { calculateLevelFromXP, getHunterRank } from '@/lib/anime-constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const levelDetails = calculateLevelFromXP(user.xp);
    const hunterRank = getHunterRank(user.level);

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        levelDetails,
        hunterRank,
      },
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, avatar, companion, bio } = await req.json();

    const updatedName = name?.trim() || user.name;
    const updatedAvatar = avatar || user.avatar;
    const updatedCompanion = companion || user.companion;
    const updatedBio = bio !== undefined ? bio : user.bio;
    const now = new Date().toISOString();

    const { db } = await import('@/lib/db');
    db.prepare(`
      UPDATE users 
      SET name = ?, avatar = ?, companion = ?, bio = ?, updated_at = ? 
      WHERE id = ?
    `).run(updatedName, updatedAvatar, updatedCompanion, updatedBio, now, user.id);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...user,
        name: updatedName,
        avatar: updatedAvatar,
        companion: updatedCompanion,
        bio: updatedBio,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
