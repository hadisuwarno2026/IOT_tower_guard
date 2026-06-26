/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { Site, AlarmLog, AuditTrail, IntegrationConfig, DeviceStatusLog } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory state
let lastUpdateTs = 0;
let sites: Site[] = [
  {
    siteId: 'BTS-001',
    siteName: 'BTS SUMBERJAYA',
    location: 'Sumberjaya, Indonesia',
    latitude: -6.914744,
    longitude: 107.609810,
    grounding: 'NORMAL',
    door: 'TERTUTUP',
    sirene: 'OFF',
    gsm: '4G',
    rssi: -72,
    status: 'ONLINE',
    lastSeen: new Date().toISOString(),
    rectifier: 'NORMAL',
    battery: 'NORMAL',
    acPower: 'NORMAL',
    temperature: 28
  },
  {
    siteId: 'BTS-002',
    siteName: 'BTS CIKALONG',
    location: 'Cikalong, Indonesia',
    latitude: -6.820202,
    longitude: 107.411212,
    grounding: 'NORMAL',
    door: 'TERTUTUP',
    sirene: 'OFF',
    gsm: '3G',
    rssi: -85,
    status: 'ONLINE',
    lastSeen: new Date().toISOString(),
    rectifier: 'NORMAL',
    battery: 'NORMAL',
    acPower: 'NORMAL',
    temperature: 27
  },
  {
    siteId: 'BTS-003',
    siteName: 'BTS PADALARANG',
    location: 'Padalarang, Indonesia',
    latitude: -6.839811,
    longitude: 107.472890,
    grounding: 'PUTUS',
    door: 'TERTUTUP',
    sirene: 'ON',
    gsm: '4G',
    rssi: -65,
    status: 'ONLINE',
    lastSeen: new Date().toISOString(),
    rectifier: 'FAULT',
    battery: 'NORMAL',
    acPower: 'FAIL',
    temperature: 32
  },
  {
    siteId: 'BTS-004',
    siteName: 'BTS BALEENDAH',
    location: 'Baleendah, Indonesia',
    latitude: -7.014210,
    longitude: 107.632200,
    grounding: 'NORMAL',
    door: 'TERBUKA',
    sirene: 'ON',
    gsm: '4G',
    rssi: -78,
    status: 'ONLINE',
    lastSeen: new Date(Date.now() - 30 * 60000).toISOString(),
    rectifier: 'NORMAL',
    battery: 'LOW',
    acPower: 'NORMAL',
    temperature: 29
  },
  {
    siteId: 'BTS-005',
    siteName: 'BTS LEMBANG',
    location: 'Lembang, Bandung',
    latitude: -6.818290,
    longitude: 107.618911,
    grounding: 'NORMAL',
    door: 'TERTUTUP',
    sirene: 'OFF',
    gsm: '4G',
    rssi: -92,
    status: 'OFFLINE',
    lastSeen: new Date(Date.now() - 12 * 3600000).toISOString(),
    rectifier: 'FAULT',
    battery: 'LOW',
    acPower: 'FAIL',
    temperature: 24
  }
];

// Seed initial alarm logs
let alarmLogs: AlarmLog[] = [
  {
    id: 'AL-001',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    siteId: 'BTS-003',
    siteName: 'BTS PADALARANG',
    alarmType: 'GROUNDING_PUTUS',
    status: 'ACTIVE',
    keterangan: 'Kabel Grounding terdeteksi PUTUS. Hambatan tak terhingga.'
  },
  {
    id: 'AL-002',
    timestamp: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    siteId: 'BTS-003',
    siteName: 'BTS PADALARANG',
    alarmType: 'AC_POWER_FAIL',
    status: 'ACTIVE',
    keterangan: 'Tegangan AC Power Utama padam, sistem berjalan pada baterai.'
  },
  {
    id: 'AL-003',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    siteId: 'BTS-004',
    siteName: 'BTS BALEENDAH',
    alarmType: 'PINTU_TERBUKA',
    status: 'ACTIVE',
    keterangan: 'Pintu Shelter BTS Terbuka secara tiba-tiba tanpa ijin akses.'
  },
  {
    id: 'AL-004',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    siteId: 'BTS-005',
    siteName: 'BTS LEMBANG',
    alarmType: 'ESP32_OFFLINE',
    status: 'ACTIVE',
    keterangan: 'Sensor ESP32 kehilangan koneksi (Ping timeout > 10 menit)'
  },
  {
    id: 'AL-005',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    siteId: 'BTS-001',
    siteName: 'BTS SUMBERJAYA',
    alarmType: 'GROUNDING_PUTUS',
    status: 'CLOSED',
    keterangan: 'Grounding Putus terdeteksi dan telah diperbaiki oleh Teknisi.'
  },
  {
    id: 'AL-006',
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
    siteId: 'BTS-002',
    siteName: 'BTS CIKALONG',
    alarmType: 'PINTU_TERBUKA',
    status: 'CLOSED',
    keterangan: 'Pintu Shelter BTS terbuka untuk pemeliharaan rutin. Ditutup kembali.'
  }
];

