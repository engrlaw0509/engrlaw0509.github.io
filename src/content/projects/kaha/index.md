---
name: Kaha
sector: Cafes & small chains
status: building
order: 4
featured: false

summary: >-
  A cafe point of sale built to run more than one branch — and to keep selling when the
  internet does not.

problem: >-
  Tills for small chains either cost a fortune per branch or stop dead the moment the
  connection drops. Owners with two or three shops end up running separate systems in
  each, with no way to compare them and no confidence that the numbers add up the same
  way.

outcome: >-
  One system across every branch, priced per shop. Sales carry on during an outage and
  settle by themselves when the line returns. An owner sees all their shops in one place,
  and no shop can see another's numbers.

highlights:
  - value: "Keeps selling"
    label: "Through an outage"
  - value: "Per branch"
    label: "Prices and settings"
  - value: "Sealed"
    label: "Between branches"

features:
  - title: It does not stop when the internet does
    body: >-
      Sales are taken and receipts print during an outage, then settle on their own once
      the connection is back. The queue closes with the till, not with the internet.
  - title: Run two shops or ten
    body: >-
      Menus, prices and settings are set once for the business and adjusted per branch
      only where they actually differ.
  - title: Each shop's numbers are its own
    body: >-
      One branch can never see another's sales. That is enforced by the database itself
      rather than trusted to be right.
  - title: Receipts that satisfy the BIR
    body: >-
      Prices are held to the exact centavo with the VAT split a sales invoice has to
      report, so what prints on the receipt matches what goes in the books.

stack:
  - TypeScript
  - Postgres
  - React
---

Kaha takes what was learned running Croma MNL and turns it into something any cafe can
buy, rather than a system built for one business.

It is still in development. What works today: a cafe can be set up, its menu and prices
configured, and sales can be taken through a full shift. What is still being built is
everything around the edges of that — the reporting an owner wants at the end of a month,
and the back-office tools that make running several branches genuinely easier than
running one.
