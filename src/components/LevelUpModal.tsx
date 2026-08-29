'use client';

import React from 'react';
import { RankType } from '@/lib/formulas';
import { Sparkles, Trophy, Shield, ArrowUpRight, X } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  newRank: RankType;
  levelsGained: number;
  onClose: () => void;
}

export default function LevelUpModal({
  isOpen,
  newLevel,
  newRank,
  levelsGained,
  onClose,
}: LevelUpModalProps) {
  if (!isOpen) return null;

  const rankClass = `rank-badge-${newRank}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* Glow Effects */}
      <div className="absolute w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-400 p-6 rounded-2xl shadow-system-glow clip-corner text-slate-100 text-center">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-500/50 rounded-full text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          SYSTEM ANNOUNCEMENT
        </div>

        {/* Main Level Up Header */}
        <h2 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 neon-text-glow font-mono uppercase">
          LEVEL UP!
        </h2>

        <p className="text-xs text-slate-300 font-mono mt-1">
          {levelsGained > 1 ? `You gained ${levelsGained} levels!` : 'Your hunter status has increased.'}
        </p>

        {/* Level Display Badge */}
        <div className="my-6 bg-slate-950/80 border border-cyan-500/30 rounded-xl p-5 shadow-inner">
          <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">New Hunter Level</div>
          <div className="text-5xl font-black text-cyan-400 font-mono tracking-wider">
            LV. {newLevel}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-3">
            <span className="text-xs text-slate-400 font-mono">HUNTER RANK:</span>
            <span className={`px-3 py-0.5 rounded text-xs font-bold ${rankClass}`}>
              RANK {newRank}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono leading-relaxed mb-6">
          &quot;You have satisfied the required XP threshold. The System has granted additional stat authority.&quot;
        </p>

        {/* Confirm Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black uppercase tracking-wider rounded-lg shadow-system-glow transition-transform active:scale-[0.98]"
        >
          CLAIM LEVEL PROMOTION
        </button>
      </div>
    </div>
  );
}
