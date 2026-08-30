/**
 * Capture product screenshots straight into the project content folders.
 *
 *   node scripts/capture.mjs sentro
 *   node scripts/capture.mjs ea-builders
 *   node scripts/capture.mjs            # every app whose dev server is running
 *
 * Drives the Chrome already installed on this machine (no browser download).
 * Override with CHROME_PATH=... if yours lives somewhere else.
 *
 * Each app's dev server must already be running on the port below — this script
 * does not start them. Shots render at 2x and are downscaled to WIDTH, which is
 * sharper than rendering at 1x and keeps the files small enough for git.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const CHROME =
  process.env.CHROME_PATH ??
  'C:/Program Files/Google/Chrome/Application/chrome.exe';

/** Final image width in px. 2x an ~830px display slot, with room to spare. */
const WIDTH = 1800;
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };

const APPS = {
  sentro: {
    base: 'http://localhost:3210',
    out: 'src/content/projects/sentro',
    /** Dev-seed credentials, published in that repo's README. Local only. */
    login: {
      path: '/login',
      fields: [
        { selector: 'input[type="email"], input[name="email"]', value: 'admin@northstar.ph' },
        { selector: 'input[type="password"], input[name="password"]', value: 'advisor-dev-2026' },
      ],
    },
    // Deliberately no /policies shot: the seeded product names are real
    // insurer trademarks, and publishing them would imply a partnership.
    shots: [
      { file: 'cover.png', path: '/dashboard', wait: 2500 },
      { file: '01-contacts.png', path: '/contacts', wait: 2000 },
      { file: '02-analytics.png', path: '/analytics', wait: 2500 },
      { file: '03-calendar.png', path: '/calendar', wait: 2000 },
    ],
  },

  // Only the public site can be captured here. The POS itself is an Apps Script
  // web app behind a Google login, so its screens have to come from a signed-in
  // session — see the note in the README.
  'croma-mnl': {
    base: 'http://localhost:4500',
    out: 'src/content/projects/croma-mnl',
    shots: [{ file: 'cover.png', path: '/', wait: 2500 }],
  },

  // Start this one's dev server with PORTAL_API_URL and PORTAL_API_SECRET blank:
  //
  //   PORTAL_API_URL= PORTAL_API_SECRET= npm run dev
  //
  // That makes getPortal() fall through to its in-memory mock adapter, whose
  // people are all named "Demo Something". Never capture this app against the
  // real backend — it holds actual employee and payroll records.
  'ea-builders': {
    base: 'http://localhost:3000',
    out: 'src/content/projects/ea-builders',
    login: {
      path: '/admin',
      fields: [{ selector: 'input[name=\"code\"]', value: '1234' }],
    },
    shots: [{ file: '03-admin.png', path: '/admin', wait: 2500 }],
  },

  // The client-facing half, which the fixture actually populates: milestones,
  // site photos, documents and a payment schedule. Same dev server as above,
  // but it signs in with the project's own access code rather than a staff one.
  'ea-builders-portal': {
    base: 'http://localhost:3000',
    out: 'src/content/projects/ea-builders',
    login: {
      path: '/portal/lakeview-2f9a4c',
      fields: [{ selector: 'input[name=\"code\"]', value: '481902' }],
    },
    shots: [
      { file: 'cover.png', path: '/portal/lakeview-2f9a4c', wait: 2500 },
      { file: '01-timeline.png', path: '/portal/lakeview-2f9a4c/timeline', wait: 2500 },
      { file: '02-payments.png', path: '/portal/lakeview-2f9a4c/payments', wait: 2500 },
    ],
  },
  // Ready to go, but needs a database first. Kaha's API requires a real
  // Postgres (DATABASE_URL) — there is no embedded or mock mode. Once you have
  // one running, from the kaha repo:
  //
  //   pnpm db:bootstrap && pnpm migrate && pnpm seed
  //   pnpm --filter @kaha/pos dev
  //
  // then uncomment the shots below and run: node scripts/capture.mjs kaha
  kaha: {
    base: 'http://localhost:5173',
    out: 'src/content/projects/kaha',
    shots: [
      // { file: 'cover.png', path: '/', wait: 2500 },
    ],
  },
};

async function reachable(base) {
  try {
    const res = await fetch(base, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function capture(name, app, browser) {
  if (!(await reachable(app.base))) {
    console.log(`  ${name}: nothing serving at ${app.base} — skipped`);
    return 0;
  }

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  let taken = 0;

  try {
    if (app.login) {
      await page.goto(app.base + app.login.path, { waitUntil: 'networkidle2', timeout: 60_000 });
      // Set each field through the native setter so React sees the change.
      await page.evaluate((fields) => {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value',
        ).set;
        for (const f of fields) {
          const el = document.querySelector(f.selector);
          if (!el) continue;
          setter.call(el, f.value);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, app.login.fields);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60_000 }).catch(() => {}),
        page.evaluate(() => document.querySelector('form')?.requestSubmit()),
      ]);
      await new Promise((r) => setTimeout(r, 2500));
    }

    await mkdir(app.out, { recursive: true });

    for (const shot of app.shots) {
      const url = app.base + shot.path;
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
      } catch {
        console.log(`  ${name}: ${shot.path} did not settle — skipped`);
        continue;
      }
      await new Promise((r) => setTimeout(r, shot.wait ?? 1500));
      if (shot.scrollTo) {
        await page.evaluate((y) => window.scrollTo(0, y), shot.scrollTo);
        await new Promise((r) => setTimeout(r, 900));
      }

      const raw = await page.screenshot({ type: 'png', fullPage: shot.fullPage ?? false });
      const dest = path.join(app.out, shot.file);
      await sharp(raw)
        .resize({ width: WIDTH, withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toFile(dest);

      console.log(`  ${name}: ${shot.file}  <-  ${shot.path}`);
      taken += 1;
    }
  } finally {
    await page.close();
  }
  return taken;
}

const wanted = process.argv.slice(2);
const chosen = wanted.length ? wanted : Object.keys(APPS);

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}. Set CHROME_PATH to your install.`);
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
});

let total = 0;
try {
  for (const name of chosen) {
    const app = APPS[name];
    if (!app) {
      console.log(`  ${name}: no such app in APPS — skipped`);
      continue;
    }
    total += await capture(name, app, browser);
  }
} finally {
  await browser.close();
}

console.log(`\n${total} screenshot(s) written.`);
if (total > 0) {
  console.log('Reference them from the project\'s index.md — cover, and gallery entries.');
}
