/**
 * ============================================================================
 * PERINGATAN PENTING / CRITICAL WARNING:
 * ============================================================================
 * ⚠️ JANGAN SALIN SELURUH FILE INI KE GOOGLE APPS SCRIPT (Kode.gs)!
 * File ini adalah file kode sumber React/TypeScript untuk aplikasi dashboard.
 * Jika Anda menyalin seluruh file ini, Anda akan menemui error:
 * "SyntaxError: Unexpected token 'export' baris: 6" karena Google Apps Script
 * tidak mendukung modul 'export' dari TypeScript.
 * 
 * 👉 CARA MENYALIN KODE YANG BENAR:
 * 1. Jalankan aplikasi ini, masuk ke menu "Settings" (ikon Gerigi) di sebelah kiri.
 * 2. Pilih sub-tab "Skrip Google Apps Script (GAS)".
 * 3. Klik tombol "Salin Kode GAS" — tombol ini akan menyalin kode bersihnya saja.
 * 4. Paste ke editor Google Apps Script Anda (Kode.gs) dan simpan.
 * ============================================================================
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT - BTS MONITORING BACKEND
 * 
 * Instructions:
 * 1. Open your target Google Spreadsheet.
 * 2. Click Extensions -> Apps Script.
 * 3. Delete existing code and paste this script.
 * 4. Update the SPREADSHEET_ID variable below.
 * 5. Update the DASHBOARD_URL to your deployed dashboard link.
 * 6. Click Deploy -> New Deployment -> Web App.
 *    - Execute as: Me (your email)
 *    - Who has access: Anyone (required for ESP32/sim800l to POST data without OAuth login)
 * 7. Copy the Web App URL and paste it into the ESP32 code and Dashboard Settings.
 */

var SPREADSHEET_ID = "1aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890"; // Ganti dengan ID Spreadsheet Anda
var DASHBOARD_URL = "https://your-dashboard-url.co/api/esp32"; // Endpoint sinkronisasi dashboard

