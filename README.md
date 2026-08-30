# engrlaw0509.github.io

The marketing site for **LMI Automata Labs** — a Manila software studio.

Live at <https://engrlaw0509.github.io/>.

Built with [Astro](https://astro.build). Pushing to `main` builds and deploys it via
GitHub Actions; there is nothing to run by hand.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # writes dist/
npm run preview  # serve dist/ exactly as it will be deployed
```

---

## Adding a project

One project is one folder. Nothing outside it needs editing — the homepage, the
`/work/` index and the project's own page all pick it up automatically.

```
src/content/projects/<slug>/
  index.md          the copy and metadata
  cover.png         card image and page hero
  01-something.png  gallery images
```

The folder name becomes the URL: `src/content/projects/kaha/` → `/work/kaha/`.

Copy an existing `index.md` and change the fields. They are all defined and commented in
[`src/content.config.ts`](src/content.config.ts), which is also what validates them — a
missing or misspelled field fails the build with a message naming it, rather than
shipping a broken page.

The fields that matter most:

| Field | Why it matters |
|---|---|
| `summary` | The one line on the card. Say what it does for the owner, not how it works. |
| `problem` / `outcome` | Shown as **Before** and **After**. This is the part prospects actually read. |
| `status` | `production` or `building`. Drives the chip and which section of `/work/` it lands in. |
| `featured` | Puts it on the homepage. |
| `order` | Sorts everything. Lower first. |
| `highlights` | Three or four short proof points. More than four wraps badly. |

Every gallery image needs `alt`. It is read aloud by screen readers and shown if the
image fails, so describe what is in the picture rather than repeating the caption.

### Writing the copy

The site is written for business owners, not developers. Lead with the owner's problem
and what changed; keep the technical detail to the `stack` list at the bottom. "Your
Makati staff cannot see Ortigas's sales" beats "row-level security enforces tenant
isolation" on this site, even though the second one is what makes the first true.

---

## Screenshots

`scripts/capture.mjs` drives the Chrome already installed on this machine and writes
screenshots straight into the project folders at 1800px wide.

```bash
node scripts/capture.mjs sentro     # that app's dev server must be running
node scripts/capture.mjs            # everything configured
```

Each app is configured in the `APPS` object at the top of that file — its dev server
port, where to write, an optional login, and the list of pages to shoot. Add an entry to
capture a new app.

**Current state, and it is deliberate:**

| Project | Screenshots | Why |
|---|---|---|
| Sentro | 4, captured | Its dev seed builds a synthetic book of business — every contact is marked `Demo` with an `@example.ph` address. Safe to publish. |
| EA Builders | 4, captured | Only via the built-in mock adapter — see the warning below. |
| Croma MNL | Public site only | The POS is an Apps Script app behind a Google login, so its screens have to come from a signed-in session. |
| Kaha | None | Its API needs a real Postgres and has no mock mode. The `kaha` entry in `capture.mjs` has the commands; uncomment its shots once a database is up. |

### EA Builders: start the dev server in demo mode

Its `getPortal()` falls through to an in-memory mock adapter when no backend is
configured, and every person in that fixture is named "Demo Something". Start it with
those two variables blank so the shell overrides `.env.local`:

```bash
PORTAL_API_URL= PORTAL_API_SECRET= npm run dev
```

**Never capture this app against its real backend.** `/admin` talks to a system holding
actual employee and payroll records. Confirm the "Demo mode — no backend configured"
banner appears on `/admin` before shooting anything.

Two rules worth keeping:

1. **Never publish a screenshot containing real customer or staff data.** Seed data
   only. Check before adding a shot, not after.
2. **Watch for third-party trademarks.** The `/policies` screen in Sentro was dropped
   because the seeded product names are real insurer trademarks, and showing them
   implies a partnership that does not exist.

Replacing any image is just dropping a better file over the old one and rebuilding.

---

## Design

Tokens live at the top of [`src/styles/global.css`](src/styles/global.css), defined three
times: on bare `:root` for light, under `prefers-color-scheme: dark`, and under
`[data-theme="dark"]`. **Change a colour in all three** or the page will only be right in
one theme. Never write a colour anywhere else — that is how a page ends up with one
theme's text on the other theme's background.

The palette is a bookkeeper's ledger pad: pale columnar-green ground, blue-black ink,
deep ledger blue for accents, ochre for in-progress status and green for shipped. Type is
Archivo (display), Source Serif 4 (body) and IBM Plex Mono (labels).

Every colour clears WCAG AA on both grounds. `--ink-3` in particular is darker than it
looks like it should be, because the mono labels using it are 10–11px and get no
large-text exemption.

---

## Custom domain

Add `public/CNAME` containing just the domain, then point DNS at GitHub:

```
lmiautomata.com
```

Apex domain: four `A` records — `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
`185.199.111.153`. For `www`, a `CNAME` to `engrlaw0509.github.io`. Then set `site` in
[`astro.config.mjs`](astro.config.mjs) to the new address so canonical URLs and the
sitemap follow, and turn on **Enforce HTTPS** in Settings → Pages.
