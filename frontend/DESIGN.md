---
name: armsquare
description: Picture Signs. Every number becomes something you can see. Coins count money, boxes count items, shops count shops. Blue is your assistant, orange waits for you, green is done.
colors:
  panel: "#f5f7fa"
  panel-raised: "#eaeef3"
  surface: "#ffffff"
  surface-sunk: "#f2f4f8"
  ink: "#1c2230"
  ink-2: "#444d5f"
  ink-3: "#5f687a"
  rule: "#e2e6ec"
  rule-strong: "#c6ccd6"
  picto-empty: "#d5dae2"
  primary: "#c94a0c"
  primary-hover: "#b03f08"
  primary-press: "#973506"
  primary-ink: "#ad400a"
  on-primary: "#ffffff"
  primary-wash: "#fff0e6"
  live: "#e8590c"
  success: "#1f7a4a"
  success-wash: "#e4f4ea"
  danger: "#c42b2b"
  danger-wash: "#fbe7e7"
  info: "#2459c2"
  info-wash: "#e8effc"
  panel-dark: "#1a2230"
  panel-raised-dark: "#26303f"
  surface-dark: "#222c3b"
  surface-sunk-dark: "#1e2735"
  ink-dark: "#eef2f7"
  ink-2-dark: "#c3ccd9"
  ink-3-dark: "#9eaabb"
  rule-dark: "#313d4f"
  rule-strong-dark: "#4a586d"
  picto-empty-dark: "#3d4a5e"
  primary-dark: "#ff7a30"
  primary-hover-dark: "#ff8c4d"
  primary-press-dark: "#e86a22"
  primary-ink-dark: "#ff8a47"
  on-primary-dark: "#1a1006"
  primary-wash-dark: "#3a2214"
  live-dark: "#ff7a30"
  success-dark: "#5cc08a"
  success-wash-dark: "#15291c"
  danger-dark: "#ff6b6b"
  danger-wash-dark: "#351b1c"
  info-dark: "#8fb3ff"
  info-wash-dark: "#18233a"
typography:
  display:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.3rem + 4.6vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline-landing:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2.2vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: "2.5rem"
  title:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "2rem"
  title-sm:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: "1.75rem"
  body-lg:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: "1.75rem"
  body:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.625rem"
  body-sm:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.375rem"
  caption:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  label:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: "1.625rem"
  figure:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "2rem"
    fontFeature: "\"tnum\""
  figure-total:
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    fontFeature: "\"tnum\""
rounded:
  control: "12px"
  inset: "14px"
  card: "20px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "28px"
  "8": "32px"
  "10": "40px"
  "16": "64px"
  "20": "80px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-press:
    backgroundColor: "{colors.primary-press}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-sunk}"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "{colors.danger-wash}"
  button-quiet:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-quiet-hover:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.ink}"
  button-sm:
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "36px"
  button-lg:
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "52px"
  text-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  inset-band:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inset}"
    padding: "16px"
  question-card:
    backgroundColor: "{colors.primary-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inset}"
    padding: "16px 20px"
  decision-strip:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink-2}"
    padding: "20px 24px"
  nav-tab:
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  nav-tab-active:
    backgroundColor: "{colors.info-wash}"
    textColor: "{colors.ink}"
  mark-flag:
    backgroundColor: "{colors.primary-wash}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "28px"
  mark-pass:
    backgroundColor: "{colors.success-wash}"
    textColor: "{colors.success}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "28px"
  mark-info:
    backgroundColor: "{colors.info-wash}"
    textColor: "{colors.info}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "28px"
  mark-neutral:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.ink-2}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "28px"
  honest-tag:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  ink-link-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.panel}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
---

# Design System: armsquare

## Overview

**Creative North Star: "Picture Signs"**

Isotype picture statistics, translated into a friendly everyday app. Every number the person needs to judge becomes something they can see and count: a budget is a row of coins, an order is a row of little boxes, the shops asked are a row of shopfronts, a deal is a short picture story on one baseline. The pictograms are solid, flat and drawn in one style on one 24-unit grid. They are figures, not decoration. A sign appears only where it counts a real thing, and every row of signs comes with its key.

