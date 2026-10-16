---
name: armsquare
description: The agentic marketplace, set as a switchboard. Your agent is a live line; every negotiation is a cord patched to another agent, and only the line that needs you glows orange.
colors:
  panel: "#eeeff1"
  panel-raised: "#e6e8eb"
  surface: "#ffffff"
  surface-sunk: "#f6f7f8"
  ink: "#16181c"
  ink-2: "#4d535e"
  ink-3: "#5f6672"
  rule: "#dadce1"
  rule-strong: "#b4b8c0"
  cord: "#7d838e"
  primary: "#c94a0c"
  primary-hover: "#b03f08"
  primary-press: "#973506"
  primary-ink: "#ad400a"
  on-primary: "#ffffff"
  primary-wash: "#fbe8dd"
  live: "#e8590c"
  success: "#2f7a4f"
  success-wash: "#e1f0e7"
  danger: "#c42b2b"
  danger-wash: "#f9e1e1"
  info: "#2b4c9b"
  info-wash: "#e3e9f7"
typography:
  display:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: "2.125rem"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: "1.75rem"
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: "1.625rem"
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  body-sm:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  caption:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1.125rem"
  label:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.08em"
  figure:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.25rem"
    letterSpacing: "-0.01em"
    fontFeature: "\"tnum\""
  figure-total:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: "2.125rem"
    letterSpacing: "-0.03em"
    fontFeature: "\"tnum\""
rounded:
  control: "6px"
  plate: "10px"
  panel: "14px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-press:
    backgroundColor: "{colors.primary-press}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-sunk}"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-danger-hover:
    backgroundColor: "{colors.danger-wash}"
  button-quiet:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-quiet-hover:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.ink}"
  text-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "40px"
  home-plate:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "16px"
  line-plate:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "10px 12px 10px 20px"
  line-plate-closed:
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "10px 12px 10px 20px"
  listen-in-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "16px 20px"
  decision-strip:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink-2}"
    padding: "14px 20px"
  nav-tab:
    textColor: "{colors.ink-3}"
    typography: "{typography.body-sm}"
    padding: "0 10px"
    height: "56px"
  nav-tab-active:
    textColor: "{colors.ink}"
  mark-pass:
    backgroundColor: "{colors.success-wash}"
    textColor: "{colors.success}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "24px"
  mark-flag:
    backgroundColor: "{colors.primary-wash}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "24px"
  mark-neutral:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "24px"
  honest-tag:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "20px"
  round-key:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.full}"
    padding: "0 4px"
    height: "20px"
  round-key-latest:
    textColor: "{colors.ink}"
---

# Design System: armsquare

## Overview

**Creative North Star: "The Switchboard"**

Your agent is a live line on a switchboard. Every negotiation is a cord patched from its home jack to another agent's jack. Most cords run quietly on their own in graphite; the one line that needs the owner glows orange. The system exists so an owner can read, in one glance, how many agents theirs is talking to, which lines are handled, and which single line is waiting for them, then listen in and decide.

The world is quiet on purpose. A cool neutral panel (light grey; near-black graphite in dark) carries plain white or graphite working surfaces. Jacks are round sockets mounted on small name plates; cords are drawn bezier curves measured between real sockets; lamps are small dots; signal packets travel a cord when agents exchange a move. One humanist grotesque sets everything, and every figure, ID, jack number and amount is set in a tabular mono. Light and dark are equals: every token has both values, the OS preference wins by default, and a saved choice is applied before first paint.

This world replaced a dense paperwork metaphor that "didn't feel agentic" and had "so much going on". The patch field owns the screen and everything else recedes. Motion is a signal, not decoration: one packet travels at a time, state changes take 150 to 250ms, and reduced motion keeps the state changes and drops the packets.

**Key Characteristics:**
- Neutral panel, white or graphite surfaces, one orange that means "waiting for you".
- Cords, sockets, lamps and packets are the only illustrative vocabulary; they are drawn from live layout, never decorative.
- Hanken Grotesk for words, Geist Mono for every figure and identifier.
- Flat surfaces with hairline rules; the home plate alone carries a soft lift.
- Light and dark themes built as equals from one token set.
- One travelling signal at a time.

## Colors

A cool grey neutral scale with a single live orange; semantic greens, reds and blues appear only as status words and their washes.