// Seed initial history logs
let deviceLogs: DeviceStatusLog[] = [
  {
    timestamp: new Date().toISOString(),
    siteId: 'BTS-001',
    siteName: 'BTS SUMBERJAYA',
    grounding: 'NORMAL',
    door: 'TERTUTUP',
    sirene: 'OFF',
    gsm: '4G',
    rssi: -72
  },
  {
    timestamp: new Date().toISOString(),
    siteId: 'BTS-002',
    siteName: 'BTS CIKALONG',
    grounding: 'NORMAL',
    door: 'TERTUTUP',
    sirene: 'OFF',
    gsm: '3G',
    rssi: -85
  },
  {
    timestamp: new Date().toISOString(),
    siteId: 'BTS-003',
    siteName: 'BTS PADALARANG',
    grounding: 'PUTUS',
    door: 'TERTUTUP',
    sirene: 'ON',
    gsm: '4G',
    rssi: -65
  }
];

// Init integration configurations
let integrationConfig: IntegrationConfig = {
  gasUrl: 'https://script.google.com/macros/s/AKfycby8jU1M_BTS_MON_WebHooks/exec',
  whatsappProvider: 'fonnte',
  whatsappToken: 'FONNTE_TOKEN_97Fv2a1Bx',
  whatsappPhone: '081234567890',
  whatsappEnabled: true,
  muteDurationMin: 5
};

// Seed audit trail logs
let auditTrails: AuditTrail[] = [
  {
    id: 'AT-001',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    user: 'Admin',
    action: 'LOGIN',
    details: 'User Admin masuk ke dalam sistem dari alamat IP 192.168.1.50'
  },
  {
    id: 'AT-002',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    user: 'Admin',
    action: 'MUTE ALARM',
    details: 'Siren pada BTS-003 dimatikan secara manual (Muted 5 menit)'
  },
  {
    id: 'AT-003',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    user: 'Admin',
    action: 'CONFIG UPDATE',
    details: 'Mengubah token Fonnte WhatsApp API dan memperbarui URL Webhook Google Apps Script.'
  }
];

// Middleware to transparently synchronize state from client in serverless/stateless environments (e.g. Vercel)
app.use((req, res, next) => {
  if (req.body) {
    const clientSites = req.body.clientSites || req.body.sites;
    const clientConfig = req.body.clientConfig || req.body.integrationConfig;
    const clientAlarms = req.body.clientAlarms || req.body.alarmLogs;
    const clientDeviceLogs = req.body.clientDeviceLogs || req.body.deviceLogs;
    const clientAudit = req.body.clientAudit || req.body.auditTrails;

    if (clientSites && Array.isArray(clientSites) && clientSites.length > 0) {
      sites = clientSites;
    }
    if (clientConfig && typeof clientConfig === 'object') {
      integrationConfig = { ...integrationConfig, ...clientConfig };
    }
    if (clientAlarms && Array.isArray(clientAlarms)) {
      alarmLogs = clientAlarms;
    }
    if (clientDeviceLogs && Array.isArray(clientDeviceLogs)) {
      deviceLogs = clientDeviceLogs;
    }
    if (clientAudit && Array.isArray(clientAudit)) {
      auditTrails = clientAudit;
    }
  }
  next();
});

// Map of sirene muted status: key is siteId, value is boolean (true if muted)
const mutedSirens: { [siteId: string]: boolean } = {};

// Simulate Out-of-bound logs generator and helper functions
function checkSirenAutoReset() {
  // Disabled as per user request ("tidak perlu dibuat timer, hanya mute dan on saja")
}

function createAuditLog(user: string, action: string, details: string) {
  const log: AuditTrail = {
    id: 'AT-' + Math.floor(100+Math.random()*900) + '-' + Date.now().toString().slice(-4),
    timestamp: new Date().toISOString(),
    user,
    action,
    details
  };
  auditTrails.unshift(log);
  if (auditTrails.length > 100) auditTrails.pop();
}

// Simulated WhatsApp Cloud / Fonnte / Wablas callback logger
let whatsappNotificationLogs: Array<{
  timestamp: string;
  siteId: string;
  phoneNumber: string;
  provider: string;
  messageType: string;
  messageText: string;
  status: 'SENT' | 'FAILED';
}> = [];

