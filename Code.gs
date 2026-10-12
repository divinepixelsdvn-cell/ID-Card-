const FOLDER_ID = '1TMKqWy8VJHPfgvMPKxSlop32gIkNyCJJ';
const HEAD = ['ID','Timestamp','Full Name','Photography ID','Studio Name','Phone','Email','Blood Group','House No','Street','Village','Photo File ID'];
// మీ Google Sheet ID ఇక్కడ పెట్టండి (Sheet లింక్ లో /d/ మరియు /edit మధ్య ఉన్న భాగం). ఖాళీగా ఉంటే ఆటోమేటిక్.
const SHEET_ID = '';
const KEYS = ['id','ts','name','pid','studio','phone','email','blood','house','street','village','photo'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('MAA Union - ID Card Registration')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Sheet కి కనెక్ట్ అయి ఉంటే అదే వాడుతుంది, లేకపోతే "MAA Members" అనే కొత్త Sheet ఆటోమేటిక్‌గా తయారుచేస్తుంది
function ss_() {
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  const pr = PropertiesService.getScriptProperties();
  const id = pr.getProperty('SSID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  ss = SpreadsheetApp.create('MAA Members');
  pr.setProperty('SSID', ss.getId());
  return ss;
}

function sheet_() {
  const ss = ss_();
  let s = ss.getSheetByName('Members');
  if (!s) {
    s = ss.insertSheet('Members');
    s.appendRow(HEAD);
    s.setFrozenRows(1);
    s.getRange('A:L').setNumberFormat('@');
  }
  return s;
}

function list() {
  const v = sheet_().getDataRange().getValues();
  v.shift();
  return v.map(r => { const o = {}; KEYS.forEach((k, i) => o[k] = String(r[i])); return o; });
}

function photo_(p, d) {
  const nm = (d.name + '_' + d.pid).replace(/[^\w\u0C00-\u0C7F]+/g, '_') + '.jpg';
  const f = DriveApp.getFolderById(FOLDER_ID).createFile(Utilities.newBlob(Utilities.base64Decode(p), 'image/jpeg', nm));
  try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  return f.getId();
}

function save(d, p) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const s = sheet_();
    const rows = s.getDataRange().getValues();
    const idx = d.id ? rows.findIndex((r, i) => i > 0 && String(r[0]) === d.id) : -1;
    let fid = idx > 0 ? String(rows[idx][11]) : '';
    let warn = '';
    if (p) {
      try {
        const nf = photo_(p, d);
        if (fid) { try { DriveApp.getFileById(fid).setTrashed(true); } catch (e) {} }
        fid = nf;
      } catch (e) {
        warn = 'ఫోటో Drive ఫోల్డర్‌లో సేవ్ కాలేదు (' + e.message + ')';
      }
    }
    const row = [
      idx > 0 ? d.id : Utilities.getUuid().slice(0, 8),
      idx > 0 ? rows[idx][1] : Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MM-yyyy HH:mm'),
      d.name, d.pid, d.studio, d.phone, d.email, d.blood, d.house, d.street, d.village, fid
    ];
    if (idx > 0) s.getRange(idx + 1, 1, 1, 12).setValues([row]);
    else s.appendRow(row);
    return { ok: true, warn: warn };
  } catch (e) {
    return { ok: false, error: e.message };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function getPhoto(id) {
  return Utilities.base64Encode(DriveApp.getFileById(id).getBlob().getBytes());
}

function getExcel() {
  const r = UrlFetchApp.fetch('https://docs.google.com/spreadsheets/d/' + ss_().getId() + '/export?format=xlsx',
    { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } });
  return Utilities.base64Encode(r.getContent());
}

// Editor లో ఒకసారి Run చేయండి: అనుమతులు ఇవ్వడానికి + టెస్ట్ చేయడానికి
function testSetup() {
  sheet_();
  Logger.log('Sheet OK: ' + ss_().getUrl());
  const f = DriveApp.getFolderById(FOLDER_ID);
  f.createFile('test.txt', 'ok').setTrashed(true);
  UrlFetchApp.fetch('https://www.google.com');
  Logger.log('Drive ఫోల్డర్ OK: ' + f.getName());
}

function info() { return ss_().getUrl(); }
