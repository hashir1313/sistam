import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reward, rewardRedemption, player } from '@/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  if (!db) {
    return NextResponse.json({ connected: false });
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const targetUserId = session?.user?.id;

    // Fetch user rewards or seed default starter rewards for user
    let rewards = targetUserId
      ? await db.select().from(reward).where(eq(reward.userId, targetUserId))
      : await db.select().from(reward);

    if (rewards.length === 0 && targetUserId) {
      const defaultRewards = [
        {
          userId: targetUserId,
          title: '1 Hour Gaming Session',
          description: 'Play your favorite video games without guilt after completing quests.',
          price: 30,
          capped: 2,
          capPeriod: 'daily',
        },
        {
          userId: targetUserId,
          title: 'Cheat Meal / Movie Night',
          description: 'Order your favorite meal and watch a movie of your choice.',
          price: 75,
          capped: 1,
          capPeriod: 'daily',
        },
        {
          userId: targetUserId,
          title: 'Buy a New Book / Manga',
          description: 'Purchase a new physical book or comic volume to add to your collection.',
          price: 150,
          capped: 1,
          capPeriod: 'weekly',
        },
      ];

      rewards = await db.insert(reward).values(defaultRewards).returning();
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const redemptionsToday = await db
      .select({
        rewardId: rewardRedemption.rewardId,
        count: sql<number>`count(*)::int`,
      })
      .from(rewardRedemption)
      .where(gte(rewardRedemption.redeemedAt, startOfToday))
      .groupBy(rewardRedemption.rewardId);

    const redemptionMap = new Map(
      redemptionsToday.map((r) => [r.rewardId, r.count])
    );

    return NextResponse.json({
      connected: true,
      rewards: rewards.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        price: r.price,
        capped: r.capped,
        cap_period: r.capPeriod,
        timesRedeemedToday: redemptionMap.get(r.id) || 0,
      })),
    });
  } catch (err: any) {
    console.warn('Neon DB rewards fetch error, falling back:', err?.message || err);
    return NextResponse.json({ connected: false, message: 'Neon DB offline' }, { status: 200 });
  }
}

export async function POST(req: Request) {
  if (!db) {
    return NextResponse.json({ connected: false });
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const body = await req.json();
    const { action, playerId, rewardId, title, description, price, capped, capPeriod, cap_period, userId } = body;
    const activeUserId = session?.user?.id || userId;

    if (action === 'create_reward') {
      if (!activeUserId) {
        return NextResponse.json({ error: 'User session not found' }, { status: 401 });
      }

      const [newReward] = await db
        .insert(reward)
        .values({
          userId: activeUserId,
          title,
          description: description || '',
          price: Number(price),
          capped: Number(capped) || 1,
          capPeriod: capPeriod || cap_period || 'daily',
        })
        .returning();

      return NextResponse.json({ success: true, reward: newReward });
    }

    if (action === 'purchase_reward') {
      const [targetReward] = await db.select().from(reward).where(eq(reward.id, rewardId));
      const [targetPlayer] = await db.select().from(player).where(eq(player.id, playerId));

      if (!targetReward || !targetPlayer) {
        return NextResponse.json({ error: 'Reward or Player not found' }, { status: 404 });
      }

      if (targetPlayer.coins < targetReward.price) {
        return NextResponse.json({ error: 'Insufficient System Coins' }, { status: 400 });
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const redemptionsToday = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(rewardRedemption)
        .where(
          and(
            eq(rewardRedemption.rewardId, rewardId),
            gte(rewardRedemption.redeemedAt, startOfToday)
          )
        );

      if ((redemptionsToday[0]?.count || 0) >= targetReward.capped) {
        return NextResponse.json({ error: 'Reward redemption cap reached for today' }, { status: 400 });
      }

      await db
        .update(player)
        .set({ coins: sql`${player.coins} - ${targetReward.price}` })
        .where(eq(player.id, playerId));

      await db.insert(rewardRedemption).values({
        playerId,
        rewardId,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Failed reward operation:', err);
    return NextResponse.json({ connected: false, error: err.message }, { status: 500 });
  }
}