async function sendWhatsAppActual(phone: string, text: string) {
  if (!integrationConfig.whatsappEnabled || !integrationConfig.whatsappToken) {
    return { status: 'FAILED', error: 'WhatsApp disabled or token missing' };
  }
  
  const provider = (integrationConfig.whatsappProvider || 'fonnte').toLowerCase();
  const token = integrationConfig.whatsappToken;
  
  // Auto format phone number (e.g., 08123456789 -> 628123456789)
  let formattedPhone = phone.trim();
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.replace('+', '');
  }
  formattedPhone = formattedPhone.replace(/[^0-9]/g, ''); // keep only numbers
  
  try {
    if (provider === 'fonnte') {
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: formattedPhone,
          message: text
        })
      });
      const resJson: any = await response.json();
      console.log('[Fonnte Send API Response]:', resJson);
      if (response.ok && (resJson.status === true || resJson.status === 'true' || resJson.status === 'success' || resJson.status === 'SENT' || resJson.message === 'success')) {
        return { status: 'SENT' };
      } else {
        return { status: 'FAILED', error: resJson.reason || resJson.message || JSON.stringify(resJson) };
      }
    } else if (provider === 'wablas') {
      const response = await fetch('https://api.wablas.com/api/send-message', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message: text
        })
      });
      const resJson: any = await response.json();
      console.log('[Wablas Send API Response]:', resJson);
      if (response.ok && (resJson.status === true || resJson.status === 'true' || resJson.status === 'success')) {
        return { status: 'SENT' };
      } else {
        return { status: 'FAILED', error: resJson.message || resJson.reason || JSON.stringify(resJson) };
      }
    } else if (provider === 'whatsapp_cloud_api') {
      // Support TOKEN|PHONE_NUMBER_ID format
      let waToken = token;
      let waPhoneId = 'me';
      if (token.includes('|')) {
        const parts = token.split('|');
        waToken = parts[0].trim();
        waPhoneId = parts[1].trim();
      }
      
      const response = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${waToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: text }
        })
      });
      const resJson: any = await response.json();
      console.log('[WA Cloud API Response]:', resJson);
      if (response.ok && !resJson.error) {
        return { status: 'SENT' };
      } else {
        return { status: 'FAILED', error: resJson.error?.message || JSON.stringify(resJson) };
      }
    }
    return { status: 'SENT' };
  } catch (err: any) {
    console.error('[WhatsApp Send Error]:', err);
    return { status: 'FAILED', error: err.message || String(err) };
  }
}

function triggerSimulatedWhatsApp(site: Site, type: 'NORMAL' | 'GROUNDING_PUTUS' | 'PINTU_TERBUKA') {
  if (!integrationConfig.whatsappEnabled) return;

  const timestampStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  let text = '';

  if (type === 'NORMAL') {
    text = `🟢 BTS MONITORING\n\nSITE:\n${site.siteId} - ${site.siteName}\n\nSTATUS:\nNORMAL\n\nGrounding : Normal\nDoor : Tertutup\nSirene : OFF\n\nTanggal:\n${timestampStr}`;
  } else if (type === 'GROUNDING_PUTUS') {
    text = `🔴 BTS ALARM CRITICAL\n\n⚠️ Grounding Putus\n\nSite:\n${site.siteId} - ${site.siteName}\n\nLokasi:\n${site.location}\n\nStatus:\nGROUNDING PUTUS\n\nTindakan:\nPeriksa kabel grounding segera.\n\nWaktu:\n${timestampStr}`;
  } else if (type === 'PINTU_TERBUKA') {
    text = `🟠 BTS SECURITY ALERT\n\n⚠️ Pintu BTS Terbuka\n\nSite:\n${site.siteId} - ${site.siteName}\n\nLokasi:\n${site.location}\n\nStatus:\nDOOR OPEN\n\nKemungkinan:\nAkses tidak sah\n\nWaktu:\n${timestampStr}`;
  }

  const phones = integrationConfig.whatsappPhone
    ? integrationConfig.whatsappPhone.split(/[,;\s]+/).map(p => p.trim()).filter(p => p.length > 0)
    : [];

  if (phones.length === 0) {
    phones.push('081234567890');
  }

  phones.forEach(async (phone) => {
    const logEntry: any = {
      timestamp: new Date().toISOString(),
      siteId: site.siteId,
      phoneNumber: phone,
      provider: integrationConfig.whatsappProvider.toUpperCase(),
      messageType: type,
      messageText: text,
      status: 'SENT'
    };
    whatsappNotificationLogs.unshift(logEntry);

    if (integrationConfig.whatsappEnabled && integrationConfig.whatsappToken) {
      const result = await sendWhatsAppActual(phone, text);
      if (result.status === 'FAILED') {
        logEntry.status = 'FAILED';
      }
    }
  });

  if (whatsappNotificationLogs.length > 100) {
    whatsappNotificationLogs.splice(100);
  }
}

// Helper to log telemetry & alarm data to Google Sheets
async function sendToSpreadsheet(payload: any) {
  if (!integrationConfig.gasUrl) return;
  try {
    const response = await fetch(integrationConfig.gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        source: 'server_simulation' // Tells GAS to skip looping back to dashboard
      })
    });
    if (!response.ok) {
      console.error(`Spreadsheet log error: ${response.statusText}`);
    } else {
      console.log('Successfully logged to spreadsheet');
    }
  } catch (error) {
    console.error('Spreadsheet log failed:', error);
  }
}