### Primary
- **Switchboard Orange** (primary): the primary action button (Approve, Resume agent), the active tab underline, the focus ring, and the fill of limit sliders and meters. Hover and press step darker (primary-hover, primary-press); in dark mode the scale steps lighter and text on it turns near-black (on-primary).
- **Call Lamp** (live): the waiting state of the line itself: waiting cords (2.5px stroke), waiting socket rings and lamps, the selected waiting plate's border, the logo's lamp and cord, and the text selection tint.
- **Flag Ink** (primary-ink): orange as text, used only for flagged meaning: the flagged policy check icon and flag marks, the "Escalated" ledger decision, a validity window under one hour, and the live readout of a limit being edited.
- **Flag Wash** (primary-wash): background of flag marks only.

### Tertiary
- **Closed Green** (success, success-wash): closed lamps, the closing packet, executed outcomes, verified identity, passed checks.
- **Void Red** (danger, danger-wash): destructive actions (Void, Pause agent) as outlined buttons, blocked outcomes, field errors.
- **Owner Blue** (info, info-wash): owner actions in the ledger and their marks; nothing else.

### Neutral
- **Switchboard Panel** (panel): the page and top bar; the field cords are drawn on. Also the socket well.
- **Raised Panel** (panel-raised): hover fill for quiet controls, neutral marks.
- **Listen-in White** (surface): plates, listen-in panel, ledger and policy surfaces, secondary buttons.
- **Sunk Strip** (surface-sunk): the summary and decision strips inside the listen-in panel; secondary button hover; disabled fields.
- **Ink** (ink): headings, names, amounts, the waiting status line. Never pure black.
- **Ink 2** (ink-2): secondary text, plate topics, talking lamps, section heads on Ledger and Policy.
- **Ink 3** (ink-3): metadata, principal lines, jack numbers, plate status lines, labels.
- **Rule** (rule) and **Rule Strong** (rule-strong): hairlines and plate edges; strong rules for control borders, the centre rail, idle socket rings.
- **Graphite Cord** (cord): every line the agent handles on its own.

### Named Rules
**The One Orange Rule.** Orange as fill or stroke appears only on waiting cords and sockets, the selected waiting plate's border, the primary action, the active tab underline, and control affordances (focus ring, slider and meter fill). Status text, headings and round keys stay ink. Orange text (primary-ink) is reserved for flagged meaning.

**The Lamp Carries State Rule.** Plate status lines are ink-3 (waiting: ink, semibold); the lamp alone carries the state color. Words plus lamp, never color alone.

**The One Primary Rule.** Each decision has exactly one primary button, and it is placed last.

## Typography

**Display Font:** Hanken Grotesk (with ui-sans-serif, system-ui)
**Body Font:** Hanken Grotesk
**Label/Mono Font:** Geist Mono (with ui-monospace), tabular figures

**Character:** A single humanist grotesque at a compact product scale (ratio about 1.2, 15px body), with a tabular mono for anything you might compare, copy or audit. Headings are bold with slight negative tracking; there is no separate display face.

### Hierarchy
- **Display** (700, 1.75rem, 2.125rem line, -0.02em): page headings ("Talking to 5 agents", "Ledger", "Policy").
- **Headline** (700, 1.375rem, 1.75rem line, -0.015em): the listen-in task heading.
- **Title** (700, 1.125rem): wordmark and reference-sheet section heads. Plate names are bold at body (home plate) or body-sm (line plates).
- **Body** (400, 0.9375rem, 1.5rem line): running text; intros cap at 62ch.
- **Body small** (400, 0.8125rem, 1.25rem line): plate topics, listen-in meta, check details, tabs, section heads on Ledger and Policy (semibold, ink-2).
- **Caption** (400 or 600, 0.75rem): principal lines, plate status lines, notes, hints, marks.
- **Label** (600, 0.6875rem, 0.08em, uppercase, ink-3): column heads ("Your agent" / counterparty above the rounds) and figure labels ("Total, USD") only.
- **Figure** (Geist Mono, tabular, -0.01em): amounts, times, jack numbers, agent IDs, round keys. The decision total sets at 1.75rem semibold, -0.03em.

### Named Rules
**The No Eyebrow Rule.** Nothing sits above a heading as a kicker or eyebrow. Uppercase label type is for column heads and figure labels only; section heads are sentence case.

