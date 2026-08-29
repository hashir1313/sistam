'use client';

import React, { useState, useEffect } from 'react';
import HUDHeader from '@/components/HUDHeader';
import PlayerCard from '@/components/PlayerCard';
import StatAllocator from '@/components/StatAllocator';
import RewardStore from '@/components/RewardStore';
import LevelUpModal from '@/components/LevelUpModal';
import { PlayerData, RewardItem } from '@/lib/types';
import { calculateCoinsFromXp, evaluateLevelUp, RankType } from '@/lib/formulas';
import { systemAudio } from '@/lib/sound';
import { BookOpen, RefreshCw, Database, HardDrive } from 'lucide-react';

const INITIAL_PLAYER: PlayerData = {
  id: 'player-1',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SungJinWoo',
  name: 'Sung Jin-Woo',
  joined: 'Aug 28, 2026',
  level: 30,
  total_xp_earned: 1750,
  rank: 'C',
  coins: 175,
  streak: 7,
  stats: [
    { id: 'stat-1', title: 'Strength', xp_earned: 600, level: 7 },
    { id: 'stat-2', title: 'Intelligence', xp_earned: 550, level: 6 },
    { id: 'stat-3', title: 'Discipline', xp_earned: 400, level: 5 },
    { id: 'stat-4', title: 'Vitality', xp_earned: 200, level: 3 },
  ],
};

const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'reward-1',
    title: '1 Hour Gaming Session',
    description: 'Play your favorite video games without guilt after completing notebook quests.',
    price: 30,
    capped: 2,
    cap_period: 'daily',
    timesRedeemedToday: 0,
  },
  {
    id: 'reward-2',
    title: 'Cheat Meal / Movie Night',
    description: 'Order your favorite meal and watch a movie of your choice.',
    price: 75,
    capped: 1,
    cap_period: 'daily',
    timesRedeemedToday: 0,
  },
  {
    id: 'reward-3',
    title: 'Buy a New Book / Manga',
    description: 'Purchase a new physical book or comic volume to add to your collection.',
    price: 150,
    capped: 1,
    cap_period: 'weekly',
    timesRedeemedToday: 0,
  },
];

const LOCAL_STORAGE_PLAYER_KEY = 'sololeveling_player_data';
const LOCAL_STORAGE_REWARDS_KEY = 'sololeveling_rewards_data';

