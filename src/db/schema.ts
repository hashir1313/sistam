import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

// Better Auth Schemas
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  issuer: text('issuer'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// App Schemas
export const player = pgTable('player', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  avatar: text('avatar').notNull().default('https://api.dicebear.com/7.x/bottts/svg?seed=SungJinWoo'),
  name: text('name').notNull().default('Sung Jin-Woo'),
  joined: timestamp('joined').notNull().defaultNow(),
  level: integer('level').notNull().default(1),
  totalXpEarned: integer('total_xp_earned').notNull().default(0),
  rank: text('rank').notNull().default('E'), // E, D, C, B, A, S
  coins: integer('coins').notNull().default(0),
  streak: integer('streak').notNull().default(1),
});

export const playerStat = pgTable('player_stat', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text('playerId').notNull().references(() => player.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // e.g., 'Strength', 'Intelligence'
  xpEarned: integer('xp_earned').notNull().default(0),
  level: integer('level').notNull().default(1),
});

export const reward = pgTable('reward', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // In System coins
  capped: integer('capped').notNull().default(1), // Usage cap (e.g. 2 times)
  capPeriod: text('cap_period').notNull().default('daily'), // daily, weekly
});

export const rewardRedemption = pgTable('reward_redemption', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text('playerId').notNull().references(() => player.id, { onDelete: 'cascade' }),
  rewardId: text('rewardId').notNull().references(() => reward.id, { onDelete: 'cascade' }),
  redeemedAt: timestamp('redeemed_at').notNull().defaultNow(),
});