The ground is a soft cool white. Everything sits on white cards with generous rounding (20px) and a soft, low offset shadow. Inside a card, quieter regions are flat sunk bands (14px), never cards of their own. Three colors carry meaning and nothing else. Blue is the assistant: its pictograms, its words in the price track, links, sliders and the focus ring. Orange is reserved for the one thing waiting for the person and for their main action. Green means done, bought, paid. Roboto sets everything, numbers included, with tabular figures so amounts line up without a monospace face. Dark mode is an equal: the same token keys on a deep blue-grey ground (never black), with the orange and blue stepped brighter to hold contrast.

The voice is plain and everyday for non-technical people: "assistant", never "agent"; Decline, Ask for changes, Approve; History and Rules; "Test payment"; no IDs on screen. The world refuses both the cold control-room dashboard it replaced and the default friendly SaaS of rounded cards with spot illustrations. The pictograms count, they do not illustrate.

**Key Characteristics:**
- Solid flat pictograms (coin, box, shop, person, tag, bag) that count real quantities, each row with a printed key.
- Soft cool-white ground, white 20px cards with a soft offset shadow, flat 14px sunk bands inside them.
- Three meanings: blue the assistant, orange waiting for you and your main action, green done.
- Roboto everywhere, tabular figures for every amount; no monospace.
- Status is always words plus color.
- Light and dark built as equals from one set of token keys.

## Colors

A cool blue-grey neutral scale with three semantic hues, each tied to exactly one meaning. Every color has a dark twin under the same key with a `-dark` suffix. The dark ground is deep blue-grey and the hues step brighter there.

### Primary
- **Signal Orange** (primary): the fill of the person's main action (Approve, Buy for $X, Save) only. Hover and press step darker in light, brighter in dark; text on it is white in light and near-black (on-primary) in dark.
- **Waiting Lamp** (live): the thing waiting for the person. It is used for the waiting dot, the 2 to 3px ring around a waiting deal or offer card, the border of the landing question card, orange coins (the part of a price over the limit), the waiting shop pictogram, and the logo's lit point and line.
- **Flag Ink** (primary-ink): orange as text and icon only for a rule check that needs the person ("Spending limit: $909 is $409 over") and flag marks.
- **Flag Wash** (primary-wash): background of the question card, flagged rule checks and flag marks.

### Secondary
- **Assistant Blue** (info): the assistant's color. It covers filled pictograms the assistant counted (shops asked, prices back, coins it may spend), the assistant's name in the price track, links and disclosures, the "Start shopping" arrows on side doors, slider fill and thumb ring, slider readouts, the selected ladder rung, and the focus ring (at 55%).
- **Assistant Wash** (info-wash): the active nav tab pill, the shop avatar tile, info marks.

### Tertiary
- **Done Green** (success, success-wash): done dots, bought and paid confirmations, "Checked by armsquare", on-time delivery boxes, the ring on an offer once ordered.
- **Stop Red** (danger, danger-wash): Decline and Pause as outlined buttons, stopped dots, field errors and the error notice.

### Neutral
- **Soft Ground** (panel): the page and the bars. Never pure white, never pure black in dark.
- **Raised Ground** (panel-raised): hover fill for quiet controls, neutral marks, honest-state tags, loading skeletons.
- **Card White** (surface): every card, secondary and danger buttons, fields.
- **Sunk Band** (surface-sunk): bands inside a card (the picture-story tray, the decision strip, avatar tiles), alternate landing sections, disabled fields.
- **Ink** (ink): headings, names, amounts. Never pure black. Also fills the landing ink link-button.
- **Ink 2** (ink-2): supporting text, quiet buttons, unselected tabs.
- **Ink 3** (ink-3): hints, times, keys under sign rows, placeholders.
- **Rule** (rule) and **Rule Strong** (rule-strong): hairlines between bands and list rows; control borders.
- **Empty Sign** (picto-empty): pictograms not yet filled (coins left in a limit, empty slider track).