export default function Home() {
  const [player, setPlayer] = useState<PlayerData>(INITIAL_PLAYER);
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [activeTab, setActiveTab] = useState<'card' | 'allocator' | 'store'>('card');
  const [isMounted, setIsMounted] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Level Up Modal State
  const [levelUpState, setLevelUpState] = useState<{
    isOpen: boolean;
    newLevel: number;
    newRank: RankType;
    levelsGained: number;
  }>({
    isOpen: false,
    newLevel: 1,
    newRank: 'E',
    levelsGained: 0,
  });

  // Load player & reward data (Neon DB or LocalStorage fallback)
  useEffect(() => {
    setIsMounted(true);

    async function loadData() {
      try {
        const playerRes = await fetch('/api/player');
        const playerData = await playerRes.json();

        if (playerData.connected && playerData.player) {
          setDbConnected(true);
          setPlayer(playerData.player);

          const rewardsRes = await fetch('/api/rewards');
          const rewardsData = await rewardsRes.json();
          if (rewardsData.rewards) {
            setRewards(rewardsData.rewards);
          }
          return;
        }
      } catch (e) {
        // DB not connected or error
      }

      setDbConnected(false);
      // Fallback to LocalStorage
      try {
        const savedPlayer = localStorage.getItem(LOCAL_STORAGE_PLAYER_KEY);
        const savedRewards = localStorage.getItem(LOCAL_STORAGE_REWARDS_KEY);

        if (savedPlayer) setPlayer(JSON.parse(savedPlayer));
        if (savedRewards) setRewards(JSON.parse(savedRewards));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    }

    loadData();
  }, []);

  // Sync LocalStorage backup on state changes
  useEffect(() => {
    if (!isMounted || dbConnected) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_PLAYER_KEY, JSON.stringify(player));
      localStorage.setItem(LOCAL_STORAGE_REWARDS_KEY, JSON.stringify(rewards));
    } catch (e) {}
  }, [player, rewards, isMounted, dbConnected]);

  // Handler: Add XP to Stat & Process Coins + Level Up
  const handleAddXp = async (statId: string, xpAmount: number) => {
    const coinsEarned = calculateCoinsFromXp(xpAmount);
    systemAudio.playXpSound();

    if (dbConnected) {
      try {
        const res = await fetch('/api/player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_xp',
            playerId: player.id,
            statId,
            xpAmount,
          }),
        });
        const data = await res.json();
        if (data.success) {
          if (data.levelUp) {
            setTimeout(() => systemAudio.playLevelUpSound(), 150);
            setLevelUpState({
              isOpen: true,
              newLevel: data.newLevel,
              newRank: data.newRank,
              levelsGained: 1,
            });
          }
          // Reload fresh data from Neon DB
          const freshRes = await fetch('/api/player');
          const freshData = await freshRes.json();
          if (freshData.player) setPlayer(freshData.player);
          return;
        }
      } catch (e) {
        console.warn('DB Post XP error, applying local state:', e);
      }
    }

    // Local state calculation fallback
    setPlayer((prevPlayer) => {
      const updatedStats = prevPlayer.stats.map((stat) => {
        if (stat.id === statId) {
          const newStatXp = stat.xp_earned + xpAmount;
          return {
            ...stat,
            xp_earned: newStatXp,
            level: Math.floor(Math.sqrt(newStatXp / 10)) + 1,
          };
        }
        return stat;
      });

      const newTotalXp = prevPlayer.total_xp_earned + xpAmount;
      const newCoins = Number((prevPlayer.coins + coinsEarned).toFixed(2));
      const levelResult = evaluateLevelUp(prevPlayer.level, newTotalXp);

      if (levelResult.levelsGained > 0) {
        setTimeout(() => systemAudio.playLevelUpSound(), 150);
        setLevelUpState({
          isOpen: true,
          newLevel: levelResult.newLevel,
          newRank: levelResult.newRank,
          levelsGained: levelResult.levelsGained,
        });
      }

      return {
        ...prevPlayer,
        total_xp_earned: newTotalXp,
        coins: newCoins,
        level: levelResult.newLevel,
        rank: levelResult.newRank,
        stats: updatedStats,
      };
    });
  };

  // Handler: Create New Stat
  const handleCreateStat = async (title: string) => {
    if (dbConnected) {
      try {
        await fetch('/api/player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_stat', playerId: player.id, title }),
        });
        const freshRes = await fetch('/api/player');
        const freshData = await freshRes.json();
        if (freshData.player) setPlayer(freshData.player);
        return;
      } catch (e) {}
    }

    const newStatItem = {
      id: `stat-${Date.now()}`,
      title,
      xp_earned: 0,
      level: 1,
    };
    setPlayer((prev) => ({
      ...prev,
      stats: [...prev.stats, newStatItem],
    }));
  };

  // Handler: Update Profile Name & Avatar
  const handleUpdateProfile = async (name: string, avatar: string) => {
    if (dbConnected) {
      try {
        await fetch('/api/player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_profile', playerId: player.id, name, avatar }),
        });
      } catch (e) {}
    }
    setPlayer((prev) => ({ ...prev, name, avatar }));
  };

  // Handler: Purchase Reward
  const handlePurchaseReward = async (rewardId: string) => {
    const targetReward = rewards.find((r) => r.id === rewardId);
    if (!targetReward) return;

    if (player.coins >= targetReward.price) {
      systemAudio.playCoinSound();

      if (dbConnected) {
        try {
          await fetch('/api/rewards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'purchase_reward', playerId: player.id, rewardId }),
          });
          const freshPlayer = await (await fetch('/api/player')).json();
          const freshRewards = await (await fetch('/api/rewards')).json();
          if (freshPlayer.player) setPlayer(freshPlayer.player);
          if (freshRewards.rewards) setRewards(freshRewards.rewards);
          return;
        } catch (e) {}
      }

      setPlayer((prev) => ({
        ...prev,
        coins: Number((prev.coins - targetReward.price).toFixed(2)),
      }));

      setRewards((prevRewards) =>
        prevRewards.map((r) =>
          r.id === rewardId
            ? { ...r, timesRedeemedToday: (r.timesRedeemedToday || 0) + 1 }
            : r
        )
      );
    }
  };

  // Handler: Create New Reward
  const handleCreateReward = async (newReward: Omit<RewardItem, 'id' | 'timesRedeemedToday'>) => {
    if (dbConnected) {
      try {
        await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_reward', ...newReward }),
        });
        const freshRewards = await (await fetch('/api/rewards')).json();
        if (freshRewards.rewards) setRewards(freshRewards.rewards);
        return;
      } catch (e) {}
    }

    const rewardItem: RewardItem = {
      ...newReward,
      id: `reward-${Date.now()}`,
      timesRedeemedToday: 0,
    };
    setRewards((prev) => [...prev, rewardItem]);
  };

  // Handler: Reset System Data to Default
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all System stats and rewards?')) {
      setPlayer(INITIAL_PLAYER);
      setRewards(INITIAL_REWARDS);
      localStorage.removeItem(LOCAL_STORAGE_PLAYER_KEY);
      localStorage.removeItem(LOCAL_STORAGE_REWARDS_KEY);
    }
  };

  return (
    <main className="min-h-screen bg-[#070A10] text-slate-100 pb-16">
      {/* Top HUD Banner */}
      <HUDHeader player={player} />

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Connection & Hybrid Banner */}
        <div className="system-card p-4 rounded-xl border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-300">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>
              <strong>HYBRID WORKFLOW:</strong> Tick daily quests in your physical notebook, then allocate XP below.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Database Connection Badge */}
            {dbConnected === true ? (
              <div className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/50 flex items-center gap-1 font-bold">
                <Database className="w-3 h-3 text-cyan-400" /> NEON DB CONNECTED
              </div>
            ) : (
              <div className="text-[10px] text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-500/50 flex items-center gap-1 font-bold" title="Set DATABASE_URL in .env.local to enable live Neon DB syncing">
                <HardDrive className="w-3 h-3 text-amber-400" /> LOCAL MODE (OFFLINE)
              </div>
            )}

            <button
              onClick={handleResetData}
              className="text-[10px] text-slate-500 hover:text-red-400 font-mono flex items-center gap-1"
              title="Reset System Data"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Mobile & Tablet) */}
        <div className="flex justify-center gap-2 border-b border-slate-800 pb-2 lg:hidden">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg transition-all ${
              activeTab === 'card'
                ? 'bg-cyan-500 text-slate-950 shadow-system-glow'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Player Card
          </button>
          <button
            onClick={() => setActiveTab('allocator')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg transition-all ${
              activeTab === 'allocator'
                ? 'bg-cyan-500 text-slate-950 shadow-system-glow'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            XP Allocator
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg transition-all ${
              activeTab === 'store'
                ? 'bg-amber-500 text-slate-950 shadow-gold-glow'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Reward Shop
          </button>
        </div>

        {/* Grid Container with CSS responsive visibility */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: Player Card */}
          <div
            className={`lg:col-span-6 ${
              activeTab === 'card' ? 'block' : 'hidden lg:block'
            }`}
          >
            <PlayerCard player={player} onUpdateProfile={handleUpdateProfile} />
          </div>

          {/* Column 2: XP Allocator & Reward Store */}
          <div
            className={`lg:col-span-6 space-y-6 ${
              activeTab !== 'card' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className={activeTab === 'store' ? 'hidden sm:block font-sans' : 'block font-sans'}>
              <StatAllocator
                player={player}
                onAddXp={handleAddXp}
                onCreateStat={handleCreateStat}
              />
            </div>

            <div className={activeTab === 'allocator' ? 'hidden sm:block font-sans' : 'block font-sans'}>
              <RewardStore
                player={player}
                rewards={rewards}
                onPurchaseReward={handlePurchaseReward}
                onCreateReward={handleCreateReward}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Level Up Announcement Modal */}
      <LevelUpModal
        isOpen={levelUpState.isOpen}
        newLevel={levelUpState.newLevel}
        newRank={levelUpState.newRank}
        levelsGained={levelUpState.levelsGained}
        onClose={() => setLevelUpState((prev) => ({ ...prev, isOpen: false }))}
      />
    </main>
  );
}
