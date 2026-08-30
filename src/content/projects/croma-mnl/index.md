---
name: Croma MNL
sector: Specialty coffee retail
status: production
order: 1
featured: true

summary: >-
  Everything a growing coffee company runs on — the till at the counter, the stockroom,
  the payroll, and an app that keeps regulars coming back.

problem: >-
  One cafe, growing quickly, run out of a spreadsheet and a cash drawer. Sales were
  written down twice. Nobody knew what stock was left until it ran out halfway through
  a shift. Payroll took an evening with a calculator every fortnight. Even the receipt
  printer needed a paid app to work at all.

outcome: >-
  Staff ring up a sale in seconds and the receipt prints itself. Stock counts down as
  drinks are made, so shortages turn up on a screen instead of at the counter. Payroll
  is something you check rather than something you do. The members' app — ordering ahead
  and rewards — is built and waiting on its launch.

highlights:
  - value: "4 apps"
    label: "One shared system"
  - value: "Zero"
    label: "Printer app fees"
  - value: "Per ingredient"
    label: "Stock counted down"

features:
  - title: Ring up a sale, print a proper receipt
    body: >-
      Every sale prints a BIR-style invoice on the thermal printer, with the VAT worked
      out to the centavo. No separate printing app, and no monthly fee for one.
  - title: Know what is low before a customer does
    body: >-
      Stock comes down by ingredient as drinks are made. You find out you are nearly out
      of oat milk from the system in the morning, not from a customer at two in the
      afternoon.
  - title: Payroll that is already done
    body: >-
      Shifts, hours and end-of-day readings feed straight into pay. What used to be an
      evening with a calculator is now a screen somebody checks and approves.
  - title: A members' app, ready to launch
    body: >-
      Order ahead to skip the queue, points on every peso, and prepaid store credit — so
      the people who already like you have a reason to come back more often.

cover: ./cover.png

stack:
  - Apps Script
  - React
  - Android
  - Postgres
---

Croma MNL started as one cafe in Manila and grew into four connected pieces that share
the same information: the point of sale on the counter, a members' app, the public
website, and an Android app that drives the receipt printer directly.

That last one saved a running cost. The printer previously needed a paid third-party
print service on every device. Building the printing into the app itself removed the
subscription entirely.

The system is currently being moved onto a faster database in Singapore. The original
setup was built on spreadsheets, which was fine for one shop and became the limiting
factor as the business grew — on a busy afternoon it was dropping roughly one request
in three.
