---
name: Kaha
sector: Cafes & small chains
status: building
order: 4
featured: false
platforms:
  - POS
  - Back office
  - Platform console

summary: >-
  Point of sale and back office for Philippine coffee shops — a sales invoice built to BIR
  rules on 58 mm paper, every e-wallet on one line, and payroll finished before the owner
  goes home.

problem: >-
  A POS for a small chain either costs a fortune per branch or stops dead the moment the
  connection drops. Owners with two or three shops end up running separate systems in
  each, with no way to compare them and no confidence that the numbers add up the same
  way.

outcome: >-
  One system across every branch, priced per shop. Sales carry on during an outage and
  settle by themselves when the line returns. Every invoice number comes from a locked
  counter, so a retry can never charge a customer twice. Payroll runs on the statutory
  tables, the subscription bills itself, and an owner sees all their shops in one place
  while no shop can see another's numbers.

highlights:
  - value: "767"
    label: "Automated tests"
  - value: "Keeps selling"
    label: "Through an outage"
  - value: "Per branch"
    label: "Prices and settings"
  - value: "Sealed"
    label: "Between cafes"

features:
  - title: It does not stop when the internet does
    body: >-
      Sales are taken during an outage and settle on their own once the connection is
      back. The queue closes when the POS does, not when the internet drops.
  - title: Run two shops or ten
    body: >-
      Menus, prices and settings are set once for the business and adjusted per branch,
      or per POS, only where they actually differ.
  - title: Each cafe's numbers are its own
    body: >-
      One cafe can never see another's sales. That is enforced by the database itself
      rather than trusted to every screen remembering to filter.
  - title: An invoice that cannot be charged twice
    body: >-
      Each sale takes its invoice number from a locked counter, records exactly what was
      sold, and extends a tamper-evident chain — so a retry never charges twice and an edit
      never goes unnoticed.
  - title: Payroll on the tables the law sets
    body: >-
      SSS, PhilHealth, Pag-IBIG and withholding worked out from the statutory tables, and a
      payslip that is a proper document rather than a screenshot.
  - title: Billing that collects itself
    body: >-
      Plans that include what a small cafe needs and no more, invoices with a PayMongo
      payment link, and saved cards that pay the invoice on the day it falls due.

system:
  - key: tenancy
    value: Postgres row-level security · isolation suite in CI
    state: ok
  - key: tests
    value: 767 automated, including negative controls
    state: ok
  - key: invoices
    value: Locked counter · hash-chained · retry-safe
    state: ok
  - key: money
    value: Exact centavos, VAT split the way the invoice reports it
    state: ok
  - key: payroll
    value: SSS · PhilHealth · Pag-IBIG · withholding
    state: ok
  - key: billing
    value: PayMongo links, saved cards, runs unattended
    state: ok
  - key: printing
    value: 58 mm thermal receipts
    state: wip
  - key: pos
    value: Counter screens being built
    state: wip

updates:
  - date: 2026-09-21
    title: The back office says plainly what it may not do, instead of failing
  - date: 2026-09-07
    title: A way back in for a cafe locked out of its own POS
  - date: 2026-09-07
    title: Plans that include things, so a small cafe gets a small product
  - date: 2026-08-30
    title: The documents a BIR examiner asks for, and a receipt to test the printer with
  - date: 2026-08-30
    title: Billing and charging that run without anybody pressing anything
  - date: 2026-08-27
    title: Saved cards, and an invoice that pays itself when it comes due
  - date: 2026-08-27
    title: Payroll on the statutory tables, and a payslip that is a document
  - date: 2026-08-27
    title: The books — what went out, and whether the month made anything

stack:
  - TypeScript
  - Node.js
  - Hono
  - Postgres
  - Drizzle
  - React
  - Vite
  - PayMongo
  - Railway
---

Kaha takes what was learned running Croma MNL and turns it into something any cafe can
buy, rather than a system built for one business. None of the original code carries over;
its reasoning does, and every decision that is not obvious is written down with the
alternative it beat.

It is still in development. What works today: a cafe can be provisioned, priced and
configured, it can sell, and it can pay its people. Billing, payroll and the books run.
What is still being built is the counter itself — the screens a barista taps all day and
the printing behind them.

The one guarantee everything rests on is that a cafe can never reach another cafe's rows.
That is enforced by Postgres row-level security, so it is a property of the database
rather than a promise every screen has to keep — and a suite of isolation tests, including
negative controls that must fail, proves it on every change.
