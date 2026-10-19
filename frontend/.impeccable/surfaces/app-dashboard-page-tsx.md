---
version: 1
slug: "app-dashboard-page-tsx"
primary_target: "app/dashboard/page.tsx"
related_targets: ["app/system/page.tsx","app/dashboard/ledger/page.tsx","app/dashboard/policy/page.tsx"]
---

# Business desk (Picture Signs world)

Scope: `/dashboard` ("Deals"), `/dashboard/ledger` ("History"), `/dashboard/policy` ("Rules"), and `/system` (the design-system reference). Visitor mode: **Operate**. It inherits the Picture Signs world defined in the landing brief (`.impeccable/surfaces/app-page-tsx.md`) and DESIGN.md.

Audience and job: a non-technical business owner supervising their business assistant. They see what it is handling, answer the few things that need them, and can pause it.

Backend: reads and writes through `lib/api/business.ts` (HTTP only, no seeded data).

Words: "assistant" not "agent"; "Deals" not "Lines"; "History" not "Ledger"; "Rules" not "Policy"; Decline / Ask for changes / Approve instead of Void / Return for edits / Approve; "the other side" instead of counterparty; no IDs or jack numbers; "How much it does on its own" instead of autonomy.

## Direction contract

THESIS: The desk answers one question at a glance: does anything need me? Deals waiting for you sit first as big orange cards; everything your assistant is handling alone is a calm list. It refuses the switchboard of cords and sockets it replaces, and the generic admin dashboard.

OWN-WORLD: Picture Signs. White rounded cards on a soft ground, solid pictograms counting real things, Roboto throughout, blue for the assistant, orange only for what waits for you and your main action, green for done.

STORY: The owner sees "1 deal needs you", opens it, reads it as plain sentences with a picture of what's being bought or sold and coins against their limit, and approves, declines or asks for changes.

FIRST VIEWPORT: Top bar with the logo, the business name, Deals / History / Rules, the assistant's status and a clear Pause button. Then a big status sentence, a "Needs you" row of orange deal cards, and a "Handled by your assistant" list. The chosen deal opens beside the list on wide screens and below it on phones.

FORM: Picture Signs, inherited. Seed key ebe3ebfb.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
