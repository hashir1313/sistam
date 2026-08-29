import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reward, rewardRedemption, player } from '@/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

export async function GET() {
  if (!db) {
    return NextResponse.json({ connected: false });
  }

  try {
    const rewards = await db.select().from(reward);

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
    const { action, playerId, rewardId, title, description, price, capped, capPeriod, userId } = await req.json();

    if (action === 'create_reward') {
      const [newReward] = await db
        .insert(reward)
        .values({
          userId: userId || 'default-user-id',
          title,
          description: description || '',
          price,
          capped: capped || 1,
          capPeriod: capPeriod || 'daily',
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
    return NextResponse.json({ connected: false, error: err.message }, { status: 200 });
  }
}
