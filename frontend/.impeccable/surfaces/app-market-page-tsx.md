---
version: 1
slug: "app-market-page-tsx"
primary_target: "app/market/page.tsx"
related_targets: ["app/market/browse/page.tsx","app/market/orders/page.tsx","app/market/agent/page.tsx","app/market/business/[id]/page.tsx"]
---

# Market: the shopper side (Picture Signs world)

Scope: `/market` (ask your assistant), `/market/browse`, `/market/business/[id]`, `/market/orders`, `/market/agent` (shown as "My assistant"). Visitor mode: **Operate**. It inherits the Picture Signs world defined in the landing brief (`.impeccable/surfaces/app-page-tsx.md`) and DESIGN.md.

Audience and job: a non-technical shopper. They tell their shopping assistant what they need in a sentence, watch it ask shops for prices and haggle, then say yes to one offer. They can browse shops, see their orders, and set their assistant's money rules.

Backend: every read and write goes through `lib/api` (HTTP only, no seeded data). Payments show as paid only when the provider confirms; test payments are labeled "Test payment".

Words: "assistant", not "agent"; "shops", not "businesses" in headings; "Say yes" or "Buy this", not "Approve this instead"; no IDs.

## Direction contract

THESIS: Your shopping assistant runs an errand and shows its progress as pictures, not a log. It refuses a product grid with a chat bubble bolted on, and the old dense event log.

OWN-WORLD: Picture Signs. White rounded surfaces on a soft cool-white ground, solid pictograms that count real things (items, shops, coins), Roboto throughout, blue for the assistant, orange only for the offer waiting for you and its button, green for bought and paid.

STORY: The shopper types a need, sees it read back as simple picture chips (6 items, up to $480, by Friday), watches steps fill a picture strip (asked shops, got prices, haggled), and says yes to the recommended offer.

FIRST VIEWPORT: A friendly top bar (logo, Ask / Shops / Orders / My assistant, the coin-row budget readout, theme). A big question "What do you need?" with one large input and button. Below: progress as a same-size picture strip, and offers as large cards, the recommended one outlined in orange with a big "Buy for $X" button.

FORM: Picture Signs, inherited. Seed key ebe3ebfb.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
