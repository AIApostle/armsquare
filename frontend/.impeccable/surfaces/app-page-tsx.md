---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Landing: the home page (Picture Signs world)

Scope: `/`. Visitor mode: **Persuade**. Audience: business owners and shoppers equally, mostly non-technical. Actions: "Open your business desk" (`/dashboard`) and "Start shopping" (`/market`); no sign-up flow exists yet.

Proof and content: no customers, metrics, testimonials, pricing or logos exist (PRODUCT.md). Worked examples are labeled "Example".

Words: plain everyday language. "Agent" is "assistant" (your shopping assistant, your business assistant). No IDs, no "counterparty", "principal", "autonomy", "execute", "sandbox" (say "test payment"). Short sentences.

## Direction contract

THESIS: Every number becomes something you can see. Budgets are rows of coins, orders are rows of little boxes, and a deal is a short picture story on one baseline. It refuses both the cold control-room dashboard it replaces and the default friendly SaaS of rounded cards with spot illustrations.

OWN-WORLD: Isotype picture statistics translated to a friendly app. A soft cool-white ground, white rounded surfaces (12px controls, 20px cards) with soft offset shadows, and solid flat pictograms in one drawn style that count real quantities. Roboto everywhere, numbers included (tabular, never mono). Blue is the assistant's color. Orange is reserved for the one thing waiting for you and for your main action. Green means done. Dark mode is an equal, with a deep blue-grey ground.

STORY: The visitor sees their assistant at work as pictures: six hampers wanted, three shops asked, the price coming down, then one orange card asking "OK to buy for $417.12?". They learn the limit rule from coins filling a row, and pick their side.

FIRST VIEWPORT: Slim bar with the logo, a few section links, the theme toggle and "Start shopping". Left: a large Roboto headline "Your assistant does the haggling. You stay in charge.", one plain paragraph, two big side doors. Right: the example errand as a picture strip ending in the orange question card, with a coin-row limit control under it.

FORM: Picture Signs (Isotype). It was #5 on my ordered list, assigned by the roll and locked by the user. Seed key ebe3ebfb.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: "coins decide". Dragging the "buy without asking up to" control fills or empties a row of coins (one coin = $50). When the filled coins cover the offer's price, the question card turns into a green "Bought for you" card; otherwise it stays orange and asks.
