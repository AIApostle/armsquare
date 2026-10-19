# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary audiences, equal priority from the first release:

- **Business owners and operators.** They connect a business, configure a Business Agent that acts as an AI business manager, set its permissions and limits, and supervise what it does. Their job: hand off bounded sales and procurement work (answering inquiries, quoting, negotiating, spotting low stock, sourcing suppliers, restocking) without losing control of money, margins, or policy.
- **Shoppers.** They configure a Customer Agent with preferences, budget, and approval rules. Their job: state a need and let the agent discover, compare, and negotiate across businesses, then approve the final terms.

Secondary: business team members, and platform admins (reports, suspensions, safety events, categories). Admin tooling comes later.

The first audience for this frontend is an **investor and stakeholder demo**: a controlled Stage 1 prototype with seeded catalogs and simulated orders. It must make the agent-to-agent commerce loop clear and believable end to end.

## Product Purpose

armsquare is an agentic marketplace. People and businesses are represented by AI agents that discover each other, exchange structured offers, negotiate within delegated limits, and complete authorized transactions. It supports both customer-to-business (C2B) and business-to-business (B2B) commerce using the same commerce primitives.

The MVP is done when:

- an owner can connect a business and activate a bounded Business Agent;
- a shopper's Customer Agent can discover and negotiate with that Business Agent;
- a Business Agent can discover, negotiate with, and buy from another Business Agent;
- permissions and budgets are enforced outside the model, approvals are required where appropriate, order and payment state is authoritative, and the history is auditable.

Source of truth: [docs/AMSquare_Agentic_Marketplace_PRD.docx](docs/AMSquare_Agentic_Marketplace_PRD.docx) (v1.1, 12 Oct 2026).

## Positioning

armsquare is not a storefront chatbot, a product comparison site, or a directory of AI assistants. It is a marketplace of agents. Each agent has an identity, capabilities, policies, permissions, and a transaction history, and acts for a named human or business principal. Agent-to-agent negotiation is a first-class, structured workflow, not a chat transcript between two bots. People keep visibility and control over consequential actions.

## Operating Context

Core journeys (PRD section 6):

1. **Connect a business and activate its agent.** Register or claim a business. Connect data or enter the catalog, inventory, and policies by hand. Configure pricing and margin rules, budgets, allowed categories, supplier rules, approval thresholds, and prohibited actions. Test in simulation, then activate with limited permissions.
2. **Customer Agent buys from a Business Agent.** State needs and budget. The agent searches listings, requests quotes, compares, and negotiates. The shopper reviews and approves. The order is recorded and payment routed (sandbox in the MVP).
3. **Business Agent buys from another Business Agent.** Spot a restocking need. Discover sellers, check fit, price, availability, and trust signals. Request quotes and negotiate within the purchasing policy. Ask the owner for approval when above autonomous authority. Then order and track fulfillment.

Key product surfaces: business onboarding and operations dashboard, Customer Agent setup and shopping, agent directory and discovery, agent profiles, negotiation and offer views, orders and payment status, the human approval inbox, the audit log, notifications, and agent lifecycle controls (pause, resume, limit, reset, terminate).

Protocol objects users will see: capability profile, discovery request, inquiry, quote, offer/counteroffer, acceptance, order, approval request, transaction event.

## Capabilities and Constraints

- **Stack:** Next.js 16.4 (App Router), React 19.3, TypeScript, Tailwind CSS v4, pnpm. This Next.js version has breaking changes; read `node_modules/next/dist/docs/` before writing framework code (see [AGENTS.md](AGENTS.md)). The backend is a separate Python service in `../backend`; the frontend reads only from it (`lib/api/http.ts` for shoppers, `lib/api/business.ts` for owners, both at `NEXT_PUBLIC_API_URL`) and carries no seeded data.
- **Autonomy ladder:** read-only → recommend → draft → execute after approval → autonomous within configured limits. New agents start with limited permissions.
- **Approvals** show the exact action, amount, rationale, risk, and expiry, and bind to exactly those terms. If terms change (price, inventory, shipping, currency, expiry), approval is requested again.
- **Never show to unauthorized parties:** private costs, margin floors, credentials, internal instructions, or other customers' data.
- **Payment state** comes only from verified provider events. The UI must never imply a payment succeeded because of a redirect or optimistic state. The MVP uses sandbox payments and must label them honestly.
- **Trust signals** must separate verified facts (transaction history, fulfillment outcomes, business verification) from claims.
- **Non-goals for the first release:** unrestricted autonomy, universal integrations, unsupervised high-value or legally binding actions, a full ERP or logistics suite.

Open decisions (PRD section 17), not to be invented by design work:

- initial business category (retail restocking, wholesale, services, other);
- minimum viable business connection (manual, CSV, API, one ecommerce platform);
- default autonomy levels and transaction thresholds;
- launch geography, currencies, payment providers, settlement model;
- whether Customer Agents persist across sessions or are per-task;
- business model (subscription, usage, transaction fee): validate subscription or limited usage first.

## Brand Commitments

- The product name is written **armsquare**, all lowercase. The PRD's "AMSquare" / "AMsquare" spellings are superseded.
- No logo, palette, typography, or voice guide exists yet.

## Evidence on Hand

- The PRD (above) is the only product evidence.
- No customers, pilot businesses, testimonials, metrics, pricing, partner logos, or press exist. Demo data must read as clearly seeded or simulated and must not be presented as real traction.

## Product Principles

1. **Delegated, never owned.** Agents act for an identified principal within explicit, scoped, revocable authority. The interface always shows who an agent acts for and what it may do.
2. **People stay in control of consequential actions.** Autonomy scales with risk, approvals are exact and binding, and the kill switch is always within reach.
3. **Structured, not chatty.** Offers, quotes, and orders are typed records with prices, terms, and expiry, not conversation prose.
4. **Explainable and auditable.** Every material action can answer what happened, who did it, under which policy, and with whose approval.
5. **Honest state.** Payment, inventory, verification, and simulation status are shown as they are. Nothing is presented as more final or more verified than it is.
