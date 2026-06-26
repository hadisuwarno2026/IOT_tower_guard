/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Eye, ShieldCheck, ClipboardList, Search, UserCheck } from 'lucide-react';
import { AuditTrail, User } from '../types.ts';

interface UserManagementTabProps {
  auditTrails: AuditTrail[];
  currentUser: User;
}

export default function UserManagementTab({ auditTrails, currentUser }: UserManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const usersList = [
    { id: 'USR-01', username: 'admin', displayName: 'Administrator', role: 'admin', lastActive: 'Sesi Aktif Sekarang' },
    { id: 'USR-02', username: 'viewer', displayName: 'Operator', role: 'viewer', lastActive: 'Aktif 8 menit lalu' }
  ];

  const filteredTrails = auditTrails.filter(trail => {
    return trail.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
           trail.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
           trail.details.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getReadableTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('id-ID') + ' ' + d.toLocaleTimeString('id-ID');
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <UserCheck className="text-emerald-500" />
            KEANGGOTAAN OPERATOR &amp; AUDIT TRAIL
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN - ACTIVE ACCOUNTS DRAWER (4 columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-1">
            <Shield className="text-indigo-500" size={16} />
            <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase font-mono">Operator Profiles</h3>
          </div>

          <div className="space-y-3">
            {usersList.map(user => {
              const isAdmin = user.role === 'admin';
              const isCurrent = user.username === currentUser.username;

              return (
                <div key={user.id} className={`p-4 rounded-2xl border ${isCurrent ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-150 bg-slate-50/50'}`}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-800 tracking-tight">{user.displayName}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      isAdmin ? 'bg-red-50 text-red-650 border border-red-150' : 'bg-amber-50 text-amber-650 border border-amber-150'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>ID: {user.username}</span>
                    <span className={isCurrent ? 'text-emerald-600 font-bold animate-pulse' : ''}>
                      {isCurrent ? 'Sesi Aktif' : user.lastActive}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN - AUDIT TRAILS MASTER (8 columns) */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <ClipboardList className="text-indigo-500" size={18} />
              <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase font-mono">AUDIT TRAIL LOG RECORD</h3>
            </div>

            {/* Search audit log */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Cari aktivitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="border border-slate-150 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-mono text-slate-450 uppercase font-bold text-slate-500">
                    <th className="py-2.5 px-3">Waktu Operator</th>
                    <th className="py-2.5 px-3">Pengguna</th>
                    <th className="py-2.5 px-3">Aksi</th>
                    <th className="py-2.5 px-3">Deskripsi Kejadian</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs select-none">
                  {filteredTrails.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-mono">
                        Belum ada rekaman audit trail.
                      </td>
                    </tr>
                  ) : (
                    filteredTrails.map((trail) => {
                      const isSystem = trail.user === 'SYSTEM';
                      const isESP = trail.user === 'ESP32';
                      return (
                        <tr key={trail.id} className="hover:bg-slate-50 font-mono text-[11px]">
                          <td className="py-2 px-3 text-slate-500 shrink-0">
                            {getReadableTime(trail.timestamp)}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              isSystem 
                                ? 'bg-slate-100 text-slate-600' 
                                : isESP 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'bg-indigo-50 text-indigo-650'
                            }`}>
                              {trail.user}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-800">
                            {trail.action}
                          </td>
                          <td className="py-2 px-3 text-slate-600 leading-normal max-w-sm">
                            {trail.details}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