**The Mono Means Figure Rule.** Every number, ID, time and jack number is set in Geist Mono with tabular figures; words never are.

## Layout

The dashboard is a top bar plus a two-column desk inside a 1440px container (16px gutters, 24px from sm). The sticky top bar (56px, panel background, bottom rule) holds the wordmark, the business name with its honest-state tag, the Lines / Ledger / Policy tabs, agent status and the kill switch, and the theme toggle. Below sm the tabs drop to a 44px second row; below md the business, tag and agent status move to a strip at the top of main.

On Lines, the patch field takes about 57% (1.3fr) and the listen-in panel the rest (1fr), 32px apart at lg; the listen-in panel is sticky. Inside the field, three columns: the home plate (200px), the cord gap (at least 48px), and the line plates (up to 312px), grouped as "Waiting for you" then "Handling on its own" with 20px between groups and 8px between plates. Below md the field stacks and cords are not drawn across columns. Ledger and Policy sit in a 56rem column.

The listen-in panel is a stack of rule-divided bands at 20px inset: header, the centre-rail rounds (two text columns either side of a 40px rail), the terms and total, why it's asking, and the decision strip. Spacing steps are 4, 8, 12, 16, 20, 24 and 32px.

### Named Rules
**The Field Owns The Screen Rule.** The patch field is the largest region of the first viewport; everything else recedes into the bar, the panel or a footer line.

## Elevation & Depth

Flat with hairlines. Depth comes from the panel/surface value step and 1px rules. Line plates and the listen-in panel carry no shadow; the listen-in panel is set off by a strong rule. Only the home plate is lifted, because it is the fixed jack the cords leave from. Sockets are inset wells (a 1.5px inset ring on the panel color) and packets carry a 3px panel-colored ring so they read as cut out of the cord, not glowing.

### Shadow Vocabulary
- **Plate lift** (`box-shadow: var(--plate-shadow)`; light `0 1px 2px rgb(22 24 28 / 0.06), 0 6px 18px -10px rgb(22 24 28 / 0.18)`, dark `0 1px 2px rgb(0 0 0 / 0.5), 0 8px 20px -12px rgb(0 0 0 / 0.8)`): the home plate.
- **Socket well** (`box-shadow: inset 0 0 0 1.5px var(--rule-strong)`, live when waiting or set): every socket.
- **Packet knockout** (`box-shadow: 0 0 0 3px var(--panel)`): signal packets.
- **Thumb lift** (`box-shadow: inset 0 0 0 2px var(--primary), 0 1px 3px rgb(0 0 0 / 0.2)`): the limit slider thumb.

### Named Rules
**The No Glow Rule.** No blurred colored halos, no smooth decorative gradients. The only gradient in the build is the hard-stop fill of a slider track.

## Shapes

Three nested radii and a pill. Controls are gently rounded (control, 6px), plates are a step softer (plate, 10px), working panels softer again (panel, 14px). Everything round in the world is fully round (full, 999px): sockets, lamps, packets, round keys, marks, honest-state tags, slider tracks and thumbs, meter bars. Borders are 1px; honest-state tags use a dashed border; closed cords are dashed (2 5) at 70% opacity. Cords are 1.75px graphite, 2.5px when waiting, 3.5px when selected, with round caps.

## Components

### Buttons
Plain and certain: solid only when it is your action.
- **Shape:** gently rounded (6px), 40px tall with 16px sides; small is 32px with 12px sides. Semibold label, optional 16px leading icon.
- **Primary:** orange fill, white text (near-black in dark). Hover and press step the orange. One per decision, placed last.
- **Secondary:** surface fill, strong-rule border, ink text; hover darkens the border to ink-3 and fills surface-sunk.
- **Danger:** outlined, never filled: surface fill, strong-rule border, red text; hover turns the border red with a red wash. Used for Void and Pause agent.
- **Quiet:** text only in ink-2; hover fills panel-raised.
- **States:** 150ms color transitions on the signal ease; disabled at 45% opacity; loading swaps the icon for a spinner and keeps the label.

### Chips (marks and tags)
- **Marks:** 24px pills, caption semibold, word plus color always (pass green, flag orange-ink, info blue, neutral ink-2 on panel-raised, danger red).
- **Honest-state tag:** 20px pill with a dashed ink-3 border, 11px semibold, 0.04em tracking ("Demo data", "Agent activity is simulated in this demo").

