/**
 * Google Apps Script Web App for Youth of Ummah Community Survey
 * Spreadsheet ID: 10eZNThH_XgvGglH67HU90uPT7pHbhv-yZ6N2ql5hIm8
 *
 * Setup:
 * 1. Open the spreadsheet:
 *    https://docs.google.com/spreadsheets/d/10eZNThH_XgvGglH67HU90uPT7pHbhv-yZ6N2ql5hIm8/edit
 * 2. Go to Extensions -> Apps Script.
 * 3. Replace the default code with this file's contents and save.
 * 4. Click Deploy -> New deployment -> Select type: Web app.
 * 5. Set "Execute as": Me, and "Who has access": Anyone.
 * 6. Click Deploy, authorize, and copy the Web App URL (/exec).
 * 7. Paste that URL into GOOGLE_SHEETS_WEBAPP_URL in script.js.
 */

const SHEET_NAME = 'Responses';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', sheet: SHEET_NAME }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);
    const answers = data.answers || {};
    const otherDetails = data.otherDetails || {};

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    const formatVal = (val) => {
      if (Array.isArray(val)) return val.join(', ');
      if (val === undefined || val === null) return '';
      return String(val);
    };

    const otherEntries = Object.entries(otherDetails)
      .filter(([, v]) => typeof v === 'string' && v.trim() !== '')
      .map(([k, v]) => `${k}: ${v.trim()}`)
      .join(' | ');

    const row = [
      data.submittedAt || new Date().toISOString(),
      formatVal(answers.age_range),
      formatVal(answers.gender),
      formatVal(answers.ethnicity),
      formatVal(answers.city),
      formatVal(answers.household_type),
      formatVal(answers.has_children),
      formatVal(answers.children_ages),
      formatVal(answers.attended_past_year),
      formatVal(answers.attended_program_types),
      formatVal(answers.satisfaction_rating),
      formatVal(answers.stopped_attending_reasons),
      formatVal(answers.biggest_challenges),
      formatVal(answers.unspoken_issues),
      formatVal(answers.support_comfort),
      formatVal(answers.desired_programs),
      formatVal(answers.youth_topics),
      formatVal(answers.adult_topics),
      formatVal(answers.best_times),
      formatVal(answers.preferred_format),
      formatVal(answers.travel_distance),
      formatVal(answers.one_wish),
      formatVal(answers.volunteer_interest),
      formatVal(answers.volunteer_areas),
      formatVal(answers.email),
      otherEntries
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