// Keep ESP32 status online tracker (mock watchdog)
setInterval(() => {
  const now = Date.now();
  checkSirenAutoReset();
}, 5000);


// ==========================================
// API ROUTES
// ==========================================

// Add a new tower
app.post('/api/sites', async (req, res) => {
  const { siteId, siteName, location, latitude, longitude, rectifier, battery, acPower, temperature, username } = req.body;
  if (!siteId || !siteName) {
    return res.status(400).json({ error: 'siteId and siteName are required' });
  }

  const existing = sites.find(s => s.siteId.toUpperCase() === siteId.toUpperCase());
  if (existing) {
    return res.status(400).json({ error: `Site ID ${siteId} sudah terdaftar.` });
  }

  const newSite: Site = {
    siteId: siteId.toUpperCase(),
    siteName,
    location: location || 'Lokasi Baru, Indonesia',
    latitude: Number(latitude) || -6.914744,
    longitude: Number(longitude) || 107.609810,
    grounding: 'NORMAL',
    door: 'TERTUTUP',
    sirene: 'OFF',
    gsm: '4G',
    rssi: -75,
    status: 'ONLINE',
    lastSeen: new Date().toISOString(),
    rectifier: rectifier || 'NORMAL',
    battery: battery || 'NORMAL',
    acPower: acPower || 'NORMAL',
    temperature: Number(temperature) || 28
  };

  sites.push(newSite);
  lastUpdateTs = Date.now();
  createAuditLog(username || 'Admin', 'ADD SITE', `Menambahkan BTS baru: ${newSite.siteId} - ${newSite.siteName}`);

  // Send to Google Sheets SITE sheet
  await sendToSpreadsheet({
    action: 'CRUD_SITE',
    method: 'POST',
    site: {
      siteId: newSite.siteId,
      siteName: newSite.siteName,
      location: newSite.location,
      latitude: newSite.latitude,
      longitude: newSite.longitude
    }
  });

  res.json({ status: 'success', site: newSite });
});

// Update an existing tower
app.put('/api/sites/:siteId', async (req, res) => {
  const { siteId } = req.params;
  const { siteName, location, latitude, longitude, rectifier, battery, acPower, temperature, status, gsm, rssi, username } = req.body;

  const site = sites.find(s => s.siteId.toUpperCase() === siteId.toUpperCase());
  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }

  if (siteName) site.siteName = siteName;
  if (location) site.location = location;
  if (latitude !== undefined) site.latitude = Number(latitude);
  if (longitude !== undefined) site.longitude = Number(longitude);
  if (rectifier) site.rectifier = rectifier;
  if (battery) site.battery = battery;
  if (acPower) site.acPower = acPower;
  if (temperature !== undefined) site.temperature = Number(temperature);
  if (status) site.status = status;
  if (gsm) site.gsm = gsm;
  if (rssi !== undefined) site.rssi = Number(rssi);

  lastUpdateTs = Date.now();
  createAuditLog(username || 'Admin', 'UPDATE SITE', `Memperbarui data BTS: ${site.siteId} - ${site.siteName}`);

  // Send to Google Sheets SITE sheet
  await sendToSpreadsheet({
    action: 'CRUD_SITE',
    method: 'PUT',
    site: {
      siteId: site.siteId,
      siteName: site.siteName,
      location: site.location,
      latitude: site.latitude,
      longitude: site.longitude
    }
  });

  res.json({ status: 'success', site });
});

// Delete a tower
app.delete('/api/sites/:siteId', async (req, res) => {
  const { siteId } = req.params;
  const { username } = req.body;

  const index = sites.findIndex(s => s.siteId.toUpperCase() === siteId.toUpperCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Site not found' });
  }

  const removedSite = sites[index];
  sites.splice(index, 1);
  lastUpdateTs = Date.now();

  createAuditLog(username || 'Admin', 'DELETE SITE', `Menghapus BTS: ${removedSite.siteId} - ${removedSite.siteName}`);

  // Send to Google Sheets SITE sheet
  await sendToSpreadsheet({
    action: 'CRUD_SITE',
    method: 'DELETE',
    site: {
      siteId: removedSite.siteId
    }
  });

  res.json({ status: 'success', message: `Site ${siteId} deleted successfully` });
});

// Get current system status
app.get('/api/status', (req, res) => {
  const mutableSitesStatus = sites.map(site => {
    const isMuted = !!mutedSirens[site.siteId];
    return {
      ...site,
      mutedRemaining: 0,
      isMuted
    };
  });

  res.json({
    sites: mutableSitesStatus,
    alarmLogs,
    deviceLogs,
    auditTrails,
    integrationConfig,
    whatsappLogs: whatsappNotificationLogs,
    lastUpdateTs
  });
});

