---
version: 1
slug: "app-market-page-tsx"
primary_target: "app/market/page.tsx"
related_targets: ["app/page.tsx","app/market/orders/page.tsx","app/market/agent/page.tsx","app/market/business/[id]/page.tsx"]
---

# Market: the shopper side (switchboard world)

Scope: `/` (role chooser), `/market` (ask my agent, the errand log, and browse), `/market/business/[id]`, `/market/orders`, `/market/agent`. Visitor mode: **Operate**. It inherits the Switchboard world from DESIGN.md: same tokens, type, plates, lamps and cords, and the One Orange rule.

Audience and job: a shopper with a Customer Agent. They hand the agent an errand ("6 gift hampers under $480 by Friday"), watch it search the market, ask business agents for quotes and negotiate within their budget, then approve one offer. They can also browse businesses directly, review orders, and set the agent's budget and rules. Seen in the same investor demo as the owner desk, from the other side of the same deal.

Backend: endpoints arrive later. Every read and write goes through a typed `MarketApi` interface (`lib/api`) with a mock implementation now and an HTTP implementation stubbed against the expected REST/SSE endpoints.

Content truth: seeded demo shopper and businesses, labeled as demo. Payments are sandbox and confirmed only by a provider event, never by optimistic state.

## Direction contract

THESIS: You don't shop, you send your agent on an errand and watch it work. The errand runs as a live log of real events (read your request, searched the market, asked four agents, countered), and it ends in offers side by side, one of which waits for your approval. It refuses the category default of a product grid with a chat bubble bolted on.

OWN-WORLD: The Switchboard world unchanged: cool neutral panel and graphite in dark, white surfaces, Hanken Grotesk with Geist Mono figures, plates naming the agent first, lamps carrying state, flat with hairlines. The errand log is a vertical cord. Each step is a lamp on that line with a mono timestamp, and a signal travels down it as each step lands. Orange belongs only to the offer waiting for your approval and to Approve.

STORY: The shopper types a need. Their agent reads it back as constraint chips, searches, asks the right business agents, haggles, and recommends the best fit with plain reasons (within budget, arrives Thursday, verified). The shopper approves once, and payment is confirmed by the provider.

FIRST VIEWPORT: A slim top bar holds the wordmark, Ask / Browse / Orders / My agent, the agent's budget readout, Demo data, and the theme toggle. Below it, an ask box spans the page with suggestions. Then two columns: the errand log on the left (about 40%) as a vertical cord of lamps, and offers gathered on the right (about 60%), best fit first. The recommended offer is outlined in orange with its terms, fit reasons, and Approve. The browsable market starts below the fold.

FORM: Errand log (surface round, dealt lead, seed key 1757ddf2). Inherited world: Switchboard, seed key 3f7359c1.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: "errand running". After Ask, steps land one at a time down the log cord (a signal runs to each new lamp, 150–650ms). Quotes drop into the offers column as they arrive, counters update an offer's figure in place, and the recommendation settles last. On Approve, the offer's lamp turns green and the log adds "Order placed · payment pending" and then "Payment confirmed by provider (sandbox)". Reduced motion: steps appear without travel.
