import { NextResponse } from 'next/server';
import { db } from '@/db';
import { player, playerStat, user } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { evaluateLevelUp, calculateCoinsFromXp } from '@/lib/formulas';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  if (!db) {
    return NextResponse.json({ connected: false, message: 'Database URL not set' });
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const targetUserId = session?.user?.id;

    // 1. Fetch or create player record for the authenticated user
    let players = targetUserId
      ? await db.select().from(player).where(eq(player.userId, targetUserId)).limit(1)
      : await db.select().from(player).limit(1);
    
    if (players.length === 0 && targetUserId) {
      const [newPlayer] = await db
        .insert(player)
        .values({
          userId: targetUserId,
          name: session?.user?.name || 'Hunter',
          avatar: session?.user?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUserId}`,
          level: 1,
          totalXpEarned: 0,
          rank: 'E',
          coins: 0,
          streak: 1,
        })
        .returning();

      // Create default starter stats
      await db.insert(playerStat).values([
        { playerId: newPlayer.id, title: 'Strength', xpEarned: 0, level: 1 },
        { playerId: newPlayer.id, title: 'Intelligence', xpEarned: 0, level: 1 },
        { playerId: newPlayer.id, title: 'Discipline', xpEarned: 0, level: 1 },
        { playerId: newPlayer.id, title: 'Vitality', xpEarned: 0, level: 1 },
      ]);

      players = [newPlayer];
    } else if (players.length === 0) {
      return NextResponse.json({ connected: true, player: null });
    }

    const currentPlayer = players[0];
    const stats = await db
      .select()
      .from(playerStat)
      .where(eq(playerStat.playerId, currentPlayer.id));

    return NextResponse.json({
      connected: true,
      player: {
        id: currentPlayer.id,
        avatar: currentPlayer.avatar,
        name: currentPlayer.name,
        joined: new Date(currentPlayer.joined).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        level: currentPlayer.level,
        total_xp_earned: currentPlayer.totalXpEarned,
        rank: currentPlayer.rank,
        coins: currentPlayer.coins,
        streak: currentPlayer.streak,
        stats: stats.map((s) => ({
          id: s.id,
          title: s.title,
          xp_earned: s.xpEarned,
          level: s.level,
        })),
      },
    });
  } catch (err: any) {
    console.warn('Neon DB connection offline or unreachable:', err?.message || err);
    return NextResponse.json({ connected: false, message: 'Neon DB offline' }, { status: 200 });
  }
}

export async function POST(req: Request) {
  if (!db) {
    return NextResponse.json({ connected: false, message: 'Database URL not set' });
  }

  try {
    const { action, playerId, statId, xpAmount, title, name, avatar } = await req.json();

    if (action === 'update_profile') {
      await db
        .update(player)
        .set({ name, avatar })
        .where(eq(player.id, playerId));
      return NextResponse.json({ success: true });
    }

    if (action === 'create_stat') {
      const [newStat] = await db
        .insert(playerStat)
        .values({
          playerId,
          title,
          xpEarned: 0,
          level: 1,
        })
        .returning();
      return NextResponse.json({ success: true, stat: newStat });
    }

    if (action === 'add_xp') {
      const coinsEarned = calculateCoinsFromXp(xpAmount);

      const [targetPlayer] = await db
        .select()
        .from(player)
        .where(eq(player.id, playerId));

      if (!targetPlayer) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 });
      }

      await db
        .update(playerStat)
        .set({
          xpEarned: sql`${playerStat.xpEarned} + ${xpAmount}`,
        })
        .where(eq(playerStat.id, statId));

      const newTotalXp = targetPlayer.totalXpEarned + xpAmount;
      const newCoins = Number((targetPlayer.coins + coinsEarned).toFixed(2));
      const levelResult = evaluateLevelUp(targetPlayer.level, newTotalXp);

      await db
        .update(player)
        .set({
          totalXpEarned: newTotalXp,
          coins: newCoins,
          level: levelResult.newLevel,
          rank: levelResult.newRank,
        })
        .where(eq(player.id, playerId));

      return NextResponse.json({
        success: true,
        levelUp: levelResult.levelsGained > 0,
        newLevel: levelResult.newLevel,
        newRank: levelResult.newRank,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message }, { status: 200 });
  }
}