// Post endpoint to restore client state to serverless memory
app.post('/api/restore-state', (req, res) => {
  const { sites: clientSites, integrationConfig: clientConfig, alarmLogs: clientAlarms, deviceLogs: clientDeviceLogs, auditTrails: clientAudit } = req.body;
  
  if (clientSites && Array.isArray(clientSites) && clientSites.length > 0) {
    sites = clientSites;
  }
  if (clientConfig && typeof clientConfig === 'object') {
    integrationConfig = { ...integrationConfig, ...clientConfig };
  }
  if (clientAlarms && Array.isArray(clientAlarms)) {
    alarmLogs = clientAlarms;
  }
  if (clientDeviceLogs && Array.isArray(clientDeviceLogs)) {
    deviceLogs = clientDeviceLogs;
  }
  if (clientAudit && Array.isArray(clientAudit)) {
    auditTrails = clientAudit;
  }
  
  lastUpdateTs = Date.now();
  
  res.json({
    status: 'success',
    sites,
    integrationConfig,
    alarmLogs,
    deviceLogs,
    auditTrails,
    lastUpdateTs
  });
});

// ESP32 POST Telemetry Endpoint (Real working endpoint!)
app.post('/api/esp32', async (req, res) => {
  const { site_id, grounding, door, sirene, gsm, rssi, site_name } = req.body;

  if (!site_id) {
    return res.status(400).json({ error: 'site_id is required' });
  }

  // Find or create site
  let site = sites.find(s => s.siteId === site_id || s.siteId.toLowerCase() === site_id.toLowerCase());
  
  const isNew = !site;
  if (isNew) {
    site = {
      siteId: site_id.toUpperCase(),
      siteName: site_name || `BTS ${site_id.toUpperCase()}`,
      location: 'Lokasi Baru, Indonesia',
      latitude: -6.914744 + (Math.random() - 0.5) * 0.1,
      longitude: 107.609810 + (Math.random() - 0.5) * 0.1,
      grounding: 'NORMAL',
      door: 'TERTUTUP',
      sirene: 'OFF',
      gsm: gsm || '4G',
      rssi: Number(rssi) || -75,
      status: 'ONLINE',
      lastSeen: new Date().toISOString(),
      rectifier: 'NORMAL',
      battery: 'NORMAL',
      acPower: 'NORMAL',
      temperature: 28
    };
    sites.push(site);
    createAuditLog('SYSTEM', 'NEW SITE REGISTERED', `BTS baru ${site_id} otomatis tersambung ke jaringan backend.`);
  }

  const oldGrounding = site!.grounding;
  const oldDoor = site!.door;

  // Update fields if provided
  if (grounding) site!.grounding = grounding === 'PUTUS' ? 'PUTUS' : 'NORMAL';
  if (door) site!.door = door === 'TERBUKA' ? 'TERBUKA' : 'TERTUTUP';
  if (gsm) site!.gsm = gsm;
  if (rssi) site!.rssi = Number(rssi);
  
  // Update status and watchdog timer
  site!.status = 'ONLINE';
  site!.lastSeen = new Date().toISOString();

  // If sirens are muted, keep sirene state OFF, else follow active alarms
  const sireneActive = site!.grounding === 'PUTUS' || site!.door === 'TERBUKA';
  const isMuted = !!mutedSirens[site!.siteId];
  
  if (sireneActive) {
    site!.sirene = isMuted ? 'OFF' : 'ON';
  } else {
    site!.sirene = 'OFF';
    if (mutedSirens[site!.siteId]) {
      delete mutedSirens[site!.siteId]; // Clear mute state when normal
    }
  }

  // Log alarms in ALARM_LOG if state transitioned
  const newAlarmLogs: AlarmLog[] = [];

  // Grounding transitions
  if (oldGrounding === 'NORMAL' && site!.grounding === 'PUTUS') {
    const logId = 'AL-' + Math.floor(100+Math.random()*900) + '-' + Date.now().toString().slice(-4);
    const newLog: AlarmLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      siteId: site!.siteId,
      siteName: site!.siteName,
      alarmType: 'GROUNDING_PUTUS',
      status: 'ACTIVE',
      keterangan: 'Kabel Grounding terdeteksi PUTUS oleh ESP32 (GPIO18).'
    };
    alarmLogs.unshift(newLog);
    triggerSimulatedWhatsApp(site!, 'GROUNDING_PUTUS');
    createAuditLog('ESP32', 'GROUNDING ALARM ACTIVE', `BTS ${site!.siteId} terdeteksi Grounding Putus.`);
  } else if (oldGrounding === 'PUTUS' && site!.grounding === 'NORMAL') {
    // Close existing active grounding alarms for this site
    alarmLogs = alarmLogs.map(log => {
      if (log.siteId === site!.siteId && log.alarmType === 'GROUNDING_PUTUS' && log.status === 'ACTIVE') {
        return { ...log, status: 'CLOSED' };
      }
      return log;
    });
    triggerSimulatedWhatsApp(site!, 'NORMAL');
    createAuditLog('ESP32', 'GROUNDING ALARM RECOVERED', `BTS ${site!.siteId} Grounding kembali normal.`);
  }

  // Door transitions
  if (oldDoor === 'TERTUTUP' && site!.door === 'TERBUKA') {
    const logId = 'AL-' + Math.floor(100+Math.random()*900) + '-' + Date.now().toString().slice(-4);
    const newLog: AlarmLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      siteId: site!.siteId,
      siteName: site!.siteName,
      alarmType: 'PINTU_TERBUKA',
      status: 'ACTIVE',
      keterangan: 'Pintu Shelter BTS Terbuka oleh ESP32 (GPIO19).'
    };
    alarmLogs.unshift(newLog);
    triggerSimulatedWhatsApp(site!, 'PINTU_TERBUKA');
    createAuditLog('ESP32', 'DOOR ALARM ACTIVE', `BTS ${site!.siteId} terdeteksi Pintu Terbuka.`);
  } else if (oldDoor === 'TERBUKA' && site!.door === 'TERTUTUP') {
    // Close existing active door alarms for this site
    alarmLogs = alarmLogs.map(log => {
      if (log.siteId === site!.siteId && log.alarmType === 'PINTU_TERBUKA' && log.status === 'ACTIVE') {
        return { ...log, status: 'CLOSED' };
      }
      return log;
    });
    triggerSimulatedWhatsApp(site!, 'NORMAL');
    createAuditLog('ESP32', 'DOOR ALARM RECOVERED', `BTS ${site!.siteId} Pintu ditutup kembali.`);
  }

  // Append to device log tracking history
  const newDevLog: DeviceStatusLog = {
    timestamp: new Date().toISOString(),
    siteId: site!.siteId,
    siteName: site!.siteName,
    grounding: site!.grounding,
    door: site!.door,
    sirene: site!.sirene,
    gsm: site!.gsm,
    rssi: site!.rssi
  };
  deviceLogs.unshift(newDevLog);
  if (deviceLogs.length > 100) deviceLogs.pop();

  lastUpdateTs = Date.now();

  // Send status update to Google Sheets if it didn't originate from GAS/simulation to prevent infinite loop
  if (req.body.source !== 'server_simulation') {
    await sendToSpreadsheet({
      site_id: site!.siteId,
      site_name: site!.siteName,
      grounding: site!.grounding,
      door: site!.door,
      sirene: site!.sirene,
      gsm: site!.gsm,
      rssi: site!.rssi,
      skipForward: true
    });
  }

  res.json({
    status: 'success',
    site: site,
    sirene_command: site!.sirene, // Respond with "ON" or "OFF" to let ESP32 control real physical siren relay!
    is_muted: isMuted
  });
});

