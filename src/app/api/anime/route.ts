import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { HUNTER_RANKS, COMPANIONS_CATALOG, getHunterRank, calculateLevelFromXP } from '@/lib/xp-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentRank = getHunterRank(user.level);
    const levelInfo = calculateLevelFromXP(user.xp);

    const companionsWithStatus = COMPANIONS_CATALOG.map((comp) => ({
      ...comp,
      isUnlocked: user.level >= comp.requiredLevel,
      isSelected: user.companion === comp.id,
    }));

    const ranksWithStatus = HUNTER_RANKS.map((rank) => ({
      ...rank,
      isReached: user.level >= rank.minLevel,
      isCurrent: currentRank.rankLetter === rank.rankLetter,
    }));

    return NextResponse.json({
      success: true,
      currentRank,
      levelInfo,
      ranks: ranksWithStatus,
      companions: companionsWithStatus,
      userCompanion: user.companion,
      userAvatar: user.avatar,
    });
  } catch (error) {
    console.error('Error fetching anime system info:', error);
    return NextResponse.json({ error: 'Failed to fetch anime system info' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companionId, avatarId } = await req.json();

    if (companionId) {
      const comp = COMPANIONS_CATALOG.find((c) => c.id === companionId);
      if (!comp) {
        return NextResponse.json({ error: 'Invalid companion' }, { status: 400 });
      }
      if (user.level < comp.requiredLevel) {
        return NextResponse.json({ error: `Requires Hunter Level ${comp.requiredLevel}` }, { status: 403 });
      }
      db.prepare('UPDATE users SET companion = ? WHERE id = ?').run(companionId, user.id);
    }

    if (avatarId) {
      db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatarId, user.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Companion/Avatar updated successfully',
      companion: companionId || user.companion,
      avatar: avatarId || user.avatar,
    });
  } catch (error) {
    console.error('Error setting anime companion/avatar:', error);
    return NextResponse.json({ error: 'Failed to update companion/avatar' }, { status: 500 });
  }
}
