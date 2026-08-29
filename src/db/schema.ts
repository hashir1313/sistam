import { pgTable, text, integer, doublePrecision, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const rankEnum = pgEnum('rank', ['E', 'D', 'C', 'B', 'A', 'S']);
export const capPeriodEnum = pgEnum('cap_period', ['daily', 'weekly', 'monthly', 'total']);

// --- Better Auth Managed Tables ---
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified').notNull().default(0),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  expiresAt: timestamp('expiresAt'),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
});

// --- Solo Leveling System Tables ---
export const player = pgTable('player', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  avatar: text('avatar').notNull().default('https://api.dicebear.com/7.x/bottts/svg?seed=SungJinWoo'),
  name: text('name').notNull().default('Shadow Monarch'),
  joined: timestamp('joined').notNull().defaultNow(),
  level: integer('level').notNull().default(1),
  totalXpEarned: doublePrecision('total_xp_earned').notNull().default(0),
  rank: rankEnum('rank').notNull().default('E'),
  coins: doublePrecision('coins').notNull().default(0),
  streak: integer('streak').notNull().default(1),
});

export const playerStat = pgTable('player_stat', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text('playerId').notNull().references(() => player.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  xpEarned: doublePrecision('xp_earned').notNull().default(0),
  level: integer('level').notNull().default(1),
});

export const reward = pgTable('reward', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').default(''),
  price: doublePrecision('price').notNull(),
  capped: integer('capped').notNull().default(1),
  capPeriod: capPeriodEnum('cap_period').notNull().default('daily'),
});

export const rewardRedemption = pgTable('reward_redemption', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text('playerId').notNull().references(() => player.id, { onDelete: 'cascade' }),
  rewardId: text('rewardId').notNull().references(() => reward.id, { onDelete: 'cascade' }),
  redeemedAt: timestamp('redeemed_at').notNull().defaultNow(),
});
