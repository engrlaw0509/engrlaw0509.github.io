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

/**
 * Centre of mass of the ink in a region. Centring the bounding box is not the
 * same as centring the artwork: this mark's weight sits low and left because of
 * the descending diagonal, so a box-centred crop reads as off-centre. Aligning
 * the centre of mass instead is what makes it sit right in a chip.
 */
function inkCentre(x0, y0, x1, y1) {
  let sx = 0, sy = 0, n = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (isInk(...at(x, y))) { sx += x; sy += y; n++; }
    }
  }
  return { cx: sx / n, cy: sy / n, n };
}

const mw = markX.x1 - markX.x0 + 1;
const mh = markY.y1 - markY.y0 + 1;

// Logos need real clear space around them; ~9% reads as deliberate.
const side = Math.round(Math.max(mw, mh) * 1.18);
const com = inkCentre(markX.x0, markY.y0, markX.x1, markY.y1);

// Pad so the centre of mass lands on the square's centre, then clamp so the
// bounding box still fits with a little air on every side.
const minAir = Math.round(side * 0.04);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const left = clamp(Math.round(side / 2 - (com.cx - markX.x0)), minAir, side - mw - minAir);
const top = clamp(Math.round(side / 2 - (com.cy - markY.y0)), minAir, side - mh - minAir);

const markSquare = await cleanImg()
  .extract({ left: markX.x0, top: markY.y0, width: mw, height: mh })
  // The source is a JPEG, so flat navy areas are mottled with ringing. A small
  // median pass clears that without softening the strokes, and it matters far
  // more once the image is scaled down to favicon size.
  .median(3)
  .extend({
    top,
    bottom: side - mh - top,
    left,
    right: side - mw - left,
    background: '#FFFFFF',
  })
  .png()
  .toBuffer();

console.log(
  `mark ${mw}x${mh} in ${side}px square — ` +
  `box centre would be ${Math.round((side - mw) / 2)},${Math.round((side - mh) / 2)}; ` +
  `optical centre is ${left},${top}`,
);

// Square variants — only for the favicon and touch icon, which must be square.
for (const size of [512, 180, 64]) {
  const name = size === 512 ? 'mark.png' : `mark-${size}.png`;
  await sharp(markSquare).resize(size, size, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 }).toFile(path.join(OUT, name));
  console.log(`${OUT}/${name}  ${size}x${size}  (square, favicon)`);
}

// Natural-aspect variant for the header and footer. The mark is landscape
// (775x530 here), so squaring it would waste ~40% of the height and render the
// artwork small inside its chip — which is what made it look weak in the header.
const wideAir = Math.round(mh * 0.07);
const markWide = await cleanImg()
  .extract({ left: markX.x0, top: markY.y0, width: mw, height: mh })
  .median(3)
  .extend({
    top: wideAir, bottom: wideAir, left: wideAir, right: wideAir,
    background: '#FFFFFF',
  })
  .resize({ height: 160, kernel: 'lanczos3' })
  .png({ compressionLevel: 9 })
  .toBuffer();
await sharp(markWide).toFile(path.join(OUT, 'mark-wide.png'));
const wm = await sharp(markWide).metadata();
console.log(`${OUT}/mark-wide.png  ${wm.width}x${wm.height}  (header/footer)`);

// The full lockup — mark plus wordmark — for the share card.
const lw = gx1 - gx0 + 1;
const lh = gy1 - gy0 + 1;
const lockAir = Math.round(lw * 0.08);
const lockup = await cleanImg()
  .extract({ left: gx0, top: gy0, width: lw, height: lh })
  .median(3)
  .extend({
    top: lockAir, bottom: lockAir, left: lockAir, right: lockAir,
    background: '#FFFFFF',
  })
  .resize({ width: 900, kernel: 'lanczos3' })
  .png({ compressionLevel: 9 })
  .toBuffer();
await sharp(lockup).toFile(path.join(OUT, 'lockup.png'));
const lm = await sharp(lockup).metadata();
console.log(`${OUT}/lockup.png  ${lm.width}x${lm.height}`);

console.log(`\nsource ${W}x${H} — mark at x${markX.x0}..${markX.x1} y${markY.y0}..${markY.y1}`);
