# engrlaw0509.github.io

The marketing site for **LMI Automata Labs** — a Manila software studio.

Live at <https://www.lmiautomatalabs.com>.

Built with [Astro](https://astro.build) 7 and hosted on **Railway** (project
`lmi-automata-labs`, service `web`), which builds and deploys on every push to `main`.
`railway.json` holds the build and start commands; `npm start` runs the same server
locally, so what Railway does is reproducible before it gets there.

Node is pinned to 22.12+ via `engines` — Astro 7 requires it, and Railway otherwise picks
an older Node.

```bash
npm install
npm run dev      # http://localhost:4321 — content and styling
npm run build    # writes dist/
npm start        # the real server on dist/: /api/status and /api/enquiry work here
```

`astro dev` has no `/api`, so live status pills and the enquiry form only work under
`npm start` (after a build). **Restart `npm start` after every build** — the static server
indexes `dist/` when it starts and will 404 on files built after that.

---

## Adding a project

One project is one folder. Nothing outside it needs editing — the homepage, `/work/`, the
footer and the project's own page all pick it up automatically.

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
| `status` | `production` or `building`. Drives the pill and which section of `/work/` it lands in. |
| `featured` | Puts it in the large cards on the homepage. The first featured project gets the wide card. |
| `order` | Sorts everything. Lower first. |
| `highlights` | Three or four short proof points. More than four wraps badly. |
| `latest` | The **three** newest features, newest first. The first is the product's card in the homepage "What's new" row; all three show on its page. |
| `system` | The terminal panel: engineering facts, one per line, `ok` / `wip` / `info`. |
| `site` / `host` | The public site ("Visit …") and the host shown in the screenshot's address bar. |

Every gallery image needs `alt`. It is read aloud by screen readers and shown if the
image fails, so describe what is in the picture rather than repeating the caption.

A project with no `cover` still looks finished: its card and page show the `system`
terminal instead of a screenshot. That is how Kaha appears.

### Writing the copy

The site is written for business owners, not developers. Lead with the owner's problem
and what changed; keep the technical detail to the `stack` list and the `system` panel.
"Your Makati staff cannot see Ortigas's sales" beats "row-level security enforces tenant
isolation" in the copy, even though the second one is what makes the first true.

**Every number must be measured, counted or tested.** The homepage "Measured, not
claimed" band (`stats` in `src/pages/index.astro`) names where each figure comes from.
When one changes in its project, change it there too.

### Latest features — never a history

