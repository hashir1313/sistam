'use client';

import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Shield, Zap, Lock, User, Mail, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthGatewayProps {
  onSuccess: () => void;
}

export default function AuthGateway({ onSuccess }: AuthGatewayProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: name || 'Sung Jin-Woo',
        });

        if (signUpError) {
          setError(signUpError.message || 'Failed to register Hunter credentials.');
        } else {
          onSuccess();
        }
      } else {
        const { data, error: signInError } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || 'Invalid Hunter credentials or password.');
        } else {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'System connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Sci-Fi Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/30 via-slate-950/80 to-[#070A10] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            SYSTEM HUNTER AUTHENTICATION
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 font-mono uppercase">
            SOLO LEVELING
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Authenticate your Hunter status to access your personal HUD & quest log.
          </p>
        </div>

        {/* Card Box */}
        <div className="system-card p-6 rounded-2xl border border-cyan-500/30 backdrop-blur-xl bg-slate-950/80 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-6 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-cyan-500 text-slate-950 shadow-system-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ACCESS SYSTEM
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-cyan-500 text-slate-950 shadow-system-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AWAKEN HUNTER
            </button>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" /> Hunter Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sung Jin-Woo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
              </label>
              <input
                type="email"
                required
                placeholder="hunter@system.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-system-glow uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'ENTER SYSTEM' : 'INITIALIZE HUNTER'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center font-mono text-[10px] text-slate-600">
          SYSTEM HUNTER PROGRAM v1.0 • NEON DB & BETTER AUTH GATEWAY
        </div>
      </div>
    </div>
  );
}