// POST Manual Mute or ON Sirene for specific site (Client button click)
app.post('/api/mute', (req, res) => {
  const { siteId, action, username } = req.body;
  const site = sites.find(s => s.siteId.toUpperCase() === siteId.toUpperCase());

  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }

  const isMuting = action === 'MUTE' || !action;

  if (isMuting) {
    mutedSirens[siteId] = true;
    site.sirene = 'OFF';
    createAuditLog(username || 'Admin', 'MUTE SIRENE', `Siren pada ${siteId} dibungkam secara manual.`);

    // Send WhatsApp message that Siren is muted by user
    if (integrationConfig.whatsappEnabled) {
      const timestampStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const textStr = `🔕 BTS SIRENE DIBUNGKAM\n\nSite ID: ${site.siteId}\nSite Name: ${site.siteName}\nPetugas: ${username || 'Admin'}\nWaktu: ${timestampStr}\nSirene shelter dimatikan manual (Mute).`;
      
      const phones = integrationConfig.whatsappPhone
        ? integrationConfig.whatsappPhone.split(/[,;\s]+/).map(p => p.trim()).filter(p => p.length > 0)
        : [];

      if (phones.length === 0) {
        phones.push('081234567890');
      }

      phones.forEach(phone => {
        whatsappNotificationLogs.unshift({
          timestamp: new Date().toISOString(),
          siteId: site.siteId,
          phoneNumber: phone,
          provider: integrationConfig.whatsappProvider.toUpperCase(),
          messageType: 'MUTED',
          messageText: textStr,
          status: 'SENT'
        });
      });
    }
  } else {
    delete mutedSirens[siteId];
    const sireneActive = site.grounding === 'PUTUS' || site.door === 'TERBUKA';
    site.sirene = sireneActive ? 'ON' : 'OFF';
    createAuditLog(username || 'Admin', 'UNMUTE SIRENE', `Siren pada ${siteId} diaktifkan kembali secara manual.`);

    // Send WhatsApp message that Siren is unmuted by user
    if (integrationConfig.whatsappEnabled) {
      const timestampStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const textStr = `🔊 BTS SIRENE DIAKTIFKAN KEMBALI\n\nSite ID: ${site.siteId}\nSite Name: ${site.siteName}\nPetugas: ${username || 'Admin'}\nWaktu: ${timestampStr}\nSirene shelter diaktifkan kembali secara manual (ON).`;
      
      const phones = integrationConfig.whatsappPhone
        ? integrationConfig.whatsappPhone.split(/[,;\s]+/).map(p => p.trim()).filter(p => p.length > 0)
        : [];

      if (phones.length === 0) {
        phones.push('081234567890');
      }

      phones.forEach(phone => {
        whatsappNotificationLogs.unshift({
          timestamp: new Date().toISOString(),
          siteId: site.siteId,
          phoneNumber: phone,
          provider: integrationConfig.whatsappProvider.toUpperCase(),
          messageType: 'UNMUTED',
          messageText: textStr,
          status: 'SENT'
        });
      });
    }
  }

  lastUpdateTs = Date.now();

  res.json({
    status: 'success',
    siteId,
    isMuted: isMuting,
    sirene: site.sirene
  });
});

