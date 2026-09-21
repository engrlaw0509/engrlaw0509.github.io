/**
 * Turn the supplied logo artwork into the web assets the site uses.
 *
 *   npm run logo
 *
 * The source is a JPEG on faint graph-paper, so this does three things:
 *   1. whitens the grid — near-white, low-saturation pixels become pure white,
 *      which leaves the navy and cyan untouched because both have a low
 *      minimum channel;
 *   2. finds the real ink bounds and cuts the mark and the full lockup apart;
 *   3. writes PNGs at the sizes the site and the favicon need.
 *
 * Backgrounds stay WHITE rather than transparent on purpose. The mark's brain
 * motif is filled white, so keying the background out would make it hollow on
 * the dark theme. The header sits it on a white chip instead, which works on
 * both grounds from one asset.
 *
 * Replacing the artwork: drop a new file at SRC (or pass a path as argv[2]) and
 * re-run. If you ever get an SVG of this logo, use that instead — it will be
 * sharper at every size and none of this processing is needed.
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC =
  process.argv[2] ??
  'G:/My Drive/Work/LMI Automata Labs/Logo/LMI Automata Labs Logo.jpeg';
const OUT = 'public/brand';

/** A pixel counts as artwork if it is dark, or saturated (the cyan). */
function isInk(r, g, b) {
  const mn = Math.min(r, g, b);
  const mx = Math.max(r, g, b);
  return mn < 165 || mx - mn > 70;
}

/** Faint grid: light and nearly grey. Flattened to white. */
function isBackground(r, g, b) {
  const mn = Math.min(r, g, b);
  const mx = Math.max(r, g, b);
  return mn > 205 && mx - mn < 45;
}

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

// --- 1. flatten the grid to pure white -------------------------------------
const clean = Buffer.from(data);

// Pass A: obvious background anywhere, including regions the fill cannot reach
// (grid showing through an enclosed shape like the brain's interior).
for (let i = 0; i < clean.length; i += C) {
  if (isBackground(clean[i], clean[i + 1], clean[i + 2])) {
    clean[i] = clean[i + 1] = clean[i + 2] = 255;
  }
}

// Pass B: flood fill inwards from the borders over anything light. This clears
// the grid lines that survive pass A because they sit slightly darker or bluer,
// and it is safe on the artwork: every logo stroke is dark enough to stop the
// fill, so enclosed white areas (the brain) are never entered from outside.
{
  const isLight = (i) => Math.min(clean[i], clean[i + 1], clean[i + 2]) > 170;
  const seen = new Uint8Array(W * H);
  const stack = new Int32Array(W * H);
  let sp = 0;

  const push = (x, y) => {
    const p = y * W + x;
    if (seen[p]) return;
    if (!isLight(p * C)) return;
    seen[p] = 1;
    stack[sp++] = p;
  };

  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

  while (sp > 0) {
    const p = stack[--sp];
    const i = p * C;
    clean[i] = clean[i + 1] = clean[i + 2] = 255;
    const x = p % W;
    const y = (p - x) / W;
    if (x > 0) push(x - 1, y);
    if (x < W - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < H - 1) push(x, y + 1);
  }
}

// --- 2. locate the artwork -------------------------------------------------
const rowInk = new Array(H).fill(0);
const at = (x, y) => {
  const i = (y * W + x) * C;
  return [clean[i], clean[i + 1], clean[i + 2]];
};

let gx0 = W, gy0 = H, gx1 = 0, gy1 = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (isInk(...at(x, y))) {
      rowInk[y]++;
      if (x < gx0) gx0 = x;
      if (x > gx1) gx1 = x;
      if (y < gy0) gy0 = y;
      if (y > gy1) gy1 = y;
    }
  }
}

/** The widest blank band splits the mark from the wordmark beneath it. */
let split = null;
let run = null;
for (let y = gy0; y <= gy1; y++) {
  const blank = rowInk[y] < 2;
  if (blank && !run) run = { s: y };
  else if (!blank && run) {
    const band = { s: run.s, e: y - 1, h: y - run.s };
    if (!split || band.h > split.h) split = band;
    run = null;
  }
}
if (!split) throw new Error('Could not find the gap between the mark and the wordmark.');

/** Horizontal ink bounds for a given row range. */
function xBounds(yStart, yEnd) {
  let x0 = W, x1 = 0;
  for (let y = yStart; y <= yEnd; y++) {
    for (let x = 0; x < W; x++) {
      if (isInk(...at(x, y))) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
      }
    }
  }
  return { x0, x1 };
}

const markY = { y0: gy0, y1: split.s - 1 };
const markX = xBounds(markY.y0, markY.y1);

const cleanImg = () =>
  sharp(clean, { raw: { width: W, height: H, channels: C } });

await mkdir(OUT, { recursive: true });

// --- 3. write the assets ---------------------------------------------------
const PAD = 26; // breathing room so nothing touches an edge

// The mark, padded to a square so it centres inside a chip.
const mw = markX.x1 - markX.x0 + 1;
const mh = markY.y1 - markY.y0 + 1;
const side = Math.max(mw, mh) + PAD * 2;
const markSquare = await cleanImg()
  .extract({ left: markX.x0, top: markY.y0, width: mw, height: mh })
  .extend({
    top: Math.round((side - mh) / 2),
    bottom: side - mh - Math.round((side - mh) / 2),
    left: Math.round((side - mw) / 2),
    right: side - mw - Math.round((side - mw) / 2),
    background: '#FFFFFF',
  })
  .png()
  .toBuffer();

for (const size of [512, 180, 64]) {
  const name = size === 512 ? 'mark.png' : `mark-${size}.png`;
  await sharp(markSquare).resize(size, size, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 }).toFile(path.join(OUT, name));
  console.log(`${OUT}/${name}  ${size}x${size}`);
}

// The full lockup — mark plus wordmark — for the share card.
const lw = gx1 - gx0 + 1;
const lh = gy1 - gy0 + 1;
const lockup = await cleanImg()
  .extract({ left: gx0, top: gy0, width: lw, height: lh })
  .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: '#FFFFFF' })
  .resize({ width: 900, kernel: 'lanczos3' })
  .png({ compressionLevel: 9 })
  .toBuffer();
await sharp(lockup).toFile(path.join(OUT, 'lockup.png'));
const lm = await sharp(lockup).metadata();
console.log(`${OUT}/lockup.png  ${lm.width}x${lm.height}`);

console.log(`\nsource ${W}x${H} — mark at x${markX.x0}..${markX.x1} y${markY.y0}..${markY.y1}`);
