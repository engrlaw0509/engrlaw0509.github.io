---
name: Tarashare
sector: Shared expenses for any group
status: production
order: 4
featured: false
site: https://tarashare.app
host: tarashare.app
platforms:
  - Web app
  - Installs on any phone
  - Works offline

summary: >-
  Shared costs for any group — a trip abroad, a barkada, a household or a class — settled
  in the fewest payments, in any currency, even when someone pays for others.

problem: >-
  Whoever booked the hotel or paid for dinner ends up keeping the tally in a notebook or the
  group chat, then chasing everyone for weeks. A trip abroad mixes yen and pesos, children
  pay for their parents, and before long nobody is sure who still owes whom.

outcome: >-
  Everyone logs what they paid, in whatever currency they paid it, and Tarashare converts it
  at that day's rate and puts each share on the right person — including whoever is covering
  it. Settling up takes the fewest transfers possible, each with that person's GCash or Maya
  QR one tap away. The organiser pays for Pro; everyone they add uses it free, without even
  needing an account.

highlights:
  - value: "Fewest"
    label: "Payments to settle up"
  - value: "Any currency"
    label: "At the day's rate"
  - value: "689"
    label: "Automated tests"
  - value: "Nightly"
    label: "Encrypted backup"

features:
  - title: Someone can pay for others
    body: >-
      Say once who covers whom — Ana covers Mom, Ana and Ben split Dad — and every dinner,
      taxi and ticket lands on the right person, with everyone able to see who is covering
      what.
  - title: Spend in yen, see it in pesos
    body: >-
      Log each expense in the currency it was paid in. Tarashare converts it at that day's
      market rate, or at the rate the card actually charged.
  - title: Two taps and everyone is square
    body: >-
      The smallest set of payments that clears the whole group, each person's GCash or Maya
      QR one tap away, and marking one paid updates every balance.
  - title: Made for every kind of group
    body: >-
      Trips, barkada nights, school projects, households and events — each with its own
      categories, and dates only where a group actually has them.
  - title: Dues, reminders and reports
    body: >-
      Collect class dues or a household's bills into the group's fund, send a weekly reminder
      of what each person owes, and print the report or export it to Excel.
  - title: Keeps working without a signal
    body: >-
      Expenses logged on a mountain road or a plane are kept on the phone and sync when the
      connection is back.

system:
  - key: groups
    value: Every group route refuses outsiders · tested route by route
    state: ok
  - key: tests
    value: 689 automated, plus end-to-end in a real browser
    state: ok
  - key: money
    value: Integer minor units · each expense at its own date's rate
    state: ok
  - key: offline
    value: Queued on the phone · syncs on reconnect
    state: ok
  - key: backups
    value: Nightly, encrypted, to separate storage
    state: ok
  - key: sign-in
    value: Google for organisers · members can be added by name
    state: ok
  - key: billing
    value: Free and Pro plans published · payments opening soon
    state: wip

latest:
  - date: 2026-10-10
    title: An itinerary to show at immigration
    body: >-
      Print a travel itinerary with the travellers, every flight and hotel, and the plan day
      by day — no amounts, just what an immigration officer asks to see.
  - date: 2026-10-10
    title: Reminders that do the chasing
    body: >-
      Organisers can switch on a weekly email of what each member owes and a reminder before
      a collection falls due, and rent or dues can repeat on their own.
  - date: 2026-10-10
    title: Reports, budgets and spending charts
    body: >-
      Set a budget for each category, watch spending against it, and print the group's report
      or export it to Excel.

stack:
  - Next.js
  - React
  - TypeScript
  - Postgres
  - Kysely
  - Tailwind CSS
  - Resend
  - Railway

cover: ./cover.webp
gallery:
  - src: ./01-groups.webp
    alt: Tarashare's home page listing the kinds of group it handles — trips, barkada and friends, school and orgs, household and events — above six example expenses in foreign currencies, each shown in pesos
    caption: >-
      One app for every kind of group, and every expense in the currency it was paid in,
      shown in pesos at that day's rate.
  - src: ./02-covering.webp
    alt: Three boarding-pass style cards showing that Ana covers all of Mom's share, Ana and Ben split Dad's, and what Ana pays in the end
    caption: >-
      Covering: say once who pays for whom, and every expense after that lands on the right
      person.
  - src: ./03-settle.webp
    alt: Two settle-up cards, Ana paying Ben by GCash and Carla paying Ben by Maya, above six feature tiles
    caption: >-
      Settling up in a handful of transfers instead of dozens, each paid straight to the
      right person's GCash or Maya.
  - src: ./04-pricing.webp
    alt: Tarashare's pricing page, with a free plan for small groups, Pro at 49 pesos a month or 450 a year, and a table comparing the two
    caption: >-
      The organiser pays; everyone they add uses it free. Every new organiser gets 14 days of
      Pro to try it.
---

Tarashare began as a tool for the founder's own family trip — eleven people, a foreign
currency, and children paying for their parents. It opened to everyone in October 2026,
first for trips and then for every kind of group.

Only the organiser of a group pays, and only if they want Pro. Everyone else is added by
name and can log expenses and payments without signing up, which is what gets a group of
cousins or classmates to actually use it. If Pro ends, nothing is lost: the group becomes
read-only, and payments can still be recorded until everyone is square.

A group's money is its own. Each group is walled off from every other, and the tests check
every route a stranger could try. The console we run the service from shows accounts and
plans — never a group's name or what it spent.

The screens shown here are from tarashare.app's public pages; the people and amounts in
them are examples.
