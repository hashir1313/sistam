'use client';

import React, { useState } from 'react';
import { PlayerData, StatItem } from '@/lib/types';
import { calculateCoinsFromXp } from '@/lib/formulas';
import { PlusCircle, Zap, Coins, Plus, Check } from 'lucide-react';

interface StatAllocatorProps {
  player: PlayerData;
  onAddXp: (statId: string, xpAmount: number) => void;
  onCreateStat: (title: string) => void;
}

export default function StatAllocator({ player, onAddXp, onCreateStat }: StatAllocatorProps) {
  const [selectedStatId, setSelectedStatId] = useState<string>(player.stats[0]?.id || '');
  const [xpInput, setXpInput] = useState<string>('');
  const [newStatTitle, setNewStatTitle] = useState<string>('');
  const [showAddStat, setShowAddStat] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const xpNum = parseFloat(xpInput) || 0;
  const estimatedCoins = calculateCoinsFromXp(xpNum);

  const handleSubmitXp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatId || xpNum <= 0) return;

    onAddXp(selectedStatId, xpNum);
    const targetStat = player.stats.find((s) => s.id === selectedStatId);

    setSuccessMsg(`+${xpNum} XP added to ${targetStat?.title || 'Stat'}! (+${estimatedCoins} System Coins)`);
    setXpInput('');

    setTimeout(() => {
      setSuccessMsg(null);
    }, 3500);
  };

  const handleCreateNewStat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatTitle.trim()) return;

    onCreateStat(newStatTitle.trim());
    setNewStatTitle('');
    setShowAddStat(false);
  };

  return (
    <div className="w-full system-card rounded-xl p-5 border border-cyan-500/30 text-slate-100 shadow-system-glow">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
          MANUAL XP ALLOCATION (FROM NOTEBOOK)
        </h3>

        <button
          onClick={() => setShowAddStat(!showAddStat)}
          className="text-xs font-mono bg-slate-900 border border-cyan-500/40 text-cyan-400 px-2.5 py-1 rounded hover:bg-cyan-500/20 transition-all flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          New Stat
        </button>
      </div>

      {/* Add New Stat Modal / Form */}
      {showAddStat && (
        <form onSubmit={handleCreateNewStat} className="mb-4 bg-slate-950/80 p-3 rounded border border-cyan-500/40">
          <label className="text-xs font-mono text-slate-300 block mb-1.5">Stat Name (e.g. Strength, Coding, Discipline)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newStatTitle}
              onChange={(e) => setNewStatTitle(e.target.value)}
              placeholder="Enter stat title..."
              className="flex-1 bg-slate-900 border border-slate-700 text-sm px-3 py-1.5 rounded text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs uppercase"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="mb-4 p-3 bg-cyan-950/60 border border-cyan-500/60 rounded text-cyan-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-cyan-400" />
          {successMsg}
        </div>
      )}

      {/* Allocation Form */}
      <form onSubmit={handleSubmitXp} className="space-y-4">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">Select Target Stat</label>
          <select
            value={selectedStatId}
            onChange={(e) => setSelectedStatId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-sm rounded-lg p-2.5 text-slate-200 font-medium focus:outline-none focus:border-cyan-400"
          >
            {player.stats.map((stat) => (
              <option key={stat.id} value={stat.id}>
                {stat.title} (Current: LV.{stat.level} - {stat.xp_earned} XP)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">
            XP Earned from Physical Quest
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              value={xpInput}
              onChange={(e) => setXpInput(e.target.value)}
              placeholder="e.g. 150"
              className="w-full bg-slate-950 border border-slate-800 text-sm rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <span className="absolute right-3 top-2.5 text-xs text-cyan-400 font-mono font-bold">XP</span>
          </div>
        </div>

        {/* Real-time Coins Preview */}
        {xpNum > 0 && (
          <div className="bg-slate-950/60 p-2.5 rounded border border-amber-500/30 flex items-center justify-between text-xs font-mono text-amber-400">
            <span className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              System Coins Generated (XP / 10):
            </span>
            <span className="font-bold text-sm">+{estimatedCoins} Coins</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedStatId || xpNum <= 0}
          className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase text-xs tracking-wider rounded-lg shadow-system-glow transition-all active:scale-[0.99] disabled:opacity-40"
        >
          Inject XP & Earn Coins
        </button>
      </form>
    </div>
  );
}
