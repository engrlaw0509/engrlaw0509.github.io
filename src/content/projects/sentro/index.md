---
name: Sentro
sector: Insurance & financial advice
status: production
order: 2
featured: true
hero: true
site: https://mysentroapp.com
host: app.mysentroapp.com
platforms:
  - Web app
  - Works on any phone
  - Client portal

summary: >-
  A financial adviser's whole practice in one place — every client and policy across
  every insurer, the day's follow-ups, the unit's numbers, and the race to MDRT.

problem: >-
  Advisers here write for several insurers at once, so a client's cover is scattered across
  a spreadsheet, a phone and a portal per insurer. Follow-ups live in somebody's memory,
  premiums lapse because nobody was watching the date, and a unit manager rebuilds the
  Monday numbers by hand.

outcome: >-
  One list is waiting every morning: appointments, promised follow-ups, birthdays and
  premiums to chase. Every client and policy sits in one place, with total cover and what
  falls due next. Managers see production, activity and persistency side by side, every
  adviser sees how far they are from MDRT, and clients open their own page from an emailed
  link — under the agency's name, not ours.

highlights:
  - value: "Every insurer"
    label: "One client list"
  - value: "MDRT · COT · TOT"
    label: "Standing on every dashboard"
  - value: "13th-month"
    label: "Persistency, tracked"
  - value: "Nightly"
    label: "Encrypted off-site backup"

features:
  - title: A day that is already planned
    body: >-
      Today pulls from five places — appointments, promised follow-ups, birthdays, premiums
      to chase and anything already late — and the same list arrives by email each morning.
      The calendar syncs with Google.
  - title: Every client, across every insurer
    body: >-
      Policies, total cover, premium schedules, fund values and what falls due next, in one
      list instead of a portal per insurer. Fund prices update from the insurers' own
      websites at the press of a button.
  - title: A unit that runs on real numbers
    body: >-
      Production, activity and 13th-month persistency are shown separately, never blended
      into one score. Set targets, run incentives with live standings, recruit, and keep a
      record of every one-on-one.
  - title: The year, planned in one go
    body: >-
      An adviser sets the year's goal and Sentro breaks it into quarters and months, beside
      what the agency asked for — so every month says whether it was met, is on pace, or is
      behind.
  - title: MDRT, counted the way it is judged
    body: >-
      MDRT, Court of the Table and Top of the Table standings over the calendar year, on the
      agency's own basis, with what is left to the next level and what that works out to a
      month.
  - title: Clients get their own view
    body: >-
      A client opens their page from a link in their email — no password to forget — and
      sees what they own, their total cover, what is due next and what their fund is worth.

system:
  - key: tenancy
    value: Each agency walled off; advisers see only their own clients
    state: ok
  - key: billing
    value: Per seat · GCash, Maya, card or bank transfer
    state: ok
  - key: backups
    value: Nightly, encrypted, off-site · restore-tested weekly
    state: ok
  - key: files
    value: Object storage · deletions held 30 days
    state: ok
  - key: privacy
    value: Data Privacy Act (RA 10173) · named DPO
    state: ok
  - key: sign-in
    value: Google or password · clients by magic link
    state: ok

updates:
  - date: 2026-09-24
    title: MDRT, Court of the Table and Top of the Table standings on every adviser's dashboard
  - date: 2026-09-24
    title: Goals planned for the whole year at once, broken into quarters and months
  - date: 2026-09-24
    title: Nightly encrypted off-site backups, with a restore drill every Sunday
  - date: 2026-09-24
    title: The circle of life, drawn with the client's own ages
  - date: 2026-09-23
    title: Fund prices update from the insurers' own websites
  - date: 2026-09-22
    title: An agency event goes straight into everybody's calendar
  - date: 2026-09-22
    title: Incentives show who is already winning them
  - date: 2026-09-15
    title: Quarterly client statements an adviser can opt into
  - date: 2026-09-15
    title: The agency's own name and mark on everything that leaves the building
  - date: 2026-09-14
    title: Focus time — a timer with a target for the day
  - date: 2026-09-13
    title: Joint fieldwork lands on both advisers' calendars

stack:
  - Next.js
  - React
  - TypeScript
  - Postgres
  - Kysely
  - Tailwind CSS
  - Resend
  - Cloudflare R2
  - Railway

cover: ./cover.webp
gallery:
  - src: ./01-today.webp
    alt: Sentro's Today screen, listing the follow-ups an adviser promised, each with the client's name and what was agreed
    caption: >-
      The list an adviser starts the day with — the same one that goes out by email each
      morning, here whether or not that arrived.
  - src: ./02-goals.webp
    alt: The Goals screen, showing a year's premium target broken into quarters and months with progress for each
    caption: >-
      A year's goal broken into quarters and months, beside what the agency asked for. Each
      month says whether it was met, is on pace, or is behind.
  - src: ./03-mdrt.webp
    alt: The MDRT standings, showing qualifiers per unit and each adviser's credited premium and distance to the next level
    caption: >-
      Where everybody stands this year, and which units are producing qualifiers. MDRT,
      Court of the Table and Top of the Table are marks of the Million Dollar Round Table;
      Sentro is independent of it.
---

Sentro is sold as a subscription to agencies and to independent advisers rather than to
insurers, which is why it stays independent of any one company. An adviser who writes
business with three insurers keeps all of it in one place, and their clients see the
agency's own name and colours rather than ours.

Nobody signs up alone, and that is on purpose. Each agency is set up together with its
owner — units, reporting lines, who sees whom — because if the structure is wrong on day
one, nobody trusts the numbers afterwards. The client list comes across by pasting an
insurer's policy report; where a name is ambiguous, and two Maria Santoses is not an edge
case here, it stops and asks rather than guessing.

The part that took the most care is the wall between agencies. A practice's client list is
the most valuable thing it owns, and many practices share the same system. Nothing is
visible across that line, and the rules that enforce it are tested against a real database
before anything is released.

Every screen shown here is from a demo agency — the names and amounts are invented.
