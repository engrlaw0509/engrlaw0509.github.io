---
name: EA Builders
sector: Construction & design-build
status: production
order: 3
featured: true

summary: >-
  The system a builder runs projects on — schedule, site crew, attendance, payroll and
  materials — with a portal where the client watches their own build.

problem: >-
  Projects tracked on a whiteboard and a group chat. Attendance written in a notebook on
  site, typed into a spreadsheet that evening, then typed again into payroll. Materials
  counted by walking around and looking. And clients ringing every week to ask how their
  build was going.

outcome: >-
  One board shows every project and what is holding up the finish date. The crew marked
  present on site becomes the pay run with nobody re-typing anything. Materials and
  machines are traceable to the project holding them. And clients check progress
  themselves, with photographs, instead of ringing the office.

highlights:
  - value: "Site to payslip"
    label: "Nothing re-typed"
  - value: "6 per page"
    label: "Payslips printed"
  - value: "Per project"
    label: "Profit tracked live"

features:
  - title: See every project at once
    body: >-
      Projects grouped by stage, with a schedule that shows which task is actually
      holding the completion date rather than just listing everything.
  - title: Attendance becomes payroll
    body: >-
      The crew is marked present on site and that fills the pay run directly. Casual
      workers can be paid without being added to the permanent roster, and payslips print
      six to a page at the end of the period.
  - title: Know where your materials and machines are
    body: >-
      A company catalogue plus what is sitting on each site, so any pallet of tiles or
      piece of plant can be traced to the project holding it.
  - title: Is this job still making money?
    body: >-
      Each project reports its own profitability as costs land — while there is still
      time to do something about it, rather than at the end.
  - title: Clients stop ringing for updates
    body: >-
      They sign in to their own project and see the timeline, site photographs, documents
      and the payment schedule.

stack:
  - Next.js
  - TypeScript
  - Tailwind CSS

cover: ./cover.png
gallery:
  - src: ./01-timeline.png
    alt: The client portal's timeline, listing every milestone from contract signing to turnover with planned and actual dates
    caption: >-
      Every milestone with the date it was planned for and the date it actually happened.
      When something slips, the reason sits next to it rather than arriving as a phone call.
  - src: ./02-payments.png
    alt: The payment schedule, showing contract total, paid to date, outstanding balance and each milestone payment
    caption: >-
      What has been paid, what is owed, and what triggers the next invoice. The page states
      plainly that it will never ask for card or bank details.
  - src: ./03-admin.png
    alt: The builder's own view, listing projects by stage alongside the staff roster and their sign-in codes
    caption: >-
      The builder's side: projects grouped by stage, and the roster where each person gets
      their own sign-in code so every site update is correctly attributed.
---

EA Builders came to us with no logo, no colours and no typeface — so the whole visual
identity was designed from nothing alongside the software.

The system grew outwards from one problem. Attendance was being recorded three times: on
paper at the site, in a spreadsheet that evening, and again in payroll at the end of the
period. Fixing that one chain meant the roster, the projects and the pay run all had to
know about each other, and once they did, the rest — materials, plant, project
profitability, the client portal — followed naturally from the same information.
