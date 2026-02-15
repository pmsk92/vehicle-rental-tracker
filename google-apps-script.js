/**
 * Car Rental Tracker - Google Apps Script
 * Paste this into Extensions → Apps Script (Code.gs), then Deploy as Web app.
 * Used by the driver form and admin dashboard to read/write trips and maintenance.
 */

const TRIPS_SHEET_NAME = 'Trips';
const MAINTENANCE_SHEET_NAME = 'Maintenance';

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  let result;
  if (action === 'trips') {
    result = getTrips();
  } else if (action === 'maintenance') {
    result = getMaintenance();
  } else {
    result = { error: 'Use ?action=trips or ?action=maintenance' };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result = { ok: false };
  try {
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    if (body.type === 'trip' && body.data) {
      appendTrip(body.data);
      result = { ok: true };
    } else if (body.type === 'maintenance' && body.data) {
      appendMaintenance(body.data);
      result = { ok: true };
    } else {
      result = { error: 'Expected { type: "trip"|"maintenance", data: {...} }' };
    }
  } catch (err) {
    result = { error: String(err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function getTrips() {
  const sheet = getSheet(TRIPS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) {
      obj[h] = row[i] != null ? row[i] : '';
    });
    return obj;
  });
}

function getMaintenance() {
  const sheet = getSheet(MAINTENANCE_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) {
      obj[h] = row[i] != null ? row[i] : '';
    });
    return obj;
  });
}

function ensureTripHeaders(sheet) {
  if (sheet.getLastRow() >= 1) return;
  const headers = [
    'id', 'date', 'driverName', 'tripName', 'startKms', 'endKms', 'totalKms', 'mileage',
    'startDate', 'endDate', 'notes', 'creditedTo', 'rentalFee', 'fuelExpense', 'tripExpense',
    'companyRevenue', 'driverBata', 'totalExpenses', 'profit'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function ensureMaintenanceHeaders(sheet) {
  if (sheet.getLastRow() >= 1) return;
  const headers = ['id', 'date', 'stakeholder', 'description', 'cost'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function appendTrip(trip) {
  if (!trip.id) {
    trip.id = Date.now() + '-' + Math.random().toString(36).slice(2);
  }
  const sheet = getSheet(TRIPS_SHEET_NAME);
  ensureTripHeaders(sheet);
  const headers = ['id', 'date', 'driverName', 'tripName', 'startKms', 'endKms', 'totalKms', 'mileage',
    'startDate', 'endDate', 'notes', 'creditedTo', 'rentalFee', 'fuelExpense', 'tripExpense',
    'companyRevenue', 'driverBata', 'totalExpenses', 'profit'];
  const row = headers.map(function (k) {
    var v = trip[k];
    return v != null ? v : '';
  });
  sheet.appendRow(row);
}

function appendMaintenance(maint) {
  if (!maint.id) {
    maint.id = Date.now() + '-' + Math.random().toString(36).slice(2);
  }
  const sheet = getSheet(MAINTENANCE_SHEET_NAME);
  ensureMaintenanceHeaders(sheet);
  const headers = ['id', 'date', 'stakeholder', 'description', 'cost'];
  const row = headers.map(function (k) {
    var v = maint[k];
    return v != null ? v : '';
  });
  sheet.appendRow(row);
}
