/**
 * Render scripts/og-card.html to public/og.png at exactly 1200x630 — the
 * image Facebook, LinkedIn, Messenger and Viber show when the site is shared.
 *
 *   node scripts/og.mjs
 *
 * Re-run this after editing og-card.html. Platforms cache aggressively, so
 * after deploying use Facebook's Sharing Debugger or LinkedIn's Post Inspector
 * to force a re-fetch.
 */
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

let puppeteer;
try {
  puppeteer = (await import('puppeteer-core')).default;
} catch {
  console.error('puppeteer-core is not installed.');
  console.error('It is kept out of package.json because its presence makes Railway');
  console.error('apt-install Chromium on every build. Install it just for this run:');
  console.error('');
  console.error('  npm i --no-save puppeteer-core');
  process.exit(1);
}

const CHROME =
  process.env.CHROME_PATH ??
  'C:/Program Files/Google/Chrome/Application/chrome.exe';

const SRC = path.resolve('scripts/og-card.html');
const OUT = path.resolve('public/og.png');

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}. Set CHROME_PATH to your install.`);
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

try {
  const page = await browser.newPage();
  // Render at 2x then downscale, so the type is crisp rather than aliased.
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(SRC).href, { waitUntil: 'networkidle2', timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 600));

  const raw = await page.screenshot({ type: 'png' });
  await mkdir(path.dirname(OUT), { recursive: true });
  await sharp(raw).resize(1200, 630).png({ compressionLevel: 9 }).toFile(OUT);

  const { width, height, size } = await sharp(OUT).metadata();
  console.log(`public/og.png  ${width}x${height}  ${Math.round(size / 1024)}kB`);
} finally {
  await browser.close();
}
