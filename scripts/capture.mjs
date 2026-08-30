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
      email: 'admin@northstar.ph',
      password: 'advisor-dev-2026',
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

  // Intentionally has no shots. The marketing half of this app is still
  // placeholder content, and /admin needs a staff code against a backend
  // holding real employee and payroll records — not something to publish.
  // Add shots here once there is a demo tenant to point at.
  'ea-builders': {
    base: 'http://localhost:3000',
    out: 'src/content/projects/ea-builders',
    shots: [],
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
      // Fill whatever the form calls its fields, then submit.
      await page.evaluate(({ email, password }) => {
        const set = (el, v) => {
          if (!el) return;
          const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value',
          ).set;
          setter.call(el, v);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        set(document.querySelector('input[type="email"], input[name="email"]'), email);
        set(document.querySelector('input[type="password"], input[name="password"]'), password);
      }, app.login);
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
