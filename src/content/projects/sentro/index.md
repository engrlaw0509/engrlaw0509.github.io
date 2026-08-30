---
name: Sentro
sector: Insurance & financial advice
status: production
order: 2
featured: true

summary: >-
  One place for a financial advisor's whole practice — every client, every policy, every
  renewal — plus a portal where clients look up their own cover.

problem: >-
  An advisor's book of business lives across a spreadsheet, a phone's contacts and their
  own memory. Renewals slip because nobody was watching the date. Clients ring to ask
  what they are actually covered for, and answering means digging through old email for
  a PDF.

outcome: >-
  Every client and policy sits in one place, with renewals surfacing before they lapse.
  Clients log in and read their own cover without ringing anyone. And an agency owner can
  finally see the whole team's book at once instead of asking each agent for a
  spreadsheet.

highlights:
  - value: "One book"
    label: "Clients and policies"
  - value: "Self-serve"
    label: "Client policy portal"
  - value: "Any insurer"
    label: "Not tied to one"

features:
  - title: Your whole book in one place
    body: >-
      Clients, policies, premiums and renewal dates together — so nothing important
      depends on someone remembering it.
  - title: Clients answer their own questions
    body: >-
      They sign in and see their policies, what is covered and when payments are due.
      That quietly removes most of the calls that begin "quick question".
  - title: Works whoever you write for
    body: >-
      Not tied to a single insurer. If you place business with several, it holds all of
      it — presented under your own agency's name and branding.
  - title: An owner can see the whole team
    body: >-
      Managers see their team's book, agents see their own, and one agency can never see
      another's clients.

stack:
  - Next.js
  - TypeScript
  - Postgres

cover: ./cover.png
gallery:
  - src: ./01-contacts.png
    alt: Sentro's contact list, showing every client with their stage, policy count and last contact date
    caption: >-
      Everyone in the book on one screen — leads, prospects, clients and lapsed — with
      who owns each relationship and when they were last spoken to.
  - src: ./02-analytics.png
    alt: Sentro's analytics screen with premium charts, a pipeline funnel and a producer leaderboard
    caption: >-
      Results and activity kept separate on purpose. An agent can lead on premium written
      and still be behind on appointments held, and an owner needs to see both.
  - src: ./03-calendar.png
    alt: Sentro's calendar of client appointments and policy reviews
    caption: Reviews, claim assistance and follow-up calls, scheduled against the client they belong to.
---

Sentro is sold as a monthly subscription to advisors rather than to insurers, which is
why it stays independent of any one company. An advisor who writes business with three
different insurers keeps all of it in the same place, and the client sees their own
agency's branding rather than ours.

The part that took the most care is the wall between agencies. A practice's client list
is the most valuable thing it owns, and several practices share the same system. Nothing
is visible across that line, and the rules that enforce it are tested against a real
database before anything is released.
