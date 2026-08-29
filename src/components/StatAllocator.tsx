'use client';

import React, { useState } from 'react';
import { PlayerData } from '@/lib/types';
import { calculateCoinsFromXp } from '@/lib/formulas';
import { AlertCircle, CheckSquare, Coins, Plus, Check, Zap, AlertTriangle } from 'lucide-react';

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

    setSuccessMsg(`[QUEST COMPLETED]: +${xpNum} XP added to ${targetStat?.title || 'Stat'}! (+${estimatedCoins} System Coins)`);
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
    <div className="w-full system-status-box rounded-xl p-6 border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.2)] text-slate-100 font-mono relative overflow-hidden">
      {/* Background Circuit Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Top Header Box - QUEST INFO */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-cyan-400 bg-cyan-950/80 flex items-center justify-center text-cyan-300 font-bold shadow-system-glow">
            !
          </div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300 neon-text-glow">
            QUEST INFO
          </h3>
        </div>

        <button
          onClick={() => setShowAddStat(!showAddStat)}
          className="text-xs font-mono bg-cyan-950/80 border border-cyan-400/60 hover:bg-cyan-900/80 text-cyan-300 px-3 py-1 rounded transition-all flex items-center gap-1 font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Custom Stat
        </button>
      </div>

      {/* Daily Quest Announcement Header */}
      <div className="text-center mb-5 relative z-10">
        <p className="text-xs text-cyan-300 font-semibold tracking-wider bg-cyan-950/40 py-1.5 px-4 rounded border border-cyan-500/20 inline-block">
          [Daily Quest: Physical & Notebook Growth Mission Has Arrived.]
        </p>
      </div>

      {/* Add New Stat Form Drawer */}
      {showAddStat && (
        <form onSubmit={handleCreateNewStat} className="mb-5 bg-slate-950/95 p-3.5 rounded-lg border border-cyan-400/50 relative z-20 space-y-2">
          <label className="text-xs font-mono text-cyan-400 font-bold uppercase block">New Attribute Stat Title</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newStatTitle}
              onChange={(e) => setNewStatTitle(e.target.value)}
              placeholder="e.g. Strength, Discipline, Coding..."
              className="flex-1 bg-slate-900 border border-slate-700 text-xs px-3 py-2 rounded text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded text-xs uppercase"
            >
              Add Stat
            </button>
          </div>
        </form>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="mb-5 p-3 bg-cyan-950/90 border border-cyan-400 rounded text-cyan-300 text-xs font-mono flex items-center gap-2 animate-fadeIn relative z-10 shadow-system-glow">
          <Check className="w-4 h-4 text-cyan-400 font-bold" />
          {successMsg}
        </div>
      )}

      {/* Quest Goal Checklist Preview */}
      <div className="bg-slate-950/60 p-4 rounded-lg border border-cyan-500/30 mb-5 relative z-10 space-y-3">
        <div className="text-center font-bold text-sm text-cyan-300 tracking-widest uppercase border-b border-cyan-500/20 pb-2">
          GOAL
        </div>
        <div className="space-y-2.5 text-xs text-slate-200">
          <div className="flex items-center justify-between">
            <span>Physical / Notebook Quests:</span>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold font-mono">[20/20]</span>
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>XP Allocation Status:</span>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold font-mono">[{xpNum > 0 ? '1/1' : '0/1'}]</span>
              <CheckSquare className={`w-4 h-4 ${xpNum > 0 ? 'text-emerald-400' : 'text-slate-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Form */}
      <form onSubmit={handleSubmitXp} className="space-y-4 relative z-10">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1.5 uppercase font-bold">Select Target Stat</label>
          <select
            value={selectedStatId}
            onChange={(e) => setSelectedStatId(e.target.value)}
            className="w-full bg-slate-950 border border-cyan-500/40 text-sm rounded-lg p-3 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
          >
            {player.stats.map((stat) => (
              <option key={stat.id} value={stat.id}>
                {stat.title} — Current LV.{stat.level} ({stat.xp_earned} XP)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1.5 uppercase font-bold">
            XP Earned from Completed Quests
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              value={xpInput}
              onChange={(e) => setXpInput(e.target.value)}
              placeholder="e.g. 150"
              className="w-full bg-slate-950 border border-cyan-500/40 text-sm rounded-lg p-3 text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
            />
            <span className="absolute right-4 top-3 text-xs text-cyan-400 font-mono font-bold">XP</span>
          </div>
        </div>

        {/* Real-time Coins Preview */}
        {xpNum > 0 && (
          <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-500/40 flex items-center justify-between text-xs font-mono text-amber-300">
            <span className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              System Coins Generated:
            </span>
            <span className="font-bold text-sm text-amber-400">+{estimatedCoins} Coins</span>
          </div>
        )}

        {/* Penalty Warning Callout Box matching Image 2 */}
        <div className="bg-red-950/30 p-3.5 rounded-lg border border-red-500/40 text-center text-xs space-y-1">
          <div className="text-red-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            WARNING
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Failure to complete the daily quest will result in an appropriate <span className="text-red-500 font-bold">penalty</span>.
          </p>
        </div>

        {/* Interactive Holographic Checkmark Submission Button */}
        <button
          type="submit"
          disabled={!selectedStatId || xpNum <= 0}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black uppercase text-xs tracking-widest rounded-lg shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 font-bold" />
          COMPLETE QUEST & CLAIM XP
        </button>
      </form>
    </div>
  );
}