The site shows only what is **newest**, not everything that has changed (the owner's
call, 26 Sep 2026 — the full changelog page was removed, and `/changelog/` now redirects to
the homepage's "What's new"). Each product keeps at most **three** `latest` entries, and
the schema enforces the limit (`.max(3)`), so the list cannot quietly grow back into a log.

When something ships: add it at the top and drop the oldest. Each entry is a dated day
(`2026-09-26`), a title and one or two sentences, written for the person who uses the
product — what they can now do, not what the code does. Only real functionality belongs
here: no fixes, no refactors, nothing internal. "Restored the purchases lost on the 19th"
is a commit message, not a feature.

---

## Live status

The **"In production"** pill upgrades itself to **"Live now"**, with a pulsing dot, when
that product's health check passes. The footer's **"All systems operational"** appears
only when every checked product passes.

`server.mjs` checks each product in `PROBES` (keyed by project id) at most once a minute,
however many visitors ask, and answers `GET /api/status`:

| Project | Health endpoint | What it proves |
|---|---|---|
| `sentro` | `https://app.mysentroapp.com/api/health` | The app answers **and** its database round-trips |
| `croma-mnl` | `https://api.cromamnl.com/health` | Same, plus it reports its own DB latency |

Two rules are deliberate:

1. **Only a passing check changes the page.** A failing or unreachable check leaves the
   build-time "In production" text alone. The site never announces an outage to a
   prospect; it just stops claiming "Live now".
2. **A product with no public health endpoint is not probed.** EA Builders has none, so
   it keeps "In production". Add a line to `PROBES` when it does.

Where there is no `/api` (the GitHub Pages mirror, `astro dev`) the fetch fails quietly
and the pills keep their build-time text.

---

## Screenshots

`scripts/capture.mjs` drives the Chrome already installed on this machine and writes
screenshots straight into the project folders at 1800px wide.

**It needs `puppeteer-core`, which is deliberately not in `package.json`** — its presence
there makes Railway's builder apt-install Chromium on every deploy, which costs minutes
and hundreds of megabytes for a tool only ever run locally. Install it for the run:

```bash
npm i --no-save puppeteer-core
```

The same applies to `npm run og`. `npm run logo` only needs sharp and works as-is.

```bash
node scripts/capture.mjs ea-builders   # that app's dev server must be running
node scripts/capture.mjs               # everything configured
```

Each app is configured in the `APPS` object at the top of that file — its dev server
port, where to write, an optional login, and the list of pages to shoot.

**Current state, and it is deliberate:**

| Project | Screenshots | Why |
|---|---|---|
| Sentro | 5, from Sentro's own set | Copied from `advisor-web/public/screens/` (retaken 26 Sep 2026 against its **Northstar demo agency** — every name and amount invented): `dashboard` → `cover`, `today`, `goals`, `mdrt`, `recruitment`. Its `portal`, `policies` and `client` shots are **left out on purpose**: they show real insurer and product names (the client page lists PRULink and PRUHealth policies). `forms` is an empty state. Re-copy when Sentro re-shoots, and look at each one first. |
| EA Builders | 4, captured | Only via the built-in mock adapter — see the warning below. |
| Croma MNL | 2 — supplied by hand | The operations dashboard is from a signed-in admin session at `app.cromamnl.com`. **It shows real revenue figures, not seed data** — unlike every other shot on the site. |
| Kaha | None | Its API needs a real Postgres and has no mock mode, and there is no counter UI yet. The `system` terminal stands in. The `kaha` entry in `capture.mjs` has the commands. |

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
2. **Watch for third-party trademarks.** Screens showing real insurer and product names
   stay off this site — showing them implies a partnership that does not exist. MDRT,
   Court of the Table and Top of the Table appear only with the disclaimer that they
   are the Million Dollar Round Table's marks.

Replacing any image is just dropping a better file over the old one and rebuilding.

---

## How it is built

Everything here is progressive: a browser that lacks a feature gets the plain,
fully working page.

| Feature | How | Without it |
|---|---|---|
| Fonts | Geist and Geist Mono, fetched **at build time** by Astro's Fonts API and served from `/_astro/fonts/` with metric-matched fallbacks. No request to Google leaves a visitor's browser. | — |
| Instant navigation | `prefetch` + `experimental.clientPrerender`: hovering a link **prerenders** the next page through the Speculation Rules API in Chromium, so the click is instant. | Ordinary prefetch, or a normal load |
| Page transitions | Native cross-document view transitions (`@view-transition` in `global.css`). The screenshot on a card carries `view-transition-name: shot-<id>` and **morphs** into the project page's hero. | A normal page change |
| Scroll reveals | CSS scroll-driven animations (`animation-timeline: view()`) inside `@supports`, so no script decides whether content appears. | Content is simply visible |
| Theme | Dark by default; the header toggle switches to light, remembered in `localStorage`, applied by an inline head script **before first paint**. | Dark |
| Mobile menu | A `<details>` element — opens and closes with no script. | — |
| Caching | `/_astro/*` (content-hashed) is `immutable` for a year; pages revalidate by ETag. | — |

A view-transition name must be **unique on a page** or the browser silently skips the
whole transition. That is why the homepage hero's frame is unnamed — its Sentro
screenshot also appears on a card.

### CSS traps worth knowing

- **`[hidden] { display: none !important; }` in `global.css` is load-bearing.** The
  `hidden` attribute is only `display: none` in the UA stylesheet, so any author
  `display` beats it. The contact form's success panel once shipped visible for exactly
  this reason.
- **A `.reveal` element cannot have its own hover `transform`.** The scroll animation
  holds `transform` once it has played, silently overriding the hover. Put `.reveal` on
  a wrapper (as the product cards do), or give hover feedback another way.
- **Grids holding `nowrap` text need `grid-template-columns: minmax(0, 1fr)`.** The
  implicit track grows to fit the text, pushes content past a phone screen, and
  `overflow-x: clip` on `body` hides the cut-off instead of showing a scrollbar. The
  hero's announcement pill did exactly this.
- **Astro 7 drops whitespace that contains a line break next to an inline tag.**
  `use.⏎<strong>Built` renders as `use.Built`. Keep the space and the tag on one line, or
  write `{' '}`.

---

## Design

Tokens live at the top of [`src/styles/global.css`](src/styles/global.css), defined
**twice**: on bare `:root` (dark, the default) and under `:root[data-theme="light"]`.
Change a colour in both, and never write one anywhere else — that is how a page ends up
with one theme's ink on the other theme's ground.

A few tokens are deliberately defined once and shared by both themes: the terminal panel
(`--term-*`, dark in both, as a terminal is), thermal-receipt paper (`--paper-*`) and a
window's traffic lights (`--dot-*`). `scripts/og-card.html` copies the dark tokens by
hand, because a standalone file cannot import them.

The palette is taken from the logo: sky `#38BDF8` carries interaction, cyan and indigo are
decoration and glow only, and the brand gradient runs cyan → sky → indigo. Status colours
are green for shipped and amber for in progress. Every text colour clears WCAG AA on
every surface it sits on; `--ink-3` in particular is lighter than it looks like it
should be, because the mono labels using it are 11px and get no large-text exemption.

Type is Geist (display and body) and Geist Mono (labels, data, the terminal).

---

## The enquiry form

`/contact/` is a three-step flow that posts to **this site's own server**
([`server.mjs`](server.mjs)) at `POST /api/enquiry`, which sends through **Resend** — the
same provider Sentro uses.

Every other LMI project has a backend and sends its own mail (Sentro via Resend, EA
Builders via its `/api/inquiry` route, Croma via its API). This one posts same-origin: no
CORS, no third-party relay, no activation step.

### Required Railway variables

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Sending key. **Without it the endpoint logs the enquiry and returns 503** rather than showing a success that did not happen. |
| `ENQUIRY_FROM` | Sender, e.g. `LMI Automata Labs <enquiries@lmiautomatalabs.com>`. Must be on a domain verified in Resend. |
| `ENQUIRY_TO` | Where enquiries land. Defaults to `lmiautomatalabs@gmail.com`. |

Verify `lmiautomatalabs.com` in Resend and send from it — mail then carries your own
domain's reputation instead of a shared relay's. Resend's `onboarding@resend.dev` only
delivers to the Resend account's own address, so it is not a substitute here.

`GET /api/health` reports whether mail is configured.

### What the endpoint does

Honeypot (accepted silently, so a bot learns nothing), a coarse per-IP throttle keyed on
`x-real-ip` (the header that does not rotate behind Railway's proxy), required-field
checks, and **it logs the full payload whenever sending fails**, so a lead is never
silently lost.

The browser checks both the status code and the `ok` flag before reporting success. An
earlier version trusted the status code alone against a relay that answers 200 on
rejection, and told visitors their enquiry had been sent when nothing had.

`scripts/enquiry-endpoint.gs` remains as an Apps Script alternative if mail should ever go
through Google instead.

---

## Domain and hosting

`lmiautomatalabs.com`, registered at Namecheap, DNS on Namecheap's free BasicDNS.

| Address | Served by | Role |
|---|---|---|
| `www.lmiautomatalabs.com` | **Railway** | **Canonical.** The real site, with `/api`. |
| `lmiautomatalabs.com` | GitHub Pages | Same build; the inline script at the top of `Base.astro`'s `<head>` **forwards visitors to `www`** |
| `engrlaw0509.github.io` | GitHub Pages | 301 to the apex |

### DNS at Namecheap (as of 26 Sep 2026)

| Type | Host | Value |
|---|---|---|
| A ×4 | `@` | `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` (GitHub) |
| TXT | `_railway-verify` | `railway-verify=b1773a1867aee56a899fd6b429cc0014eff70a0343b2cb47ba0aec3fecf497a3` (apex ownership, for the move below) |
| CNAME | `www` | `4j96l1ma.up.railway.app` (Railway) |
| TXT | `_railway-verify.www` | `railway-verify=2062aa…aec26` (www ownership) |

All four A records are required while the apex is on GitHub — they are its four edge
addresses, not alternatives. Namecheap writes `@` as the apex; do not type the domain
name in the Host field.

### Moving the apex to Railway (ready, not done)

**Namecheap BasicDNS does support `ALIAS` records** (an earlier version of this README said
otherwise), and Railway accepts a dynamic ALIAS for a root domain. The move is two DNS
edits: delete the four A records, and add `ALIAS @ → 8zhq5c29.up.railway.app`. The apex
ownership TXT is already in place, and `server.mjs` already answers the bare domain with a
**301 to `www`** (path kept) the moment it arrives.

Railway verifies a domain only when the routing record **and** the TXT both point at it —
the TXT alone was visible publicly for over an hour on 25 Sep with no progress — so its
certificate cannot be prepared in advance. Expect the bare domain to show a certificate
error until Railway catches up; if it does not within about 30 minutes, put the four A
records back and delete the ALIAS to return to the setup above. After the move, delete
`.github/workflows/deploy.yml` and `public/CNAME` once nothing links to the github.io
address any more.

**Never leave an ALIAS beside A records on the same name.** Both are answered, so browsers
pick among all of them. That is how this site broke on 25 Sep 2026: an ALIAS to Railway sat
beside GitHub's four A records, one lookup in five landed on Railway, and Railway — with no
apex ownership TXT, so no certificate — served its generic `*.up.railway.app` certificate.
Visitors got a privacy error intermittently, which made it look random. Check every address
a name returns, not just whether one request works.

**Railway custom domains need that TXT record, and the Railway MCP does not mention it** —
it reports only the CNAME. Always read the requirements from the CLI instead, which lists
both:

```bash
railway domain status www.lmiautomatalabs.com --project <id> --environment <id> --service web
```

Without the TXT the domain sits in `VALIDATING_OWNERSHIP` indefinitely, and
`railway domain certificate retry` refuses to help because Railway has not *failed* — it is
still waiting.

Delete Namecheap's default `www` CNAME to `parkingpage.namecheap.com` and any **URL
Redirect Record** before adding anything. A URL Redirect on `@` is implemented by pointing
the host at Namecheap's own redirect server, so it silently injects an extra `A` record into
the apex — and it hides behind the **SHOW MORE** button in Advanced DNS.

### Two hosts means two pipelines

Pushing to `main` deploys to both: Railway builds and serves `www`, and the GitHub Actions
workflow publishes the apex. They build from the same commit, so they stay in step.

### After a design or domain change

Facebook and LinkedIn cache link previews hard. Force a re-fetch or old shares keep showing
the previous card:

- Facebook — [Sharing Debugger](https://developers.facebook.com/tools/debug/) → **Scrape Again**
- LinkedIn — [Post Inspector](https://www.linkedin.com/post-inspector/)