// POST Test Alarm Injector (Forces alarming state on a site for easy prototyping/demonstration)
app.post('/api/test-alarm', async (req, res) => {
  const { siteId, groundingState, doorState, username } = req.body;
  const site = sites.find(s => s.siteId.toUpperCase() === siteId.toUpperCase());

  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }

  const oldGrounding = site.grounding;
  const oldDoor = site.door;

  site.grounding = groundingState || site.grounding;
  site.door = doorState || site.door;
  site.status = 'ONLINE';
  site.lastSeen = new Date().toISOString();

  // Handle alarms
  const anyAlarm = site.grounding === 'PUTUS' || site.door === 'TERBUKA';
  site.sirene = anyAlarm ? 'ON' : 'OFF';

  createAuditLog(username || 'Admin', 'TEST ALARM INJECT', `Injeksi alarm manual pada ${siteId}. Grounding: ${site.grounding}, Pintu: ${site.door}`);

  // Create real alarm entries
  if (oldGrounding === 'NORMAL' && site.grounding === 'PUTUS') {
    const logId = 'T-AL-' + Math.floor(100+Math.random()*900);
    alarmLogs.unshift({
      id: logId,
      timestamp: new Date().toISOString(),
      siteId: site.siteId,
      siteName: site.siteName,
      alarmType: 'GROUNDING_PUTUS',
      status: 'ACTIVE',
      keterangan: '[TEST] Grounding Putus dipicu manual via Dashboard.'
    });
    triggerSimulatedWhatsApp(site, 'GROUNDING_PUTUS');
  }

  if (oldDoor === 'TERTUTUP' && site.door === 'TERBUKA') {
    const logId = 'T-AL-' + Math.floor(100+Math.random()*900);
    alarmLogs.unshift({
      id: logId,
      timestamp: new Date().toISOString(),
      siteId: site.siteId,
      siteName: site.siteName,
      alarmType: 'PINTU_TERBUKA',
      status: 'ACTIVE',
      keterangan: '[TEST] Pintu Shelter Terbuka dipicu manual via Dashboard.'
    });
    triggerSimulatedWhatsApp(site, 'PINTU_TERBUKA');
  }

  // Clear alarms manually if they are reset to normal
  if (oldGrounding === 'PUTUS' && site.grounding === 'NORMAL') {
    alarmLogs = alarmLogs.map(l => {
      if (l.siteId === site.siteId && l.alarmType === 'GROUNDING_PUTUS' && l.status === 'ACTIVE') {
        return { ...l, status: 'CLOSED' as const };
      }
      return l;
    });
    triggerSimulatedWhatsApp(site, 'NORMAL');
  }

  if (oldDoor === 'TERBUKA' && site.door === 'TERTUTUP') {
    alarmLogs = alarmLogs.map(l => {
      if (l.siteId === site.siteId && l.alarmType === 'PINTU_TERBUKA' && l.status === 'ACTIVE') {
        return { ...l, status: 'CLOSED' as const };
      }
      return l;
    });
    triggerSimulatedWhatsApp(site, 'NORMAL');
  }

  // Append history
  deviceLogs.unshift({
    timestamp: new Date().toISOString(),
    siteId: site.siteId,
    siteName: site.siteName,
    grounding: site.grounding,
    door: site.door,
    sirene: site.sirene,
    gsm: site.gsm,
    rssi: site.rssi
  });

  // Synchronize simulated status and alarms to Google Sheets
  await sendToSpreadsheet({
    site_id: site.siteId,
    site_name: site.siteName,
    grounding: site.grounding,
    door: site.door,
    sirene: site.sirene,
    gsm: site.gsm,
    rssi: site.rssi,
    action: anyAlarm ? 'ACTIVE' : 'CLOSED',
    status: anyAlarm ? 'ACTIVE' : 'CLOSED',
    alarmType: site.grounding === 'PUTUS' ? 'GROUNDING_PUTUS' : (site.door === 'TERBUKA' ? 'PINTU_TERBUKA' : 'NORMAL'),
    keterangan: anyAlarm ? '[SIMULASI] Alarm terdeteksi via Dashboard.' : '[SIMULASI] Alarm dipulihkan via Dashboard.'
  });

  lastUpdateTs = Date.now();

  res.json({ status: 'success', site });
});