### Named Rules
**The Three Meanings Rule.** Orange is reserved for what waits for the person and for their main action. Blue is the assistant. Green is done. No hue appears for decoration, and none borrows another's meaning.

**The Words Plus Color Rule.** Status is always words plus color. A status dot or tinted pictogram never stands alone; the words stay ink and the dot carries the color.

## Typography

**Display Font:** Roboto (with ui-sans-serif, system-ui)
**Body Font:** Roboto
**Label/Mono Font:** none. Figures are Roboto with tabular numerals (the `.figure` primitive, `font-variant-numeric: tabular-nums`).

**Character:** One friendly, legible grotesque at a reading scale (16px body, generous 1.6 line height). Weight carries the hierarchy: bold for headings and key figures, medium for labels and buttons, regular for reading.

### Hierarchy
- **Display** (700, fluid 2.5 to 4.25rem, 1.05, -0.03em): the landing headline only, held to about 13ch.
- **Headline landing** (700, fluid 2 to 2.75rem, 1.12, -0.02em): landing section heads, sentence case, about 20ch.
- **Headline** (700, 2rem, 2.5rem line): page headings in the app ("1 deal needs you").
- **Title** (700, 1.5rem): card and deal headings, the wordmark (with -0.02em).
- **Title small** (700, 1.1875rem): section heads inside cards and side panels.
- **Body large** (400, 1.1875rem): intros and landing paragraphs, 44 to 56ch.
- **Body** (400, 1rem, 1.625rem line): running text, list rows, the price track.
- **Body small** (400, 0.875rem): keys under sign rows ("Each coin = $50"), hints, times, marks.
- **Caption** (500, 0.8125rem): honest-state tags and step captions in picture strips.
- **Label** (500, 1rem): field labels, button labels, slider labels.
- **Figure** (700, 1.5rem, tabular): slider readouts and meter totals; the decision total and offer prices step up to 2rem (figure-total).

### Named Rules
**The One Face Rule.** Roboto sets the whole site, numbers included. Amounts use tabular figures, never a monospace face.

**The No Eyebrow Rule.** No eyebrows or kickers above headings. A heading starts its section; a count sits beside it as a small pill, never above it.

## Layout

The landing page sits in a 72rem container with 16px gutters (24px from sm), under a slim 64px sticky bar (panel at 90% with a light blur) holding the wordmark, section links (lg and up), "For businesses", the ink "Start shopping" pill and the theme toggle. Sections are full-width bands alternating panel and surface-sunk, 80px vertical padding (96px from lg). The hero is two equal columns at lg, 56px apart. The headline and paragraph are top left, the two side doors bottom left, and the example errand card spans both rows on the right. Below lg the errand follows the paragraph and the doors come last.

The app (the business desk and shopping) uses the same container and gutters under a bar with the wordmark, the business name, pill tabs (Deals / History / Rules), the assistant's status and the Pause button. On Deals, a list column of deal cards grouped as "Needs you", "Your assistant is handling" and "Just finished" sits beside a sticky deal panel at lg. Below lg they stack. Rules and History are single reading columns. Spacing steps are 4, 8, 12, 16, 20, 24, 28, 32 and 40px inside surfaces, with 64 to 96px between landing sections.

### Named Rules
**The Phone Decision Rule.** On wide screens the decision buttons sit in one right-aligned row with the orange primary last. On phones they stack full width with the primary on top (column-reverse).

## Elevation & Depth

A soft, low hybrid. Cards carry one ambient offset shadow and lift to a raised shadow on hover or when they float above their section. Inside a card, depth is tonal only: sunk bands and hairline rules, no shadow. Dark mode deepens the same two shadows rather than lighting surfaces.

