---
name: Croma MNL
sector: Specialty coffee retail
status: production
order: 1
featured: true
site: https://cromamnl.com
host: app.cromamnl.com
platforms:
  - POS
  - Admin panel
  - Members' app
  - Android printer app
  - Website

summary: >-
  Everything a growing coffee company runs on — the POS, the stockroom, the payroll and a
  members' app — on one database that answers in 45 milliseconds.

problem: >-
  One cafe, growing quickly, run out of a spreadsheet and a cash drawer. Sales were written
  down twice, stock ran out halfway through a shift, and payroll took an evening with a
  calculator. Even the receipt printer needed a paid app to work at all. The first system
  was built on spreadsheets too, and on a busy afternoon it dropped roughly one request in
  three.

outcome: >-
  The whole business now runs on Postgres in Singapore: screens answer in about 45 ms
  instead of two seconds, and not one request failed in testing. A sale rings up in seconds
  and its receipt prints itself. Stock counts down by ingredient, recipes suggest their own
  price, and payroll is something you check rather than something you do. Regulars top up
  store credit, pay for orders ahead and earn points on every visit.

highlights:
  - value: "45 ms"
    label: "Median response, from Manila"
  - value: "40×"
    label: "Faster than the old system"
  - value: "0 of 125"
    label: "Requests failed in testing"
  - value: "5 apps"
    label: "One shared database"

features:
  - title: Ring up a sale, print a proper receipt
    body: >-
      Every sale prints a BIR-style invoice on the thermal printer, with the VAT worked out
      to the centavo. The Android app drives the printer itself, so there is no paid
      printing app on every device.
  - title: Know what is low before a customer does
    body: >-
      Stock comes down by ingredient as drinks are made, and voiding a sale puts the raw
      materials back. You learn you are nearly out of oat milk from a screen in the morning,
      not from a customer at two in the afternoon.
  - title: Recipes that price themselves
    body: >-
      Each drink is costed from its recipe and the shop's running costs, and the system
      suggests a selling price at the margin you set.
  - title: Payroll that is already done
    body: >-
      Shifts, hours and end-of-day readings feed straight into pay. What used to be an
      evening with a calculator is now a screen somebody checks and approves.
  - title: A members' app regulars actually use
    body: >-
      Top up store credit in a tap, pay for an order ahead, scan to pay at the counter, and
      earn points on every visit — with Silver, Gold and Platinum tiers and WiFi codes as
      rewards.
  - title: Labels, designed and printed in-house
    body: >-
      A label designer with QR codes, barcodes and dates, batch printing from a spreadsheet,
      and a second Bluetooth printer just for labels.

system:
  - key: database
    value: Postgres · Singapore, beside the API
    state: ok
  - key: response
    value: 45 ms median, measured from Manila
    state: ok
  - key: reliability
    value: 0 of 125 test calls failed · was ~1 in 3
    state: ok
  - key: migration
    value: 8,204 rows across 50 tables, checked before cutover
    state: ok
  - key: payments
    value: E-wallet and card top-ups through PayMongo
    state: ok
  - key: backups
    value: Nightly and off-site, with a tested restore
    state: ok

updates:
  - date: 2026-09-23
    title: The buying list keeps every version, and is safe with several owners editing at once
  - date: 2026-09-21
    title: A label designer with QR codes, barcodes and batch printing, on a second Bluetooth printer
  - date: 2026-09-16
    title: Receipts carry the shop's wordmark, and printer settings live on the POS
  - date: 2026-09-10
    title: Members can pay for advance orders online
  - date: 2026-09-04
    title: WiFi codes become a members' reward
  - date: 2026-09-03
    title: Scan to pay with store credit, and top-ups in two taps
  - date: 2026-09-02
    title: Recipes suggest a selling price at the target margin
  - date: 2026-08-30
    title: Instant e-wallet top-ups through PayMongo
  - date: 2026-08-20
    title: A points ledger, and Silver, Gold and Platinum membership tiers
  - date: 2026-08-15
    title: A nightly backup that leaves the building, with a tested way back
  - date: 2026-08-06
    title: Moved off spreadsheets onto Postgres — 45 ms median, no failed requests

stack:
  - Postgres
  - Supabase
  - Node.js
  - Installable web app
  - Android
  - PayMongo
  - Railway

cover: ./cover.png
gallery:
  - src: ./02-site.png
    alt: The public Croma MNL website, showing the cafe's opening hours, amenities and menu link
    caption: >-
      The public site people find in search — one of five connected surfaces, and the only
      one customers ever see.
---

Croma MNL started as one cafe in Manila and grew into five connected pieces that share one
database: the point of sale on the counter, the admin panel behind it, a members' app, the
public website, and an Android app that drives the receipt and label printers directly.

The first version ran on Google Sheets, which was fine for one shop and became the limiting
factor as the business grew. In August 2026 it moved onto Postgres in Singapore. Measured
from Manila afterwards, the median response was 45 milliseconds against roughly two seconds
before, and none of 125 test calls failed, where the old setup had been dropping about one
in three on a bad afternoon. Ten workarounds that existed only to survive the spreadsheet
were deleted, because the database now guarantees what they used to guard.

The printing app saved a running cost too. The printer previously needed a paid
third-party print service on every device; building printing into the app itself removed
the subscription entirely.
