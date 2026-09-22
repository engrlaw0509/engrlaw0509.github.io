/**
 * The site's own server.
 *
 * Serves the built static site AND handles enquiries itself, the same way the
 * other LMI projects do — Sentro sends through Resend, EA Builders posts to its
 * own API route. This site was the only one without a backend, which is why it
 * had to borrow a third-party relay to send mail at all.
 *
 * Because the form now posts to this origin, there is no CORS, no activation
 * step, and no third party between a prospect and the inbox.
 *
 *   PORT              set by Railway
 *   RESEND_API_KEY    same provider Sentro already uses
 *   ENQUIRY_TO        where enquiries land (default below)
 *   ENQUIRY_FROM      a sender on a domain verified in Resend
 *
 * With no RESEND_API_KEY the enquiry is logged instead of sent and the caller is
 * told plainly, rather than the visitor being shown a success they did not get.
 */
import { createServer } from 'node:http';
import sirv from 'sirv';

const PORT = Number(process.env.PORT) || 4321;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ENQUIRY_TO = process.env.ENQUIRY_TO || 'lmiautomatalabs@gmail.com';
const ENQUIRY_FROM = process.env.ENQUIRY_FROM || 'LMI Automata Labs <onboarding@resend.dev>';

const FIELDS = [
  ['name', 'Name'],
  ['business', 'Business'],
  ['email', 'Email'],
  ['phone', 'Phone / Viber'],
  ['sector', 'Industry'],
  ['size', 'Size'],
  ['runs_on', 'Runs on today'],
  ['needs', 'Looking for'],
  ['current_process', 'The job that takes too long'],
  ['outcome', 'What good looks like'],
];

const assets = sirv('dist', { etag: true, gzip: true, brotli: true, dev: false });

/**
 * Coarse per-IP throttle. In memory, so it resets on redeploy — enough to stop a
 * naive script, not a substitute for a real rate limiter.
 */
const recent = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

/** Railway sits behind a proxy; x-real-ip is the one that does not rotate. */
function clientIp(req) {
  return req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown';
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const str = (v) => (Array.isArray(v) ? v.filter(Boolean).join(', ') : String(v ?? '')).trim();
const esc = (v) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function render(data) {
  const rows = FIELDS
    .map(([key, label]) => [label, str(data[key])])
    .filter(([, value]) => value);

  const text = rows.map(([l, v]) => `${l}: ${v}`).join('\n');
  const html =
    '<div style="font:15px/1.6 system-ui,sans-serif;color:#0C1E33">' +
    '<h2 style="font-size:17px;margin:0 0 14px">New enquiry from lmiautomatalabs.com</h2>' +
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:640px">' +
    rows
      .map(
        ([l, v]) =>
          '<tr>' +
          `<td style="padding:8px 14px 8px 0;vertical-align:top;color:#5A7288;white-space:nowrap">${esc(l)}</td>` +
          `<td style="padding:8px 0;vertical-align:top;white-space:pre-wrap">${esc(v)}</td>` +
          '</tr>',
      )
      .join('') +
    '</table></div>';

  return { text, html };
}

async function handleEnquiry(req, res) {
  if (rateLimited(clientIp(req))) {
    return json(res, 429, { ok: false, message: 'Too many submissions. Please try again shortly.' });
  }

  let data;
  try {
    data = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { ok: false, message: 'Could not read that submission.' });
  }

  // Honeypot: people never see the field, bots fill it. Accept silently so the
  // bot does not learn it was caught.
  if (str(data._honey)) return json(res, 200, { ok: true });

  const name = str(data.name);
  const from = str(data.email);
  const process_ = str(data.current_process);
  if (!name || !from || !process_) {
    return json(res, 400, {
      ok: false,
      message: 'Please fill in your name, email, and the job that takes too long.',
    });
  }

  const { text, html } = render(data);
  const subject = `Enquiry: ${str(data.business) || name}`;

  if (!RESEND_API_KEY) {
    // No key configured. Log it so the lead is recoverable, and say so plainly
    // rather than showing a success that did not happen.
    console.log('[enquiry] RESEND_API_KEY not set — not sent:\n' + text);
    return json(res, 503, {
      ok: false,
      message: 'Our mail service is not configured yet. Please email us directly.',
    });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: ENQUIRY_FROM,
        to: [ENQUIRY_TO],
        reply_to: from,
        subject,
        text,
        html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      // Never lose the lead just because the provider refused.
      console.error(`[enquiry] resend ${r.status}: ${detail}\n${text}`);
      return json(res, 502, {
        ok: false,
        message: 'We could not send that just now. Please email us directly.',
      });
    }

    console.log(`[enquiry] sent — ${subject}`);
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error(`[enquiry] failed: ${err && err.message}\n${text}`);
    return json(res, 502, {
      ok: false,
      message: 'We could not send that just now. Please email us directly.',
    });
  }
}

createServer((req, res) => {
  const path = (req.url || '/').split('?')[0];

  if (path === '/api/enquiry') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, message: 'Method not allowed.' });
    return handleEnquiry(req, res).catch(() => {
      json(res, 500, { ok: false, message: 'Something went wrong.' });
    });
  }

  if (path === '/api/health') {
    return json(res, 200, { ok: true, mail: RESEND_API_KEY ? 'configured' : 'not configured' });
  }

  assets(req, res, () => {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`serving dist/ on :${PORT} — mail ${RESEND_API_KEY ? 'configured' : 'NOT configured'}`);
});