function doPost(e) {
  try {
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // --- 0. HANDLER UNTUK CRUD TOWER DATA (DARI DASHBOARD) ---
    if (data.action === "CRUD_SITE") {
      var sheetSite = ss.getSheetByName("SITE");
      if (!sheetSite) {
        sheetSite = ss.insertSheet("SITE");
        sheetSite.appendRow(["SiteID", "SiteName", "Lokasi", "Latitude", "Longitude"]);
      }
      
      var sId = data.site.siteId;
      var sName = data.site.siteName;
      var sLoc = data.site.location;
      var sLat = Number(data.site.latitude) || 0;
      var sLng = Number(data.site.longitude) || 0;
      
      var rows = sheetSite.getDataRange().getValues();
      var foundIndex = -1;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0].toString().toUpperCase() === sId.toUpperCase()) {
          foundIndex = i + 1; // 1-indexed for Sheet row
          break;
        }
      }
      
      if (data.method === "DELETE") {
        if (foundIndex !== -1) {
          sheetSite.deleteRow(foundIndex);
        }
      } else if (data.method === "POST" || data.method === "PUT") {
        if (foundIndex === -1) {
          sheetSite.appendRow([sId, sName, sLoc, sLat, sLng]);
        } else {
          sheetSite.getRange(foundIndex, 1, 1, 5).setValues([[sId, sName, sLoc, sLat, sLng]]);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "SITE spreadsheet updated successfully"
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }
    
    var siteId = data.site_id || data.siteId || "BTS-001";
    var grounding = data.grounding || "NORMAL";
    var door = data.door || "TERTUTUP";
    var sirene = data.sirene || "OFF";
    var gsm = data.gsm || "4G";
    var rssi = Number(data.rssi) || -75;
    
    // --- 1. SINKRONISASI SHEET: DEVICE_STATUS ---
    var sheetDevice = ss.getSheetByName("DEVICE_STATUS");
    if (!sheetDevice) {
      sheetDevice = ss.insertSheet("DEVICE_STATUS");
      sheetDevice.appendRow(["Timestamp", "SiteID", "Grounding", "Door", "Sirene", "GSM", "RSSI"]);
    }
    var timestampStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    sheetDevice.appendRow([timestampStr, siteId, grounding, door, sirene, gsm, rssi]);
    
    // Ambil detail Site Name dari sheet SITE
    var siteName = "BTS " + siteId;
    var location = "Sumberjaya, Indonesia";
    var sheetSite = ss.getSheetByName("SITE");
    if (sheetSite) {
      var siteRows = sheetSite.getDataRange().getValues();
      for (var i = 1; i < siteRows.length; i++) {
        if (siteRows[i][0].toString().toUpperCase() === siteId.toUpperCase()) {
          siteName = siteRows[i][1];
          location = siteRows[i][2];
          break;
        }
      }
    } else {
      // Jika sheet SITE belum ada, buatkan template default
      var newSheetSite = ss.insertSheet("SITE");
      newSheetSite.appendRow(["SiteID", "SiteName", "Lokasi", "Latitude", "Longitude"]);
      newSheetSite.appendRow([siteId, "BTS SUMBERJAYA", "Sumberjaya, Indonesia", -6.914744, 107.609810]);
    }
    
    // --- 2. LOG ALARM DAN RIWAYAT KE SHEET: ALARM_LOG ---
    var sheetAlarm = ss.getSheetByName("ALARM_LOG");
    if (!sheetAlarm) {
      sheetAlarm = ss.insertSheet("ALARM_LOG");
      sheetAlarm.appendRow(["Timestamp", "SiteID", "AlarmType", "Status", "Keterangan"]);
    }
    
    // Deteksi jika terjadi alarm baru
    var isAlarmActive = (grounding === "PUTUS" || door === "TERBUKA");
    if (isAlarmActive) {
      var alarmType = grounding === "PUTUS" ? "GROUNDING_PUTUS" : "PINTU_TERBUKA";
      var keterangan = data.keterangan || (grounding === "PUTUS" 
        ? "Kabel ground terputus / hambatan tinggi." 
        : "Pintu shelter BTS terbuka tanpa autorisasi.");
        
      sheetAlarm.appendRow([timestampStr, siteId, alarmType, "ACTIVE", keterangan]);
    } else if (data.action === "CLOSED" || data.status === "CLOSED" || data.status === "NORMAL") {
      sheetAlarm.appendRow([timestampStr, siteId, data.alarmType || "ALARM", "CLOSED", data.keterangan || "Alarm selesai / dipulihkan."]);
    }
    
    // --- 3. FORWARD DATA KE SERVER MONITORING UTAMA (Mencegah Loop dengan source: 'server_simulation') ---
    var dashboardResponseText = "Not Synchronized";
    if (data.source !== "server_simulation" && data.skipForward !== true) {
      try {
        var options = {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify({
            site_id: siteId,
            site_name: siteName,
            location: location,
            grounding: grounding,
            door: door,
            sirene: sirene,
            gsm: gsm,
            rssi: rssi
          }),
          muteHttpExceptions: true
        };
        var response = UrlFetchApp.fetch(DASHBOARD_URL, options);
        dashboardResponseText = response.getContentText();
      } catch (e) {
        dashboardResponseText = "Sync failed: " + e.toString();
      }
    } else {
      dashboardResponseText = "Sync skipped (internal simulation)";
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Spreadsheet logged successfully",
      sync_response: dashboardResponseText
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "GAS Error: " + err.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const ESP32_HARDWARE_CODE = `/**
 * ESP32 & SIM800L - BTS MONITORING AND ALARM CRITICAL SYSTEM
 * 
 * Menangani pendeteksian grounding putus (GPIO18) dan pintu shelter
 * terbuka (GPIO19) secara interrupt/polling, mengontrol sirine lokal via relay (GPIO23),
 * serta mengirim notifikasi realtime via SIM800L GPRS ke Web App Google Apps Script.
 */

#include <HardwareSerial.h>

// PIN CONFIGURASI ESP32
#define PIN_GROUNDING_SWITCH 18 // GPIO18 - Switch Grounding (Normal: LOW, Putus: HIGH)
#define PIN_DOOR_SWITCH      19 // GPIO19 - Switch Pintu (Tertutup: LOW, Terbuka: HIGH)
#define PIN_RELAY_SIRENE     23 // GPIO23 - Output Relay Sirene (HIGH: ON, LOW: OFF)
#define PIN_MUTE_BUTTON      22 // GPIO22 - Tombol Mute Sirene Lokal (Active LOW)

// PIN SERIAL SIM800L (HardwareSerial 2)
#define SIM_TX               16 // RX SIM800L tersambung ke TX ESP32 (GPIO16)
#define SIM_RX               17 // TX SIM800L tersambung ke RX ESP32 (GPIO17)

HardwareSerial simSerial(2);

// SINKRONISASI IDENTITY
const String SITE_ID = "BTS-001";
const String APN     = "internet"; // Sesuaikan dengan provider seluler Anda (e.g. internet, telkomsel, tri, indosatgprs)
const String GAS_URL = "URL_DEPLOYMENT_WEB_APPS_GAS_ANDA"; // Ganti dengan URL Google Apps Script Anda

// Watchdog dan Mute Timer State
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 45000; // Kirim detak berkala (Keep-Alive) setiap 45 detik
bool isMutedLocally = false;
unsigned long muteStartTime = 0;
const unsigned long muteDurationMs = 300000; // Diamkan alarm selama 5 Menit (300.000 ms)

void setup() {
  Serial.begin(115200);
  simSerial.begin(9600, SERIAL_8N1, SIM_RX, SIM_TX);
  
  pinMode(PIN_GROUNDING_SWITCH, INPUT_PULLDOWN);
  pinMode(PIN_DOOR_SWITCH, INPUT_PULLDOWN);
  pinMode(PIN_RELAY_SIRENE, OUTPUT);
  pinMode(PIN_MUTE_BUTTON, INPUT_PULLUP);
  
  digitalWrite(PIN_RELAY_SIRENE, LOW); // Matikan sirine di awal
  
  Serial.println("=========================================");
  Serial.println("  ESP32 BTS SECURITY SYSTEM INITIALIZED    ");
  Serial.println("=========================================");
  
  delay(3000); // Tunggu modem menyala sempurna
  initSIM800L();
}

void loop() {
  // Hubungkan pembacaan sensor
  bool isGroundingPutus = (digitalRead(PIN_GROUNDING_SWITCH) == HIGH);
  bool isDoorTerbuka    = (digitalRead(PIN_DOOR_SWITCH) == HIGH);
  bool isMutePressed     = (digitalRead(PIN_MUTE_BUTTON) == LOW);
  
  // Logika Mute Alarm Lokal (Tombol Mute ditekan fisik di shelter)
  if (isMutePressed && !isMutedLocally) {
    isMutedLocally = true;
    muteStartTime = millis();
    digitalWrite(PIN_RELAY_SIRENE, LOW); // Segera matikan sirene
    Serial.println("[ALERT] Tombol Mute Shelter ditekan! Sirene diam selama 5 menit.");
    delay(500); // Anti debouncing
  }
  
  // Timer Mute Alarm kadaluarsa
  if (isMutedLocally && (millis() - muteStartTime >= muteDurationMs)) {
    isMutedLocally = false;
    Serial.println("[ALERT] Timer Mute habis. Sirene kembali siaga penuh.");
  }
  
  // Logika Kelistrikan Sirene
  bool hazardActive = isGroundingPutus || isDoorTerbuka;
  
  if (hazardActive) {
    if (!isMutedLocally) {
      digitalWrite(PIN_RELAY_SIRENE, HIGH); // Nyalakan sirene
    } else {
      digitalWrite(PIN_RELAY_SIRENE, LOW);  // Tetap diam jika ter-mute
    }
  } else {
    // Keadaan normal, hilangkan mute state
    digitalWrite(PIN_RELAY_SIRENE, LOW);
    isMutedLocally = false;
  }
  
  // Kirim data berkala atau kirim instantly jika kondisi sensor berubah (Trigerred sending)
  static bool lastGroundingState = false;
  static bool lastDoorState = false;
  
  bool stateChanged = (isGroundingPutus != lastGroundingState) || (isDoorTerbuka != lastDoorState);
  
  if (stateChanged || (millis() - lastSendTime >= sendInterval)) {
    lastGroundingState = isGroundingPutus;
    lastDoorState = isDoorTerbuka;
    lastSendTime = millis();
    
    Serial.println("[DATA] Memancarkan paket telemetry ke Server...");
    sendSecureTelemetry(isGroundingPutus, isDoorTerbuka, hazardActive && !isMutedLocally);
  }
  
  delay(200); // Polling delay
}

void initSIM800L() {
  Serial.println("[MODEM] Mengonfigurasi modul GSM SIM800L...");
  
  simSerial.println("AT");
  checkModemResponse(1000);
  
  simSerial.println("AT+CFUN=1"); // Full functionality
  checkModemResponse(2000);
  
  simSerial.println("AT+CPIN?"); // Cek SIM Card
  checkModemResponse(1000);
  
  simSerial.println("AT+CREG?"); // Cek registrasi jaringan
  checkModemResponse(1000);
  
  simSerial.println("AT+SAPBR=3,1,\\"CONTYPE\\",\\"GPRS\\"");
  checkModemResponse(1000);
  
  simSerial.println("AT+SAPBR=3,1,\\"APN\\",\\"" + APN + "\\"");
  checkModemResponse(1000);
  
  simSerial.println("AT+SAPBR=1,1"); // Aktifkan bearer GPRS
  checkModemResponse(3000);
}

void sendSecureTelemetry(bool groundBroken, bool doorOpen, bool isSirenBlaring) {
  String groundingParam = groundBroken ? "PUTUS" : "NORMAL";
  String doorParam      = doorOpen ? "TERBUKA" : "TERTUTUP";
  String sirenParam     = isSirenBlaring ? "ON" : "OFF";
  
  // Format Payload JSON
  String payload = "{\\"site_id\\":\\"" + SITE_ID + 
                   "\\",\\"grounding\\":\\"" + groundingParam + 
                   "\\",\\"door\\":\\"" + doorParam + 
                   "\\",\\"sirene\\":\\"" + sirenParam + 
                   "\\",\\"gsm\\":\\"2G\\",\\"rssi\\":\\"-71\\"}";
  
  simSerial.println("AT+HTTPINIT");
  checkModemResponse(1000);
  
  simSerial.println("AT+HTTPPARA=\\"CID\\",1");
  checkModemResponse(1000);
  
  simSerial.println("AT+HTTPPARA=\\"URL\\",\\"" + GAS_URL + "\\"");
  checkModemResponse(1000);
  
  simSerial.println("AT+HTTPPARA=\\"CONTENT\\",\\"application/json\\"");
  checkModemResponse(1000);
  
  simSerial.println("AT+HTTPDATA=" + String(payload.length()) + ",10000");
  checkModemResponse(1000);
  
  simSerial.print(payload);
  delay(1000);
  
  simSerial.println("AT+HTTPACTION=1"); // POST 1
  checkModemResponse(5000);
  
  simSerial.println("AT+HTTPREAD"); // Ambil respon balik (jika server mengirim balik mute command)
  checkModemResponse(2000);
  
  simSerial.println("AT+HTTPTERM");
  checkModemResponse(1000);
}

void checkModemResponse(int timeoutMs) {
  unsigned long start = millis();
  while (millis() - start < timeoutMs) {
    while (simSerial.available()) {
      char c = simSerial.read();
      Serial.print(c);
    }
  }
}
`;
