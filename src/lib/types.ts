import { RankType } from './formulas';

export interface StatItem {
  id: string;
  title: string;
  xp_earned: number;
  level: number;
}

export interface PlayerData {
  id: string;
  avatar: string;
  name: string;
  joined: string;
  level: number;
  total_xp_earned: number;
  rank: RankType;
  coins: number;
  streak: number;
  stats: StatItem[];
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  price: number;
  capped: number;
  cap_period: 'daily' | 'weekly' | 'monthly' | 'total';
  timesRedeemedToday?: number;
}

export interface RedemptionRecord {
  id: string;
  reward_id: string;
  redeemed_at: string;
}
