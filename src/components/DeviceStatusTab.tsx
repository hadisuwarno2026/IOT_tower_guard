/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Eye, Wifi, ShieldCheck, Siren, Cpu, RefreshCw, Radio, Server, Zap, 
  Terminal, ShieldAlert 
} from 'lucide-react';
import { Site, DeviceStatusLog } from '../types.ts';

interface DeviceStatusTabProps {
  sites: Site[];
  deviceLogs: DeviceStatusLog[];
  onInjectTestAlarm: (siteId: string, grounding: string | null, door: string | null) => void;
}

export default function DeviceStatusTab({ sites, deviceLogs, onInjectTestAlarm }: DeviceStatusTabProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>('BTS-001');

  const selectedSite = sites.find(s => s.siteId === selectedSiteId) || sites[0] || {
    siteId: '',
    siteName: 'Tidak Ada Data',
    location: '-',
    latitude: 0,
    longitude: 0,
    grounding: 'NORMAL',
    door: 'TERTUTUP',
    sirene: 'OFF',
    gsm: '3G',
    rssi: 0,
    status: 'OFFLINE',
    lastSeen: '',
    rectifier: 'NORMAL',
    battery: 'NORMAL',
    acPower: 'NORMAL',
    temperature: 0,
    isMuted: false
  };

  const getSignalStrengthQuality = (rssi: number) => {
    if (rssi >= -70) return { label: 'EXCELLENT', color: 'text-emerald-500', barCount: 4 };
    if (rssi >= -85) return { label: 'GOOD', color: 'text-blue-500', barCount: 3 };
    if (rssi >= -95) return { label: 'FAIR / WEAK', color: 'text-amber-500', barCount: 2 };
    return { label: 'POOR / DROPPING', color: 'text-red-500', barCount: 1 };
  };

  const getReadableTime = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString('id-ID') + ' ' + date.toLocaleDateString('id-ID');
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
            <Radio className="text-blue-500" />
            DEVICE STATUS
          </h2>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs font-mono font-bold text-slate-400">PILIH SITE:</span>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-1.5 font-mono focus:outline-none"
          >
            {sites.map(s => (
              <option key={s.siteId} value={s.siteId}>
                {s.siteId} - {s.siteName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT CARD - SENSOR PIN CORRELATION (8 Columns) */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2 tracking-tight uppercase font-mono">ARDUINO PIN CORRELATION &amp; HARDWARE CHANNELS</h3>
            <p className="text-xs text-slate-500 font-mono mb-5 leading-normal">
              Status logika pin mikro-kontroller ESP32 yang disesuaikan dengan interkoneksi wiring diagram fisik:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Grounding switch (GPIO18) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded font-black uppercase">
                      GPIO18 INTERRUPT
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">PULLDOWN</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono mt-2">Grounding Switch Loop</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 mb-4 leading-normal">Mendeteksi integritas kawat tembaga grounding copper pad.</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">DI-1 Logika input:</span>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono ${
                    selectedSite.grounding === 'PUTUS' 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {selectedSite.grounding === 'PUTUS' ? 'HIGH (BROKEN)' : 'LOW (CONNECTED)'}
                  </span>
                </div>
              </div>

              {/* Door intrusion (GPIO19) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded font-black uppercase">
                      GPIO19 INTERRUPT
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">PULLDOWN</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono mt-2">Door Magnetic switch</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 mb-4 leading-normal">Mendeteksi pembukaan pintu shelter oleh magnetik switch.</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">DI-2 Logika input:</span>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono ${
                    selectedSite.door === 'TERBUKA' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {selectedSite.door === 'TERBUKA' ? 'HIGH (SHELTER OPEN)' : 'LOW (LOCKED)'}
                  </span>
                </div>
              </div>

              {/* Relay Sirene (GPIO23) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono bg-pink-50 border border-pink-150 text-pink-750 px-2 py-0.5 rounded font-black uppercase">
                      GPIO23 OUTPUT
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">RELAY DRIVER</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono mt-2">Relay Sirine Alarm</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 mb-4 leading-normal">Transistor driver kelistrikan sirine klakson 12V DC shelter.</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">DO-1 Logika output:</span>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono ${
                    selectedSite.sirene === 'ON' 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-slate-600 text-white'
                  }`}>
                    {selectedSite.sirene === 'ON' ? 'HIGH (SIRENE ON)' : 'LOW (SIRENE OFF)'}
                  </span>
                </div>
              </div>

              {/* Local mute button (GPIO22) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-black uppercase">
                      GPIO22 INPUT
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">PULLUP</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono mt-2">Tombol Mute Lokal</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 mb-4 leading-normal">Tombol push button fisik di lokasi untuk membungkam sirene.</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">DI-3 Logika input:</span>
                  <span className="px-2.5 py-1 bg-slate-700 text-white rounded-xl text-xs font-bold font-mono">
                    {selectedSite.isMuted ? 'LOW (PRESESDMUTE)' : 'HIGH (STANDBY)'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200 text-xs flex flex-wrap gap-4 items-center justify-between">
            <span className="font-mono text-slate-500">GSM MODEM: SIM800L GPRS QUAD-BAND RECEIVER (AT+HTTPACTION SUPPORT)</span>
            <span className="font-bold text-slate-700">WAKTU DETAK TERAKHIR: {getReadableTime(selectedSite.lastSeen)}</span>
          </div>
        </div>

        {/* RIGHT CARD - CELL LINKS & WATCHDOG WATCH (4 Columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6">
          
          {/* Signal Indicator */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase font-mono border-b pb-2">PROPRIETARY GSM LINK</h3>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">Teknologi Link:</span>
                <span className="font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{selectedSite.gsm} LINK</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">Kekuatan Sinyal RSSI:</span>
                <span className="font-black font-mono text-slate-800">{selectedSite.rssi} dBm</span>
              </div>

              {/* Signal Bar decoration based on design mockup */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                  <span>RF QUALITY:</span>
                  <span className={`font-bold ${getSignalStrengthQuality(selectedSite.rssi).color}`}>
                    {getSignalStrengthQuality(selectedSite.rssi).label}
                  </span>
                </div>
                
                <div className="flex gap-1 h-3 items-end">
                  {[1, 2, 3, 4].map(idx => {
                    const isFitted = idx <= getSignalStrengthQuality(selectedSite.rssi).barCount;
                    return (
                      <div 
                        key={idx} 
                        className={`flex-1 rounded-sm ${
                          isFitted 
                            ? selectedSite.rssi < -90 
                              ? 'bg-red-500' 
                              : selectedSite.rssi < -80 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500' 
                            : 'bg-slate-200'
                        }`}
                        style={{ height: `${25 * idx}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SIM800L Command line terminal trace logger client */}
          <div className="space-y-3 flex-1 flex flex-col">
            <h4 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">COM MODEM TERMINAL RAW</h4>
            
            <div className="bg-[#0F172A] p-3 rounded-2xl font-mono text-[9px] text-[#22C55E] flex-1 min-h-[140px] flex flex-col justify-between overflow-hidden">
              <div className="space-y-1 select-none opacity-90 leading-relaxed">
                <div>AT+CREG?</div>
                <div className="text-slate-400">+CREG: 0,1 (REGISTERED HOME)</div>
                <div>AT+SAPBR=1,1</div>
                <div className="text-slate-400">OK (bearer IP assigned: 10.158.42.34)</div>
                <div>AT+HTTPPARA=&quot;URL&quot;,...</div>
                <div>AT+HTTPACTION=1</div>
                <div className="text-slate-400">+HTTPACTION: 1, 200, 36</div>
              </div>
              
              <div className="border-t border-slate-800/10 pt-1.5 flex items-center justify-between text-slate-500">
                <span>SPEED: 9600 BAUD</span>
                <span>COM PORT: Serial2 RxTx</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* RECENT TELEMETRY SINKRONISASI LOGS TABLE */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase font-mono">LOG TELEMETRI REALTIME (20 TRACE TERAKHIR)</h3>
        
        <div className="border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-500 uppercase font-bold uppercase">
                  <th className="py-2.5 px-3">Waktu Telemetri</th>
                  <th className="py-2.5 px-3">Site ID</th>
                  <th className="py-2.5 px-3">Nama BTS</th>
                  <th className="py-2.5 px-3 font-mono">Grounding</th>
                  <th className="py-2.5 px-3 font-mono">Pintu</th>
                  <th className="py-2.5 px-3 font-mono">Sirene</th>
                  <th className="py-2.5 px-3 font-mono">RSSI</th>
                  <th className="py-2.5 px-3 font-mono">GSM</th>
                </tr>
              </thead>
              <tbody className="divide-y text-[11px] font-mono text-slate-600">
                {deviceLogs.slice(0, 20).map((log, index) => {
                  const isGroundingBroken = log.grounding === 'PUTUS';
                  const isDoorOpened = log.door === 'TERBUKA';
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 select-none">
                        {getReadableTime(log.timestamp)}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-800">
                        {log.siteId}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800 font-sans">
                        {log.siteName}
                      </td>
                      <td className={`py-2 px-3 font-bold ${isGroundingBroken ? 'text-red-500' : 'text-emerald-600'}`}>
                        {log.grounding}
                      </td>
                      <td className={`py-2 px-3 font-bold ${isDoorOpened ? 'text-amber-500' : 'text-emerald-600'}`}>
                        {log.door}
                      </td>
                      <td className="py-2 px-3 font-bold">
                        {log.sirene}
                      </td>
                      <td className="py-2 px-3 text-slate-800">
                        {log.rssi} dBm
                      </td>
                      <td className="py-2 px-3 text-indigo-600 font-bold uppercase">
                        {log.gsm}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