// POST Update Config Settings
app.post('/api/config', (req, res) => {
  const { config, username } = req.body;
  if (!config) {
    return res.status(400).json({ error: 'Config is required' });
  }

  integrationConfig = {
    ...integrationConfig,
    ...config
  };

  lastUpdateTs = Date.now();
  createAuditLog(username || 'Admin', 'CONFIG UPDATE', `Memperbarui konfigurasi sistem. WhatsApp: ${integrationConfig.whatsappEnabled ? 'AKTIF' : 'NONAKTIF'}`);
  res.json({ status: 'success', config: integrationConfig });
});

// POST Reset All Sites to normal state
app.post('/api/reset-all', async (req, res) => {
  const { username } = req.body;
  
  const promises = sites.map(async (site) => {
    site.grounding = 'NORMAL';
    site.door = 'TERTUTUP';
    site.sirene = 'OFF';
    site.status = 'ONLINE';
    site.lastSeen = new Date().toISOString();

    // Synchronize to spreadsheet
    await sendToSpreadsheet({
      site_id: site.siteId,
      site_name: site.siteName,
      grounding: 'NORMAL',
      door: 'TERTUTUP',
      sirene: 'OFF',
      gsm: site.gsm,
      rssi: site.rssi,
      action: 'CLOSED',
      status: 'CLOSED',
      alarmType: 'NORMAL',
      keterangan: 'Mereset status BTS kembali normal.'
    });
  });

  await Promise.all(promises);

  // Close all active alarms
  alarmLogs = alarmLogs.map(log => {
    if (log.status === 'ACTIVE') {
      return { ...log, status: 'CLOSED' as const };
    }
    return log;
  });

  createAuditLog(username || 'Admin', 'RESET ALL SITES', 'Mereset semua status BTS kembali normal secara massal.');
  lastUpdateTs = Date.now();
  res.json({ status: 'success', message: 'Semua site diatur ke NORMAL' });
});

// POST Clear history log
app.post('/api/clear-logs', (req, res) => {
  const { username } = req.body;
  alarmLogs = [];
  deviceLogs = [];
  createAuditLog(username || 'Admin', 'CLEAR LOGS', 'Mengosongkan seluruh riwayat dan log alarm.');
  lastUpdateTs = Date.now();
  res.json({ status: 'success', message: 'Log berhasil dikosongkan' });
});

// POST Test Send WhatsApp manually
app.post('/api/test-whatsapp', async (req, res) => {
  const { username } = req.body;
  if (!integrationConfig.whatsappEnabled) {
    return res.status(400).json({ error: 'Integrasi WhatsApp tidak diaktifkan di pengaturan.' });
  }

  const timestampStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const textStr = `🧪 UJI COBA NOTIFIKASI ALARM WA\n\nSistem: BTS MONITORING NETWORK\nStatus: SELESAI\nUji Coba berhasil dikirim dari panel pengaturan.\nWaktu: ${timestampStr}\n\nTerima kasih.`;

  const phones = integrationConfig.whatsappPhone
    ? integrationConfig.whatsappPhone.split(/[,;\s]+/).map(p => p.trim()).filter(p => p.length > 0)
    : [];

  if (phones.length === 0) {
    phones.push('081234567890');
  }

  const results: any[] = [];
  for (const phone of phones) {
    const logEntry: any = {
      timestamp: new Date().toISOString(),
      siteId: 'SYSTEM',
      phoneNumber: phone,
      provider: integrationConfig.whatsappProvider.toUpperCase(),
      messageType: 'TEST',
      messageText: textStr,
      status: 'SENT'
    };

    whatsappNotificationLogs.unshift(logEntry);

    if (integrationConfig.whatsappEnabled && integrationConfig.whatsappToken) {
      const result = await sendWhatsAppActual(phone, textStr);
      if (result.status === 'FAILED') {
        logEntry.status = 'FAILED';
        results.push({ phone, status: 'FAILED', error: result.error });
      } else {
        results.push({ phone, status: 'SENT' });
      }
    } else {
      results.push({ phone, status: 'SENT', simulated: true });
    }
  }

  createAuditLog(username || 'Admin', 'TEST WHATSAPP SEND', `Uji coba kirim WhatsApp ke ${phones.join(', ')}.`);

  res.json({
    status: 'success',
    results
  });
});

// ==========================================
// STATIC FRONTEND SERVING WITH VITE MIDDLEWARE
// ==========================================

export default app;

async function startServer() {
  if (process.env.VERCEL) {
    // Skip listener and static file serving on Vercel
    // Static files are handled natively by Vercel CDN using vercel.json rewrites
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BTS BACKEND] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
