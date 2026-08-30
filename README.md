# engrlaw0509.github.io

The public portfolio site for **LMI Automata Labs** — a Manila software studio.

Live at <https://engrlaw0509.github.io/>.

## What this is

A single static page. No build step, no dependencies, no framework. `index.html`
carries its own CSS and one small script; the only external request is the Google
Fonts stylesheet. Edit the file, commit, push — GitHub Pages redeploys within a
minute or two.

```
index.html     The entire site — content, styles, and the scroll reveal.
favicon.svg    Ledger mark, also the source for the tab icon.
.nojekyll      Tells Pages to serve the files as-is, skipping Jekyll.
CNAME          (absent) Add this when pointing a custom domain here.
```

## Editing it

Everything a person reads lives between `<body>` and `</body>`, in four sections:

| Section | `id` | What it holds |
|---|---|---|
| The register | `work` | One `<article class="entry">` per product |
| Integration & automation | `integration` | One `<div class="cap">` per service |
| How the work is built | `approach` | One `<div class="principle">` each |
| Start a conversation | `contact` | Contact links |

To add a product, copy an existing `<article class="entry">` block along with the
`<hr class="rule rule-soft">` above it, and change the text. The `reveal` class is
what fades it in on scroll — keep it.

Status chips are `<span class="status">` for in-development, and
`<span class="status is-live">` for shipped work. The green is deliberate: it should
mean something, so only use it for systems a real business is using today.

The four large numbers under Croma MNL come from that repository's own README
(163 endpoints, 14,136 lines, 43 test scripts). If those change, change them here too
— a portfolio figure that no longer matches the code is worse than no figure.

## Colours and type

Design tokens sit at the top of the `<style>` block, defined three times: once on
bare `:root` for light, once under `prefers-color-scheme: dark`, and once under
`[data-theme="dark"]`. Change a colour in all three or the page will only be right in
one theme.

The palette is a bookkeeper's ledger pad — pale columnar green ground, blue-black ink,
deep ledger blue for accents, ochre for in-progress status. Type is Archivo (display),
Source Serif 4 (body), IBM Plex Mono (labels and data).

## Custom domain

Add a file named `CNAME` containing just the domain, then point DNS at GitHub:

```
lmiautomata.com
```

For an apex domain, four `A` records: `185.199.108.153`, `185.199.109.153`,
`185.199.110.153`, `185.199.111.153`. For `www`, a `CNAME` to `engrlaw0509.github.io`.
Then enable **Enforce HTTPS** in Settings → Pages once the certificate is issued.