### Cards / Containers
- **Line plate:** a button-plate (10px), 1px rule border, surface fill, 10px/12px padding with 20px on the socket side. Content order: the other agent's name (bold) with the jack number right (mono, ink-3), "for <principal>" (caption, ink-3), the task (body-sm, ink-2), then the status line. Selected waiting: live border. Selected other: ink-3 border. Closed: transparent fill, surface on hover.
- **Home plate:** your agent's name, its principal note, its ID in mono; lifted with plate lift; its socket sits on the edge facing the cords.
- **Surface:** 14px radius, 1px rule, no shadow; ledger lists and policy groups are surfaces divided by rules.

### Inputs / Fields
- **Style:** 40px, 6px radius, surface fill, strong-rule border, 12px sides; label above in body-sm semibold, hint or error below in caption.
- **Focus:** border turns orange with the 2px orange focus outline flush to it. Hover darkens the border to ink-3.
- **Error / Disabled:** red border and red caption; disabled fills surface-sunk with ink-3 text.

### Limits
Every limit shows its value as a mono readout. Meters are 4px pill bars (rule track, orange fill), never rings. The editable control pairs a pill slider with a live orange-ink readout.

### Navigation
Text tabs in body-sm semibold, ink-3 at rest, ink on hover. The current tab is ink with a 2px orange underline sitting on the bar's bottom rule. The kill switch sits at the right of the bar as an outlined danger button ("Pause agent"); paused, it becomes the primary "Resume agent" and the patch field drops to 60% opacity in greyscale.

### Switchboard (signature)
- **Sockets:** 18px wells with an 8px lamp. Lamp states: talking (ink-2), waiting (live, with a live ring), closed (success), set (live, used for the current autonomy level), off. Only the selected waiting socket calls: three 1.6s pulses, then holds steady.
- **Cords:** bezier curves measured from the home socket to each line socket and re-measured on resize. Graphite when handled, orange when waiting, dashed once closed; unselected cords can dim to 35%.
- **Packets:** 8px ink dots that travel a cord in 650ms on the signal ease (outbound from your agent, inbound reversed); green when a line closes. One packet on the board at a time.
- **Centre rail:** rounds sit in two columns, your agent right-aligned on the left, the counterparty on the right, either side of a 1px strong rule carrying mono round keys (R1, R2...) as 20px pills; the latest key gets an ink-3 border and ink text. New rounds land with a 260ms 4px rise.
- **Patch through:** on a decision the terms revalidate (about 450ms), the cord cools and a packet runs to the counterparty, the lamp turns green, the line holds closed for 1.5s, then the next waiting line is selected. Undo stays available for 8s. Older closed lines roll into "closed earlier today".
- **Ambient simulation:** one move lands on a handled line at a time (about every 4.2s), handled lines close on their own, new agents patch in to keep three handled lines, and the board carries an honest "simulated" tag.

## Do's and Don'ts

### Do:
- **Do** keep orange to waiting cords and sockets, the selected waiting plate border, the primary action, the active tab underline, and control affordances (focus, slider and meter fill).
- **Do** keep plate status lines ink-3 (waiting: ink, semibold) and let the lamp alone carry state color.
- **Do** order plate content as the other agent first, then "for <principal>", then the task, then the status.
- **Do** run one travelling signal at a time, with state changes at 150 to 250ms on the signal ease (cubic-bezier(0.22, 1, 0.36, 1)).
- **Do** order decision actions Void, Return for edits, Approve, with the single primary last and destructive actions outlined.
- **Do** set every figure, ID, time and jack number in Geist Mono with tabular figures.
- **Do** build every screen in light and dark together from the same tokens.
- **Do** label demo data, sandbox payments and simulated activity with the dashed honest-state tag.

### Don't:
- **Don't** put eyebrow labels or kickers above headings; uppercase label type is for column heads and figure labels only.
- **Don't** color status text, headings or round keys orange.
- **Don't** add glows, blurred colored halos or decorative gradients.
- **Don't** nest cards inside cards; divide a working panel into bands with rules instead.
- **Don't** run two packets on the board at once, or animate a cord that is not exchanging a move.
- **Don't** draw meters as rings; limits are thin pill bars with figures.
- **Don't** use pure black for text or the dark panel.
