/**
 * Enquiry endpoint for lmiautomatalabs.com — Google Apps Script web app.
 *
 * Receives the form on /contact/, appends a row to a Sheet you own, and emails
 * you a notification. No third-party form service, no subscription, and the
 * data never leaves your Google account.
 *
 * ── DEPLOY ────────────────────────────────────────────────────────────────
 * 1. Create a Google Sheet. Copy its id from the URL:
 *       docs.google.com/spreadsheets/d/<THIS PART>/edit
 * 2. script.google.com → New project → paste this file → set SHEET_ID below.
 * 3. Deploy → New deployment → type "Web app"
 *       Execute as:        Me
 *       Who has access:    Anyone            <- must be "Anyone", not "Anyone with a Google account"
 * 4. Copy the /exec URL and paste it into ENQUIRY_ENDPOINT in
 *    src/pages/contact.astro, then rebuild.
 *
 * Re-deploying after an edit: Deploy → Manage deployments → edit the existing
 * one and pick "New version". Creating a *new* deployment gives a new URL and
 * the site would keep posting to the old one.
 */

const SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';
const SHEET_NAME = 'Enquiries';
const NOTIFY_TO = 'lmiautomatalabs@gmail.com';

const FIELDS = [
  'name',
  'business',
  'email',
  'phone',
  'sector',
  'size',
  'runs_on',
  'current_process',
  'needs',
  'outcome',
];

/** Health check, so you can confirm the deployment is live in a browser. */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'lmi-enquiries' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Two shapes arrive here. The site's script posts JSON as text/plain (a
  // "simple" request, so the browser skips the CORS preflight that Apps Script
  // cannot answer). With JavaScript off the browser posts the form natively as
  // form-encoded and navigates, so that path gets HTML back instead of JSON.
  var isJson = false;
  var data = {};

  try {
    if (e.postData && e.postData.contents && e.postData.type.indexOf('json') === -1 &&
        e.postData.contents.charAt(0) === '{') {
      data = JSON.parse(e.postData.contents);
      isJson = true;
    } else if (e.postData && e.postData.type.indexOf('json') !== -1) {
      data = JSON.parse(e.postData.contents);
      isJson = true;
    } else {
      // Native form post: e.parameters holds arrays, which is what we want for
      // the checkbox groups.
      var p = e.parameters || {};
      Object.keys(p).forEach(function (k) {
        data[k] = p[k].length > 1 ? p[k] : p[k][0];
      });
    }
  } catch (err) {
    return reply(isJson, false, 'Could not read the submission.');
  }

  // Honeypot: people never see this field, bots fill it. Accept silently so the
  // bot does not learn it was rejected.
  if (data.botcheck) return reply(isJson, true, 'Thanks.');

  if (!data.name || !data.email || !data.current_process) {
    return reply(isJson, false, 'Please fill in your name, email, and the job that takes too long.');
  }

  var flat = {};
  FIELDS.forEach(function (f) {
    var v = data[f];
    flat[f] = Array.isArray(v) ? v.join(', ') : (v || '');
  });

  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME) ||
                SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Received'].concat(FIELDS));
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date()].concat(FIELDS.map(function (f) { return flat[f]; })));
  } catch (err) {
    return reply(isJson, false, 'Could not save the enquiry.');
  }

  try {
    MailApp.sendEmail({
      to: NOTIFY_TO,
      replyTo: flat.email,
      subject: 'Enquiry: ' + (flat.business || flat.name),
      body: [
        flat.name + (flat.business ? ' — ' + flat.business : ''),
        flat.email + (flat.phone ? ' · ' + flat.phone : ''),
        (flat.sector || '—') + ' · ' + (flat.size || '—'),
        '',
        'Runs on today: ' + (flat.runs_on || '—'),
        'Looking for:   ' + (flat.needs || '—'),
        '',
        'The job that takes too long:',
        flat.current_process,
        '',
        'What good would look like:',
        flat.outcome || '—',
      ].join('\n'),
    });
  } catch (err) {
    // The row is already saved, so a mail failure must not fail the submission.
  }

  return reply(isJson, true, 'Thanks — we will come back to you.');
}

function reply(isJson, ok, message) {
  if (isJson) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: ok, message: message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  // Plain page for the no-JavaScript path, which navigates here.
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + (ok ? 'Thank you' : 'Something went wrong') + '</title>' +
    '<style>body{font:16px/1.6 system-ui,sans-serif;margin:0;min-height:100vh;display:grid;' +
    'place-items:center;background:#fff;color:#0C1E33;padding:2rem;text-align:center}' +
    'h1{font-size:1.6rem;margin:0 0 .5rem}a{color:#145C94}</style>' +
    '<div><h1>' + (ok ? 'Thank you' : 'Something went wrong') + '</h1>' +
    '<p>' + message + '</p>' +
    '<p><a href="https://www.lmiautomatalabs.com/">Back to LMI Automata Labs</a></p></div>',
  );
}
