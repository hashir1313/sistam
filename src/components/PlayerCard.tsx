'use client';

import React, { useRef, useState } from 'react';
import { PlayerData } from '@/lib/types';
import { getXpRequiredForNextLevel } from '@/lib/formulas';
import { Download, Flame, Shield, Coins, Sparkles, Edit3, Zap, Eye, Activity, Dumbbell, Brain } from 'lucide-react';
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

  // Derived Stats from Player Level & Allocation
  const strStat = player.stats.find((s) => s.title.toLowerCase().includes('str'))?.level || player.stats[0]?.level || 10;
  const intStat = player.stats.find((s) => s.title.toLowerCase().includes('int'))?.level || player.stats[1]?.level || 10;
  const vitStat = player.stats.find((s) => s.title.toLowerCase().includes('vit') || s.title.toLowerCase().includes('disc'))?.level || player.stats[3]?.level || 10;
  const agiStat = player.stats.find((s) => s.title.toLowerCase().includes('agi'))?.level || Math.max(5, Math.floor(player.level * 1.5));
  const perStat = player.stats.find((s) => s.title.toLowerCase().includes('per'))?.level || Math.max(5, player.streak * 2);

  const xpPercentage = Math.min(100, Math.floor((player.total_xp_earned / xpNextLevel) * 100));

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${player.name.replace(/\s+/g, '_')}_Hunter_Status.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export status window:', err);
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
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 font-mono">
      {/* Authentic Solo Leveling STATUS Holographic Window Frame */}
      <div
        ref={cardRef}
        className="w-full relative system-status-box rounded-xl p-6 border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-slate-100 overflow-hidden"
      >
        {/* Futuristic Circuit & Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40d_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40d_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Centered STATUS Header Box */}
        <div className="flex justify-center border-b border-cyan-500/30 pb-4 mb-5 relative z-10">
          <div className="relative group">
            <div className="px-10 py-1.5 border border-cyan-400 bg-cyan-950/60 text-cyan-300 text-sm font-bold uppercase tracking-[0.25em] font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              STATUS
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute right-[-32px] top-1.5 p-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Edit Profile Name & Avatar"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Profile Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mb-5 p-3.5 bg-slate-950/95 rounded-lg border border-cyan-400/50 space-y-3 relative z-30 shadow-system-glow">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase">Edit Hunter Identity</div>
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
                Save Identity
              </button>
            </div>
          </form>
        )}

        {/* Level Counter & Metadata Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-5 mb-5 relative z-10 px-2">
          {/* Big Level Display */}
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-black tracking-tight text-white font-mono neon-text-glow">
              {player.level}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">LEVEL</span>
              <div className={`mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rankClass}`}>
                RANK {player.rank}
              </div>
            </div>
          </div>

          {/* Job & Title Info */}
          <div className="text-right space-y-1.5">
            <div className="text-xs text-slate-300">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider mr-2">JOB:</span>
              <span className="font-bold text-cyan-300">Shadow Monarch</span>
            </div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider mr-2">TITLE:</span>
              <span className="font-bold text-sky-200">The One Who Overcame Adversity</span>
            </div>
            <div className="text-[10px] text-amber-400 flex items-center justify-end gap-1 font-bold">
              <Flame className="w-3 h-3 text-amber-500" />
              {player.streak}d Daily Streak
            </div>
          </div>
        </div>

        {/* Single XP Progress Gauge Section */}
        <div className="relative z-10 bg-cyan-950/30 p-4 rounded-lg border border-cyan-500/30 mb-5 space-y-3">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-300 w-14 font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20 animate-pulse" /> XP
            </div>
            <div className="flex-1 h-4 bg-slate-950 rounded-full border border-cyan-500/50 p-0.5 overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <span className="text-xs font-mono text-cyan-300 font-bold">
              {player.total_xp_earned} / {xpNextLevel} XP
            </span>
          </div>

          {/* Fatigue Status Line */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-cyan-500/10 font-mono">
            <div className="flex items-center gap-1 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>FATIGUE: <strong className="text-white">0</strong></span>
            </div>
            <div className="text-purple-400 font-bold text-[11px] tracking-wider">
              XP TO NEXT LV: {player.total_xp_earned} / {xpNextLevel} ({xpPercentage}%)
            </div>
          </div>
        </div>

        {/* Solo Leveling Attribute Matrix Grid (STR, AGI, VIT, INT, PER) */}
        <div className="relative z-10 bg-slate-950/60 p-4 rounded-lg border border-cyan-500/30 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-mono">
            {/* STR */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <Dumbbell className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">STR:</span>
                <span className="text-white font-extrabold text-base">{80 + strStat}</span>
              </div>
              <span className="text-emerald-400 text-xs font-bold green-text-glow">(+{strStat})</span>
            </div>

            {/* VIT */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">VIT:</span>
                <span className="text-white font-extrabold text-base">{50 + vitStat}</span>
              </div>
              <span className="text-emerald-400 text-xs font-bold green-text-glow">(+{vitStat})</span>
            </div>

            {/* AGI */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <Activity className="w-4 h-4 text-sky-400" />
                <span className="font-bold">AGI:</span>
                <span className="text-white font-extrabold text-base">{60 + agiStat}</span>
              </div>
              <span className="text-emerald-400 text-xs font-bold green-text-glow">(+{agiStat})</span>
            </div>

            {/* INT */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="font-bold">INT:</span>
                <span className="text-white font-extrabold text-base">{50 + intStat}</span>
              </div>
              <span className="text-emerald-400 text-xs font-bold green-text-glow">(+{intStat})</span>
            </div>

            {/* PER */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-slate-300">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="font-bold">PER:</span>
                <span className="text-white font-extrabold text-base">{60 + perStat}</span>
              </div>
              <span className="text-emerald-400 text-xs font-bold green-text-glow">(+{perStat})</span>
            </div>

            {/* Available Ability Points */}
            <div className="flex flex-col justify-end items-end col-span-2 sm:col-span-1 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Available Ability Points</span>
              <span className="text-xl font-extrabold text-cyan-400 neon-text-glow font-mono">0</span>
            </div>
          </div>
        </div>

        {/* Footer Info & System Coins */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20 flex justify-between items-center text-xs font-mono relative z-10">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Coins className="w-4 h-4 text-amber-400" />
            {player.coins.toLocaleString()} SYSTEM COINS
          </div>
          <div className="text-[10px] text-slate-500">HUNTER ID: #{player.id.slice(0, 8)}</div>
        </div>
      </div>

      {/* Share / Export Action Button */}
      <button
        onClick={handleDownloadCard}
        disabled={isExporting}
        className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
      >
        <Download className="w-5 h-5" />
        {isExporting ? 'Generating Holographic Status Window...' : 'Export Status Window (PNG)'}
      </button>
    </div>
  );
}
