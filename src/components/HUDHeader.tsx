'use client';

import React from 'react';
import { PlayerData } from '@/lib/types';
import { Shield, Coins, Flame, LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface HUDHeaderProps {
  player: PlayerData;
  onSignOut?: () => void;
}

export default function HUDHeader({ player, onSignOut }: HUDHeaderProps) {
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (e) {}
    if (onSignOut) onSignOut();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/30 px-4 py-3 shadow-[0_4px_20px_rgba(6,182,212,0.15)] font-mono">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Branding & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-system-glow">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 uppercase">
              THE SYSTEM // HUNTER HUD
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              REAL-LIFE QUEST LOG & STAT ALLOCATOR
            </p>
          </div>
        </div>

        {/* Top HUD Badges */}
        <div className="flex items-center gap-3">
          {/* Rank Badge */}
          <div className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase">RANK:</span>
            <span className="font-bold text-cyan-400 text-sm">{player.rank}</span>
          </div>

          {/* Coins Badge */}
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-xs font-mono text-amber-300 flex items-center gap-2 shadow-gold-glow">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-amber-400 text-sm">
              {player.coins.toLocaleString('en-US')}
            </span>
          </div>

          {/* Streak Badge */}
          <div className="px-3 py-1.5 rounded-lg bg-orange-950/60 border border-orange-500/40 text-xs font-mono text-orange-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="font-bold text-orange-400">{player.streak}d Streak</span>
          </div>

          {/* Sign Out / Exit System Button */}
          {onSignOut && (
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-red-500/50 hover:bg-red-950/50 text-slate-400 hover:text-red-400 transition-colors"
              title="Lock System / Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
