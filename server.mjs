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
 *
 * It also answers GET /api/status: a health check of each live product, cached
 * for a minute, which the pages use to upgrade "In production" to "Live now".
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
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

/**
 * Everything under /_astro/ has a content hash in its name, so it can be cached
 * for a year and never revalidated. Pages cannot: an HTML file keeps its name
 * across deploys, so it must be revalidated (cheaply — the ETag makes an
 * unchanged page a 304).
 */
const assets = sirv('dist', {
  etag: true,
  gzip: true,
  brotli: true,
  dev: false,
  setHeaders(res, pathname) {
    res.setHeader(
      'Cache-Control',
      pathname.startsWith('/_astro/')
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=0, must-revalidate',
    );
  },
});

/** The branded page Astro builds from src/pages/404.astro, read once. */
const NOT_FOUND = existsSync('dist/404.html') ? readFileSync('dist/404.html') : null;

/** Sent with every response. Nothing here needs to be framed or sniffed. */
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

/**
 * Live products and the public health endpoint each already exposes. Keys are
 * project ids — the folder names under src/content/projects/ — so the page
 * knows which status pill a result belongs to.
 *
 * Both endpoints check their database, not just that the process is up.
 * Add a project here to give its pill a live check; leave one out and it simply
 * keeps its build-time "In production".
 */
const PROBES = {
  sentro: 'https://app.mysentroapp.com/api/health',
  'croma-mnl': 'https://api.cromamnl.com/health',
};
const STATUS_TTL_MS = 60_000;
const PROBE_TIMEOUT_MS = 5_000;

async function probe(url) {
  try {
    const r = await fetch(url, {
      headers: { 'user-agent': 'lmiautomatalabs-status/1', accept: 'application/json' },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    let body = null;
    try { body = await r.json(); } catch { /* not JSON; the status code decides */ }
    // A 200 that says it is unwell is unwell.
    const saysDown = body && (body.ok === false || body.status === 'error' || body.db === 'down');
    return r.ok && !saysDown;
  } catch {
    return false;
  }
}

let statusCache = { at: 0, body: null };
let statusInFlight = null;

/** One probe round per minute however many visitors ask. */
function getStatus() {
  if (statusCache.body && Date.now() - statusCache.at < STATUS_TTL_MS) {
    return Promise.resolve(statusCache.body);
  }
  if (!statusInFlight) {
    statusInFlight = Promise.all(
      Object.entries(PROBES).map(async ([id, url]) => [id, { ok: await probe(url) }]),
    )
      .then((entries) => {
        const body = { checkedAt: new Date().toISOString(), products: Object.fromEntries(entries) };
        statusCache = { at: Date.now(), body };
        return body;
      })
      .finally(() => { statusInFlight = null; });
  }
  return statusInFlight;
}

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
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);

  if (path === '/api/status') {
    if (req.method !== 'GET') return json(res, 405, { ok: false, message: 'Method not allowed.' });
    return getStatus()
      .then((body) => json(res, 200, body))
      .catch(() => json(res, 503, { ok: false }));
  }

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
    if (NOT_FOUND) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(NOT_FOUND);
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`serving dist/ on :${PORT} — mail ${RESEND_API_KEY ? 'configured' : 'NOT configured'}`);
});
