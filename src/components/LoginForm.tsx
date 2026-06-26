/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Eye, Lock, User as UserIcon, Radio, AlertTriangle } from 'lucide-react';
import { User, UserRole } from '../types.ts';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        onLogin({
          id: 'USR-01',
          username: 'admin',
          displayName: 'Administrator',
          role: 'admin' as UserRole
        });
      } else if (username === 'viewer' && password === 'viewer123') {
        onLogin({
          id: 'USR-02',
          username: 'viewer',
          displayName: 'Operator',
          role: 'viewer' as UserRole
        });
      } else {
        setError('Kredensial salah! Gunakan admin/admin123 atau viewer/viewer123');
      }
      setIsLoading(false);
    }, 600);
  };

  const handleQuickLogin = (role: 'admin' | 'viewer') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('viewer');
      setPassword('viewer123');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background Decorative Tech Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-500 shadow-xl mb-4 animate-pulse">
            <Radio size={40} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            TBIG GUARD MONITORING &amp; SECURITY
          </h1>
          <p className="text-sm text-slate-400 font-mono">
            v1.0.4
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-8">

          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/30 rounded-lg flex items-start gap-2.5 text-xs text-red-400">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Username ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="ID Operator"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              {isLoading ? 'Menghubungkan...' : 'Masuk Ke Dashboard'}
            </button>
          </form>

          {/* Quick Setup Credentials Assist */}
          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 text-center mb-3">
              Uji Coba Cepat Kredensial (Role)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-rose-400 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              >
                <Shield size={13} />
                <span>Admin Privileges</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('viewer')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-amber-400 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              >
                <Eye size={13} />
                <span>Viewer Only</span>
              </button>
            </div>
            <div className="mt-3 text-center">
              <span className="text-[10px] text-slate-500 block font-mono">
                Admin: admin / admin123 | Viewer: viewer / viewer123
              </span>
            </div>
          </div>
        </div>

        {/* Outer footer */}
        <div className="text-center mt-6 text-[11px] text-slate-500 font-mono">
          PT Tower Bersama Infrastructure Tbk  &copy; 2026
        </div>
      </div>
    </div>
  );
}
