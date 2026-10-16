---
version: 1
slug: "app-dashboard-page-tsx"
primary_target: "app/dashboard/page.tsx"
related_targets: ["app/system/page.tsx","app/dashboard/ledger/page.tsx","app/dashboard/policy/page.tsx"]
---

# Owner dashboard: the switchboard (design-system proving surface)

Scope: `/dashboard` (Lines), `/dashboard/ledger` (audit log), `/dashboard/policy` (limits and autonomy), and `/system` (the design-system reference). Visitor mode: **Operate**. Themes: light and dark as equals. Primary color pinned by the user: orange.

Audience and job: a business owner supervising their Business Agent. They see which agents theirs is talking to right now, step in only where it needs them, and can pause everything. Seen first in an investor demo on a laptop or shared screen.

Redesign feedback that drives this: the previous world (Triplicate Order Pad) didn't feel agentic, and there was too much going on. Product truth, content and functions carry over: approvals with exact binding terms, policy checks, the counterparty's view, the audit trail, limits, the autonomy ladder, the kill switch, and honest demo and sandbox labels.

Unresolved: real business category, default thresholds, currency (demo uses USD).

## Direction contract

THESIS: Your agent is a live line on a switchboard. Every negotiation is a cord patched from its home jack to another agent's jack. Most cords run quietly on their own, and the one that needs you glows orange. It refuses both the category default (sidebar, activity feed, chat bubbles between bots) and the previous world's dense paperwork.

OWN-WORLD: A quiet neutral panel (cool light grey; dark: near-black graphite), with plain white or graphite listen-in surfaces. Jacks are round sockets on small name plates: agent name, who it acts for, and a one-line note. Cords are drawn curves: graphite when the agent is handling it alone, orange only when the line is waiting for you, thin and dashed once closed. Status lamps are small dots. Signal packets travel along a cord when agents exchange a move. One humanist grotesque (Hanken Grotesk). Figures, IDs and jack numbers are set in Geist Mono. No cards-in-cards, no gradients, no glow. Raises: neutral scale with orange used only on live cords and the one waiting decision (Monochrome canon). The patch field owns the screen and everything else recedes (Catalog Sleeve). Listen-in sets the negotiation as twinned columns, us and them, around a centre rail of round keys (Centre-Rail Setting). Every jack carries a name plate and a one-line principal note (Character Roster).

STORY: In one glance the owner sees that their agent is talking to six other agents, that four lines are handled, and that one is waiting for them. They click the orange cord, listen in on the rounds, read the exact terms, and approve. The cord turns graphite, a signal runs to the other agent, and the line closes.

FIRST VIEWPORT: A slim top bar holds the wordmark, the demo business, Lines / Ledger / Policy, agent status, and Pause agent. On the left (about 58%) is the patch field: your agent's home jack plate, with cords fanning right to counterparty jacks grouped as "Waiting for you" (orange) and "Handling on its own" (graphite), plus a one-line "Closed today" count. On the right is the listen-in panel for the selected line: counterparty plate, centre-rail rounds, then the decision block with total, valid until, the one flagged check, and Void / Return for edits / Approve.

FORM: Switchboard. It was #6 on my ordered list and assigned by the roll (a re-roll after the redesign request). Seed key 3f7359c1.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: "patch through". On Approve, the orange cord cools to graphite over 200ms, a signal packet runs the cord to the counterparty's jack (about 600ms), the lamp turns green ("Order placed · sandbox"), and the line drops into Closed. The next waiting line is selected, and Undo is available for 8s. Ambient: on lines the agent handles alone, an occasional packet travels when a demo move lands (labeled demo simulation). Reduced motion: no packets, just state changes. Motion grammar: 150–250ms state, one travelling signal at a time.
