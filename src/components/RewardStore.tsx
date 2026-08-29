'use client';

import React, { useState } from 'react';
import { PlayerData, RewardItem } from '@/lib/types';
import { ShoppingBag, Coins, Lock, CheckCircle2, Plus, AlertTriangle, Sparkles } from 'lucide-react';

interface RewardStoreProps {
  player: PlayerData;
  rewards: RewardItem[];
  onPurchaseReward: (rewardId: string) => void;
  onCreateReward: (reward: Omit<RewardItem, 'id' | 'timesRedeemedToday'>) => void;
}

export default function RewardStore({
  player,
  rewards,
  onPurchaseReward,
  onCreateReward,
}: RewardStoreProps) {
  const [showAddReward, setShowAddReward] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [capped, setCapped] = useState('1');
  const [capPeriod, setCapPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'total'>('daily');
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const handleBuy = (reward: RewardItem) => {
    if (player.coins < reward.price) return;
    if ((reward.timesRedeemedToday || 0) >= reward.capped) return;

    onPurchaseReward(reward.id);
    setPurchaseMsg(`[ITEM UNLOCKED]: Purchased "${reward.title}" for ${reward.price} Coins!`);

    setTimeout(() => {
      setPurchaseMsg(null);
    }, 3500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    const capNum = parseInt(capped, 10);
    if (!title.trim() || isNaN(priceNum) || priceNum <= 0 || isNaN(capNum) || capNum < 1) return;

    onCreateReward({
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      capped: capNum,
      cap_period: capPeriod,
    });

    setTitle('');
    setDescription('');
    setPrice('');
    setCapped('1');
    setShowAddReward(false);
  };

  return (
    <div className="w-full system-card-gold rounded-xl p-6 border-2 border-amber-500/50 text-slate-100 font-mono shadow-[0_0_25px_rgba(245,158,11,0.2)] relative overflow-hidden">
      {/* Shop Header */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-amber-400 bg-amber-950/80 flex items-center justify-center text-amber-400 font-bold shadow-gold-glow">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400 gold-text-glow">
            SYSTEM STORE / SHOP
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono bg-amber-950/90 border border-amber-500/50 text-amber-300 px-3 py-1.5 rounded flex items-center gap-1.5 font-bold shadow-gold-glow">
            <Coins className="w-4 h-4 text-amber-400" />
            {player.coins.toLocaleString()} Coins
          </div>
          <button
            onClick={() => setShowAddReward(!showAddReward)}
            className="text-xs font-mono bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-slate-200 px-3 py-1.5 rounded flex items-center gap-1 font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            New Reward
          </button>
        </div>
      </div>

      {/* Add New Reward Form */}
      {showAddReward && (
        <form onSubmit={handleCreate} className="mb-5 bg-slate-950/95 p-4 rounded-lg border border-amber-500/50 space-y-3 relative z-20">
          <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Create System Item Reward</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Item Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 1 Hour Gaming Session"
                className="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Price (Coins)</label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 50"
                className="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Enjoy uninterrupted gaming after finishing quests"
              className="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-amber-400 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Usage Cap (Max Uses)</label>
              <input
                type="number"
                min="1"
                value={capped}
                onChange={(e) => setCapped(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Cap Period</label>
              <select
                value={capPeriod}
                onChange={(e) => setCapPeriod(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-amber-400"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="total">Lifetime</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase text-xs rounded shadow-gold-glow"
          >
            Save Custom Item Reward
          </button>
        </form>
      )}

      {/* Notification Toast */}
      {purchaseMsg && (
        <div className="mb-5 p-3.5 bg-amber-950/90 border border-amber-400 rounded text-amber-300 text-xs font-mono flex items-center gap-2 animate-fadeIn shadow-gold-glow">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          {purchaseMsg}
        </div>
      )}

      {/* Rewards Catalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rewards.map((reward) => {
          const isAffordable = player.coins >= reward.price;
          const timesUsed = reward.timesRedeemedToday || 0;
          const isCappedOut = timesUsed >= reward.capped;
          const canBuy = isAffordable && !isCappedOut;

          return (
            <div
              key={reward.id}
              className={`bg-slate-950/80 p-4 rounded-lg border transition-all flex flex-col justify-between ${
                canBuy
                  ? 'border-amber-500/50 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'border-slate-800 opacity-75'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="text-sm font-bold text-slate-100 font-sans">{reward.title}</h4>
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {reward.price}
                  </span>
                </div>
                {reward.description && (
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed font-sans">{reward.description}</p>
                )}
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2 mb-3">
                  <span>
                    Limit: {timesUsed}/{reward.capped} ({reward.cap_period})
                  </span>
                  {isCappedOut && (
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Cap Reached
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleBuy(reward)}
                disabled={!canBuy}
                className={`w-full py-2.5 rounded text-xs font-bold font-mono uppercase flex items-center justify-center gap-1.5 transition-all ${
                  canBuy
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-gold-glow active:scale-[0.98]'
                    : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {!isAffordable ? (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Insufficient Coins
                  </>
                ) : isCappedOut ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> Cap Reached
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" /> Redeem Reward
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