### Shadow Vocabulary
- **Card** (`box-shadow: var(--card-shadow)`): every card at rest, the primary button, unselected filter chips and the Pause button.
- **Raised** (`box-shadow: var(--raised-shadow)`): the landing errand card, the sticky save bar while rules are changed, and hovered link cards (with a 2px rise).
- **Slider thumb** (`box-shadow: inset 0 0 0 3px var(--info), 0 2px 6px rgb(0 0 0 / 0.2)`): the limit slider thumb.

### Named Rules
**The No Nesting Rule.** No cards nested in cards. A region inside a card is a flat sunk band (14px, surface-sunk) or a rule-divided strip, never a second shadowed surface.

## Shapes

Generous and soft. Controls are rounded at 12px, inner bands at 14px, cards at 20px, and anything small and round (status dots, marks, tags, tabs, pills, slider track and thumb) is fully round. Selection and waiting are drawn as rings outside the card (ring-2 or ring-3: live for waiting, info for selected, success for ordered), never as heavy borders. Empty states use a 2px dashed rule border. The pictograms are solid fills on a 24-unit grid with even-odd cutouts (the coin's ring, the bag's handle, the tag's hole), never outlined.

## Components

### Buttons
Big and plain. Solid orange only for the person's own main action.
- **Shape:** 12px radius; medium 44px tall with 20px sides; small 36px / 14px; large 52px / 24px. Medium (500) label with an optional leading icon.
- **Primary:** orange fill, white text (near-black in dark), card shadow. Hover and press step the orange.
- **Secondary:** card white, strong-rule border, ink text; hover darkens the border to ink-3 over the sunk band color.
- **Danger:** outlined, never filled: card white, strong-rule border, red text; hover turns the border red over the red wash. Used for Decline and Pause.
- **Quiet:** ink-2 text only; hover fills raised ground.
- **States:** 150ms color transitions on the signal ease; disabled at 45% opacity; loading swaps the icon for a spinner and keeps the label.
- **Ink link-button (landing only):** an ink-filled pill or 12px link ("Start shopping", "Open your business desk") that sends visitors into the app without spending the orange.

### Chips
- **Marks:** 28px pills, body-small medium. Flag (orange ink on wash), pass (green), info (blue), neutral (ink-2 on raised ground), danger (red). Always words.
- **Honest-state tag:** a 24px pill on raised ground, caption medium, ink-2: "Example" on every illustrative demonstration, "Test payment" on sandbox orders.
- **Filter chips:** pills; selected is ink fill with panel text, unselected is card white with card shadow.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** card white.
- **Shadow Strategy:** card at rest, raised on hover for link cards (see Elevation & Depth).
- **Border:** none; rules divide bands inside.
- **Internal Padding:** 20 to 28px (24px typical).
- **Deal card:** a link card with a 44px sunk tile holding a tinted shop pictogram, the task (bold), "with <shop>", and a status line (dot plus words). A waiting deal carries a 2px live ring; the selected deal a 3px ring.
- **Question card:** inside the landing errand, a 14px band with a 2px live border on the orange wash asking "OK to buy for $417.12?". It turns into a green-wash "Bought for you" band when the limit covers the price.

### Inputs / Fields
- **Style:** 48px tall, 12px radius, card white, strong-rule border, 16px sides. The label sits above in body medium; the hint or error sits below in body small.
- **Focus:** the border turns assistant blue with the blue focus outline flush to it; hover darkens the border to ink-3.
- **Error / Disabled:** red border and red message that says what to do next. Disabled fields fill the sunk band color with ink-3 text.

### Navigation
Pill tabs, 40px tall with 16px sides, body text. Unselected tabs are ink-2 and fill raised ground on hover. The current tab is ink, medium, on the assistant wash. Shopping uses the same pill tabs and scrolls horizontally on phones. The theme toggle is a 40px round quiet button with a moon or sun.

### Picture Signs (signature)
- **Pictograms:** six solid shapes on a 24-unit grid: coin (money), box (an item), shop, person, tag (a price), bag (shopping). Tones are assistant (blue), waiting (orange), done (green), ink, and empty.
- **Sign rows:** a counted row of one pictogram. Filled signs are in their tone and unfilled signs in empty grey, with an accessible label that says the count in words.
- **Coin row:** money counted in coins in two readings. *Spent:* blue coins are spent and grey coins are what's left of the limit. *Price:* blue coins fit inside the limit and orange coins are the part over it. The unit per coin is a round value (5, 10, 25, 50, 100, 250...) chosen to keep the row to about 20 coins, and the row always prints "Each coin = $X" beneath it.
- **Box row:** items as boxes. Above 24, one box stands for several and "Each box = N cases" is printed.
- **Price track:** "How the price moved". One row per offer, oldest first. Each row has a tag pictogram (blue for your assistant, ink for the shop), who put the price forward ("Your assistant asked for" in blue), an optional note, and the amount right-aligned in tabular figures. The latest amount is bold ink. Rows are divided by rules and land with a short rise.
- **Picture story:** a deal as five steps on one baseline (sign row over a rule, then the numbered step and one plain sentence), switchable between the shopping and business sides.
- **Limit control:** a label with its value written large in blue tabular figures, a pill slider (8px track, blue fill, 26px white thumb ringed in blue), and min and max figures beneath. The landing version drives a coin row directly ("coins decide").
- **Logo mark:** an ink rounded square holding a panel-colored well with an orange lit point and an orange line reaching out; it uses the same tokens in both themes and is also the favicon.

### Named Rules
**The Counted Sign Rule.** Every pictogram counts a real thing. A sign is a figure: if it does not stand for a countable coin, item, shop, person or price, it does not appear.

**The Printed Key Rule.** Every coin or box row prints its key ("Each coin = $50", "Each box = 5 cases", "Each box is 1 in 10 orders").

**The Scale The Unit Rule.** Large counts scale the unit rather than dropping the row. Pick the next round unit and print it.

**The Price Track Rule.** Negotiation is shown as a structured price track (who, what, how much, in order), never as chat bubbles.

**The One Orange Button Rule.** One orange primary button per decision. It goes last on wide screens and on top, full width, on phones. Destructive choices are outlined red; the rest are secondary or quiet.

### Motion
New items settle in with a short rise (land: from opacity 0 and 6px down, 220 to 260ms on the signal ease, cubic-bezier(0.22, 1, 0.36, 1)). Newly filled pictograms pop in (picto-fill: from 60% scale and 40% opacity, 200 to 220ms). Link cards rise 2px on hover over 150 to 200ms. Under reduced motion every entrance and fill settles instantly; loading spinners keep turning.

## Do's and Don'ts

### Do:
- **Do** make every number the person must judge countable: coins for money, boxes for items, shops for shops, with the key printed under the row.
- **Do** scale the unit (5, 10, 25, 50, 100, 250...) when a count is large, and print the new key.
- **Do** keep orange to what waits for the person (live rings, waiting dots, over-limit coins) and their single main action; blue for the assistant; green for done.
- **Do** pair every status color with words: a dot beside ink text, a mark with its word.
- **Do** set every amount in Roboto with tabular figures.
- **Do** order decisions Decline, Ask for changes, Approve, with Approve last on wide screens and on top, full width, on phones.
- **Do** divide the inside of a card into flat sunk bands (14px) and rule-divided strips.
- **Do** build every screen in light and dark together from the same token keys; the dark ground is deep blue-grey.
- **Do** label illustrative demonstrations "Example" and sandbox payments "Test payment" with the honest-state tag.
- **Do** write in plain everyday words: "assistant", History, Rules, no IDs.

### Don't:
- **Don't** use a pictogram as decoration or illustration; every sign counts a real thing.
- **Don't** show a coin or box row without its key, or drop a row because the count is large.
- **Don't** put eyebrows or kickers above headings.
- **Don't** nest cards in cards.
- **Don't** show negotiation as chat bubbles; use the price track.
- **Don't** place more than one orange button in a decision, or color headings orange; orange text is for flagged checks and flag marks only.
- **Don't** rely on color alone for status.
- **Don't** use a monospace face for numbers, or any face but Roboto.
- **Don't** use pure black for text or for the dark ground.
