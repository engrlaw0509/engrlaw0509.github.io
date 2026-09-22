# engrlaw0509.github.io

The marketing site for **LMI Automata Labs** — a Manila software studio.

Live at <https://www.lmiautomatalabs.com>.

Built with [Astro](https://astro.build) and hosted on **Railway** (project
`lmi-automata-labs`, service `web`), which builds and deploys on every push to `main`.
`railway.json` holds the build and start commands; `npm start` runs the same static
server locally, so what Railway does is reproducible before it gets there.

Node is pinned to 22+ via `engines` — Railway otherwise picks Node 18, which is below
what Astro 5 requires.

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

**It needs `puppeteer-core`, which is deliberately not in `package.json`** — its presence
there makes Railway's builder apt-install Chromium on every deploy, which costs minutes
and hundreds of megabytes for a tool only ever run locally. Install it for the run:

```bash
npm i --no-save puppeteer-core
```

The same applies to `npm run og`. `npm run logo` only needs sharp and works as-is.

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

## The enquiry form

`/contact/` is a three-step flow that posts to **this site's own server**
([`server.mjs`](server.mjs)) at `POST /api/enquiry`, which sends through **Resend** — the
same provider Sentro uses.

That is the point: every other LMI project has a backend and sends its own mail (Sentro
via Resend, EA Builders via its `/api/inquiry` route, Croma via Apps Script). This site was
the only static one, so it had to borrow a third-party relay — which meant activation
links, someone else's sending reputation, and spam folders. Now it posts same-origin: no
CORS, no relay, no activation.

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
checks, and — borrowed from EA Builders' route — **it logs the full payload whenever
sending fails**, so a lead is never silently lost.

The browser checks both the status code and the `ok` flag before reporting success. An
earlier version trusted the status code alone against a relay that answers 200 on
rejection, and told visitors their enquiry had been sent when nothing had.

`scripts/enquiry-endpoint.gs` remains as an Apps Script alternative if mail should ever go
through Google instead.

---

## A CSS trap worth knowing

`global.css` carries `[hidden] { display: none !important; }` and it is load-bearing.

The `hidden` attribute is only `display: none` in the **UA stylesheet**, so any author
`display` declaration beats it. A `.btn` (`display: inline-flex`) or a grid container with
`hidden` set stays fully visible while the DOM, and any script checking `el.hidden`,
insists it is hidden. The contact form's success panel shipped visible for exactly this
reason. Anything toggled with `hidden` depends on that rule.

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

## Domain and hosting

`lmiautomatalabs.com`, registered at Namecheap. It is served from **two** places, and that
is deliberate:

| Address | Served by | Role |
|---|---|---|
| `www.lmiautomatalabs.com` | **Railway** | **Canonical.** The real site. |
| `lmiautomatalabs.com` | GitHub Pages | Same build, kept alive so the bare domain works |
| `engrlaw0509.github.io` | GitHub Pages | 301 to the apex |

**Why not put the apex on Railway?** Railway routes custom domains by CNAME, and a DNS zone
apex cannot hold a CNAME — the apex must carry `SOA` and `NS`, and a CNAME may not coexist
with other records on the same name. Providers work around it with non-standard `ALIAS` /
`ANAME` / CNAME-flattening records, and **Namecheap BasicDNS has none of them**. GitHub
Pages works at the apex only because it publishes fixed anycast IPs, so plain `A` records
are legal.

Moving the apex to Railway later needs either Namecheap **PremiumDNS** (which does support
`ALIAS`) or Cloudflare DNS (CNAME flattening). Then it is:

| Type | Host | Value |
|---|---|---|
| ALIAS | `@` | `8zhq5c29.up.railway.app` |
| TXT | `_railway-verify` | `railway-verify=b1773a1867aee56a899fd6b429cc0014eff70a0343b2cb47ba0aec3fecf497a3` |

### Current DNS at Namecheap (BasicDNS)

| Type | Host | Value |
|---|---|---|
| A ×4 | `@` | `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` (GitHub) |
| CNAME | `www` | `4j96l1ma.up.railway.app` (Railway) |
| TXT | `_railway-verify.www` | `railway-verify=2062aa…aec26` (Railway ownership) |

**Railway custom domains need that TXT record, and the Railway MCP does not mention it** —
it reports only the CNAME. Always read the requirements from the CLI instead, which lists
both:

```bash
railway domain status www.lmiautomatalabs.com --project <id> --service web
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
workflow publishes the apex. They build from the same commit, so they stay in step. If you
ever move the apex to Railway, delete `.github/workflows/deploy.yml` and `public/CNAME`.

### After a domain change

Facebook and LinkedIn cache link previews hard. Force a re-fetch or old shares keep showing
the previous state:

- Facebook — [Sharing Debugger](https://developers.facebook.com/tools/debug/) → **Scrape Again**
- LinkedIn — [Post Inspector](https://www.linkedin.com/post-inspector/)

---|---|---|---|
| A | `@` | `185.199.108.153` | Automatic |
| A | `@` | `185.199.109.153` | Automatic |
| A | `@` | `185.199.110.153` | Automatic |
| A | `@` | `185.199.111.153` | Automatic |
| CNAME | `www` | `engrlaw0509.github.io.` | Automatic |

All four A records are required — they are GitHub's four edge addresses, not
alternatives. Namecheap writes `@` as the apex; do not type the domain name in the Host
field. The trailing dot on the CNAME value matters.

Optional IPv6, same `@` host as AAAA records: `2606:50c0:8000::153`,
`2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.

Propagation is usually minutes, up to 24 hours. Check with:

```bash
nslookup lmiautomatalabs.com
```

Once it resolves to those addresses, GitHub issues a Let's Encrypt certificate
automatically, and **Enforce HTTPS** becomes tickable in Settings → Pages. It stays
greyed out until the certificate is issued, which is normal.

### After the domain goes live

Facebook and LinkedIn cache link previews hard. Force a re-fetch once, or old shares
keep showing nothing:

- Facebook — [Sharing Debugger](https://developers.facebook.com/tools/debug/), paste the
  URL, **Scrape Again**
- LinkedIn — [Post Inspector](https://www.linkedin.com/post-inspector/)
