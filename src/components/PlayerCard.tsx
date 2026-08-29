'use client';

import React, { useRef, useState } from 'react';
import { PlayerData } from '@/lib/types';
import { getXpRequiredForNextLevel } from '@/lib/formulas';
import { Download, Flame, Shield, Coins, Sparkles, Edit3, Check, X } from 'lucide-react';
import { toPng } from 'html-to-image';

interface PlayerCardProps {
  player: PlayerData;
  onUpdateProfile?: (name: string, avatar: string) => void;
}

export default function PlayerCard({ player, onUpdateProfile }: PlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(player.name);
  const [editAvatar, setEditAvatar] = useState(player.avatar);

  const xpNextLevel = getXpRequiredForNextLevel(player.level);
  const rankClass = `rank-badge-${player.rank}`;

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${player.name.replace(/\s+/g, '_')}_Hunter_Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export card image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile && editName.trim()) {
      onUpdateProfile(editName.trim(), editAvatar.trim() || player.avatar);
    }
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4">
      {/* Shareable Card Canvas Container */}
      <div
        ref={cardRef}
        className="w-full relative system-card rounded-xl p-6 border-2 border-cyan-500/40 shadow-system-glow clip-corner text-slate-100 overflow-hidden"
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0a_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header: Title & Rank */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="font-bold tracking-widest text-xs uppercase text-cyan-400 font-mono">
              SYSTEM // HUNTER STATUS CARD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Edit Profile Name & Avatar"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${rankClass}`}>
              RANK {player.rank}
            </div>
          </div>
        </div>

        {/* Profile Edit Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mb-5 p-3.5 bg-slate-950/90 rounded-lg border border-cyan-500/40 space-y-3 relative z-20">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase">Edit Profile</div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Hunter Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold text-xs rounded hover:bg-cyan-400"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Avatar & Player Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 mb-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-system-glow bg-slate-950 p-1">
              <img
                src={player.avatar}
                alt={player.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-amber-500/50 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              {player.streak}d Streak
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
              {player.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Joined System: {player.joined}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-mono block">Player Level</span>
                <span className="text-xl font-black text-cyan-400 font-mono">LV. {player.level}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-mono block">Total XP</span>
                <span className="text-xl font-black text-purple-400 font-mono">
                  {player.total_xp_earned.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="relative z-10 mb-6 bg-slate-950/80 p-3 rounded-lg border border-cyan-500/20">
          <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-1.5">
            <span>XP To Next Level</span>
            <span className="text-cyan-400 font-bold">
              {player.total_xp_earned} / {xpNextLevel} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500 shadow-system-glow"
              style={{
                width: `${Math.min(100, (player.total_xp_earned / xpNextLevel) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Player Stats Grid */}
        <div className="relative z-10 bg-slate-950/40 p-4 rounded-lg border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-cyan-400" />
            ATTRIBUTES & STAT LEVELS
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {player.stats.map((stat) => (
              <div
                key={stat.id}
                className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">{stat.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{stat.xp_earned} XP</div>
                </div>
                <div className="text-sm font-bold text-cyan-400 font-mono">
                  LV.{stat.level}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-5 pt-3 border-t border-slate-800/60 flex justify-between items-center text-[10px] font-mono text-slate-500 relative z-10">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Coins className="w-3.5 h-3.5" />
            {player.coins.toLocaleString()} SYSTEM COINS
          </div>
          <div>SYSTEM HUNTER PROGRAM v1.0</div>
        </div>
      </div>

      {/* Share / Export Action Button */}
      <button
        onClick={handleDownloadCard}
        disabled={isExporting}
        className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold uppercase tracking-wider rounded-lg shadow-system-glow flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
      >
        <Download className="w-5 h-5" />
        {isExporting ? 'Generating Hunter Card...' : 'Share / Export Player Card (PNG)'}
      </button>
    </div>
  );
}
