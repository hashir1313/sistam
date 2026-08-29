'use client';

import React from 'react';
import { PlayerData } from '@/lib/types';
import { Sparkles, Flame, Coins, ShieldAlert } from 'lucide-react';

interface HUDHeaderProps {
  player: PlayerData;
}

export default function HUDHeader({ player }: HUDHeaderProps) {
  return (
    <header className="w-full bg-slate-950/90 border-b border-cyan-500/30 py-4 px-4 sm:px-8 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* System Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-400/60 flex items-center justify-center shadow-system-glow">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest font-mono text-cyan-400 uppercase neon-text-glow">
              THE SYSTEM // HUNTER HUD
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              REAL-LIFE QUEST LOG & STAT ALLOCATOR
            </p>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-200">
            <span className="text-slate-400">RANK:</span>
            <span className={`font-bold text-cyan-400`}>{player.rank}</span>
          </div>

          <div className="bg-slate-900 border border-amber-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-amber-400 font-bold">
            <Coins className="w-3.5 h-3.5" />
            {player.coins.toLocaleString()}
          </div>

          <div className="bg-slate-900 border border-orange-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-orange-400 font-bold">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            {player.streak}d Streak
          </div>
        </div>
      </div>
    </header>
  );
}
