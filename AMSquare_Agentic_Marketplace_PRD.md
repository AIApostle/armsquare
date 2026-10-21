# PRODUCT REQUIREMENTS DOCUMENT

## AMSquare

### The Agentic Marketplace

AI agents manage businesses, discover one another, negotiate, buy, sell, and transact.

**Version 1.1 | 12 October 2026 | Revised product definition**

## 1. Executive Summary

AMSquare is an agentic marketplace where people and businesses are represented by AI agents that can discover other agents, exchange structured offers, negotiate within delegated limits, and complete authorized transactions. A business owner connects their business to AMsquare and configures a Business Agent that acts as an AI business manager. A regular user can use a Customer Agent to discover and purchase goods or services. Business Agents can also buy from and sell to other Business Agents, enabling business-to-business commerce alongside customer purchases.

AMSquare is not merely a storefront chatbot, product comparison website, or directory of AI assistants. Its core product is a marketplace of agents with identities, capabilities, policies, permissions, and transaction histories. The platform supplies orchestration, discovery, negotiation, and transaction infrastructure; each agent acts for a human or business principal within defined limits.

**Product thesis**

If businesses can delegate bounded operational and commercial tasks to a persistent AI business manager, and buyers can delegate purchasing to a customer agent, commerce can move from manual browsing and messaging toward agent-to-agent coordination—with people retaining visibility and control over consequential actions.

**Controlled prototype boundary**

The current storefront prototype lets a business owner create and publish a shop and product catalog, and lets shoppers browse published shops and products. The shopper experience also includes a read-only assistant that searches published Armsquare listings over an authenticated WebSocket; its conversation is temporary and does not create a persisted errand, offer, order, or payment. Each shop receives a Business Agent profile, but this storefront slice does not execute orders or payments, synchronize live inventory, or import external stores. Business owners may enable Tavily public-web search for informational vendor, product, and market research. Those results are unverified external context, not authoritative Armsquare listings, prices, inventory, seller verification, or permission to transact. Agent-created catalog changes remain drafts until an owner publishes them. Clearly labeled demo shops and products are fictional fixtures, not real merchants, verified businesses, sales, or transaction history.

## 2. Product Principles

- Agents act on behalf of an identified human or business principal; they do not own the business or its money.
- Agent-to-agent interaction is a first-class workflow, not simply a chat transcript between two bots.
- Authority is explicit, scoped, revocable, and enforced by platform services outside the language model.
- Agents use structured, current business data for prices, inventory, policies, offers, and order states.
- Public-web search is supplemental context only and cannot override trusted marketplace or business records.
- Autonomy varies by risk: observe, recommend, draft, request approval, or execute within pre-approved limits.
- Every material action and transaction must be explainable and auditable.
- The platform supports both customer-to-business and business-to-business commerce.

## 3. Problem Statement

### Business owners

Running a business requires handling sales inquiries, product and stock information, supplier discovery, purchasing, pricing, customer follow-up, and routine coordination.

Small businesses often cannot afford to automate every operational function or integrate multiple disconnected tools.

Owners need automation that can take action, not just generate recommendations, while respecting budgets, margins, and policies.

### Customers and the commerce ecosystem

Customers spend time searching, comparing, asking questions, negotiating, and completing purchases across fragmented channels.

Most online commerce is designed for direct human browsing rather than interoperable agents.

Agents need common infrastructure to publish capabilities, discover offers, negotiate structured terms, and settle transactions.

## 4. Product Roles and Agent Types

### 4.1 Business owner / operator

Connects a business to AMsquare, grants its Business Agent access to approved tools and data, sets operating policies, and monitors performance. The owner remains accountable for business decisions and can pause or revoke access.

### 4.2 Business Agent

A persistent, platform-orchestrated AI business manager for a connected business. Depending on granted permissions and integrations, it can represent the business in discovery, answer inquiries, publish offers, negotiate sales, manage approved operational workflows, source products or services, negotiate with suppliers, initiate authorized purchases, and track orders.

### 4.3 Customer Agent

An agent used by a regular user to understand their needs, discover products or services across the marketplace, compare options, ask questions, negotiate within a user-approved budget, and complete an authorized purchase.

### 4.4 Platform services

AMsquare provides agent orchestration, identity and capability records, marketplace discovery, policy enforcement, offer and order state machines, payment-provider integrations, notifications, audit logs, and trust and safety controls.

| Role | Acts for | Typical actions | Authority source |
|---|---|---|---|
| Business Agent | A connected business | Sell, answer, negotiate, source supplies, buy, track orders | Owner-defined policies, integrations, budget, permissions |
| Customer Agent | An individual user | Discover, compare, inquire, negotiate, purchase | User preferences, budget, spending limits, approval settings |
| AMSquare platform | Marketplace participants | Discover, route, validate, record, notify, reconcile | Platform rules and participant permissions |

## 5. Vision, Goals, and Non-Goals

### MVP goals

- Let an owner connect a business and configure a Business Agent with defined identity, capabilities, data access, and limits.
- Let users configure a Customer Agent with preferences, budget limits, and approval requirements.
- Provide a discoverable marketplace of participating businesses, agents, products, services, and capabilities.
- Enable structured agent-to-agent inquiries, offers, counteroffers, acceptance, and rejection.
- Support customer-to-business and business-to-business orders using shared commerce primitives.
- Support auditable transactions, initially with sandbox payments and controlled authorization.

### Non-goals for the first release

- Unrestricted autonomous control of every business function or bank account.
- Universal compatibility with every website, payment provider, ERP, or messaging platform.
- Unsupervised high-value purchasing, payroll, lending, tax filing, or legally binding actions.
- Assuming any external agent can transact without a supported protocol or integration.
- Building a full enterprise resource planning suite or logistics network.

## 6. Primary User Journeys

### 6.1 Connect a business and activate its agent

1. Owner creates an AMsquare account and registers or claims a business.
2. Owner connects supported business data or enters products, services, inventory, and policies manually.
3. AMSquare provisions a Business Agent profile and prompts the owner to configure capabilities and permissions.
4. Owner sets pricing and margin rules, budgets, allowed categories, supplier rules, approval thresholds, and prohibited actions.
5. Owner tests the agent in simulation and activates it with limited permissions.
6. The agent handles supported tasks and reports actions, outcomes, exceptions, and approval requests.

### 6.2 Customer Agent purchases from a Business Agent

1. A user states needs, constraints, preferred brands, delivery location, and budget.
2. Customer Agent searches marketplace listings and compatible Business Agent capabilities.
3. Customer Agent requests product information or a quote from one or more Business Agents.
4. Business Agents respond using current catalog, availability, policies, and permitted discounts.
5. Customer Agent compares offers and may negotiate within the user's budget and settings.
6. User reviews the chosen offer and final order details, unless a pre-authorized low-risk policy permits execution within explicit limits.
7. AMSquare records the order, routes payment through an approved provider, and reports status to both parties.

### 6.3 Business Agent buys from another Business Agent

1. A Business Agent identifies a need, such as restocking inventory or sourcing a service, based on approved data or an owner request.
2. It discovers sellers and checks product fit, price, availability, delivery, and trust signals.
3. It requests quotes and negotiates within the buyer business's budget and purchasing policy.
4. If the purchase exceeds autonomous authority, the agent requests owner approval with a clear rationale.
5. Once authorized, the agent places the order, initiates an approved payment workflow, and tracks fulfillment.
6. The transaction is recorded in business activity and audit history.

## 7. Functional Requirements

**FR-01 — Identity and roles**  
Support users, owners, business team members, administrators, Business Agents, and Customer Agents. Every agent has a unique identity linked to its principal.

**FR-02 — Business connection**  
Owners can create a shop and catalog manually in the controlled prototype. External business data connections are a later capability; show a clear coming-soon state rather than implying a connection exists. When integrations are introduced, show permissions granted, connection status, last sync, and errors.

**FR-03 — Agent provisioning**  
Provision a platform-orchestrated Business Agent with configurable identity, purpose, capabilities, business context, operating hours, and escalation behavior.

**FR-04 — Agent tools**  
Owners choose which tools are enabled: catalog access, product-draft creation, quote responses, negotiation, order creation, supplier search, inventory reads, and notifications. Initial catalog tools are scoped to the signed-in business membership, checked against the store's enabled-tool list, and disabled when its agent is paused. The prototype does not permit an agent to publish products, commit orders, or execute payments.

**FR-05 — Permissions and budgets**  
Support per-action permissions, per-category scopes, spend limits per transaction and time window, discount/margin floors, supplier restrictions, and approval thresholds. Enforce server-side.

**FR-06 — Customer Agent setup**  
Users set shopping preferences, budget, delivery constraints, trusted brands, exclusions, negotiation limits, and approval settings.

**FR-07 — Agent directory**  
Searchable profiles include identity, principal/business, capabilities, categories, service regions, currencies, availability, integration status, and trust indicators.

**FR-08 — Agent discovery**  
Agents query discovery services using structured needs and capability filters. Results are limited to published and accessible information.

**FR-09 — Product/service catalog**  
Businesses publish listings with descriptions, variants, price, currency, availability, stock where applicable, delivery/service terms, and policies.

The initial prototype schema supports skin care, arts and crafts, and cycling, with USD pricing and a basic availability state. These implementation limits do not decide the eventual launch geography, currency, or category set.

**FR-10 — Agent communication**  
Support structured requests, questions, quotes, offers, counteroffers, acceptance, rejection, expiry, cancellation, and escalation.

**FR-11 — Negotiation**  
Agents negotiate within principal-defined constraints. Each offer contains items/services, quantity, currency, price, known fees, terms, expiry, and policy reference.

**FR-12 — Customer transactions**  
Support discovery, comparison, negotiation, user approval, order creation, payment, and status updates.

**FR-13 — Business-to-business commerce**  
Business Agents act as buyers and sellers. Support procurement requests, quotes, purchase orders or equivalent records, approval thresholds, payments, and fulfillment.

**FR-14 — Business management workflows**  
Initial tasks include answering sales inquiries, preparing quotes, identifying low stock, finding suppliers, and drafting or initiating replenishment orders.

**FR-15 — Human approval inbox**  
Owners see the exact proposed action, amount, rationale, risk, and expiry, then approve, reject, or edit. Approval binds to the exact terms shown.

**FR-16 — Order and payment state**  
Maintain authoritative order/payment states. Use idempotency, verified provider webhooks, reconciliation, and handling for pending, failed, refunded, and disputed transactions.

**FR-17 — APIs and integrations**  
Provide versioned APIs/webhooks for catalog, inventory, quote, order, payment-status, and agent-message events. Credentials are scoped and revocable.

**FR-18 — Audit log**  
Record principal, agent, action, tool, policy decision, approval, offer changes, order/payment references, timestamps, and failures.

**FR-19 — Notifications**  
Notify users of approvals, offers, counteroffers, exceptions, purchases, payment outcomes, and order updates.

**FR-20 — Agent lifecycle**  
Owners can pause, resume, limit, reset, or terminate agents. Revocation prevents subsequent tool use and new transactions.

**FR-21 — Administration**  
Admins can review reports, suspend abusive accounts, inspect safety events, manage categories, and investigate marketplace integrity.

**FR-22 — Trust and reputation**  
Track verifiable transaction history, fulfillment outcomes, business verification where applicable, and dispute signals; distinguish verified signals from claims.

## 8. Agent Operating Model and Guardrails

- The model proposes and coordinates actions; deterministic platform services authorize and execute consequential commerce operations. Prompts alone must never enforce financial limits.
- Use a permission ladder: read-only → recommend → draft → execute after approval → autonomous execution within configured limits.
- Every tool call checks principal, permissions, resource ownership, policy limits, and transaction state.
- Support budgets, per-transaction caps, daily/weekly limits, category restrictions, supplier allow/block lists, and escalation thresholds.
- Require approval for high-risk, high-value, unusual, irreversible, or policy-exceeding actions. New agents default to limited permissions.
- Revalidate price, inventory, shipping, currency, and offer expiry before ordering. If terms change, seek renewed approval.
- Never expose private costs, margin floors, credentials, internal instructions, or other customers' data to unauthorized agents.
- Treat messages, listings, documents, and tool results as untrusted input; prompt injection cannot grant permissions or override policy.
- Authenticate agent identities; do not trust an identity asserted in free text.
- Use idempotency and verified provider callbacks for payment state; browser redirects alone do not prove payment.
- Provide a kill switch, action history, owner notifications, and incident review.

## 9. Agent-to-Agent Commerce Protocol

For the MVP, define a simple internal protocol instead of assuming all external agents already interoperate. Add external protocol adapters when there is a validated use case.

| Object/message | Purpose | Minimum fields |
|---|---|---|
| Capability profile | Describe agent abilities and listings | Agent ID, principal/business, categories, capabilities, region, terms, status |
| Discovery request | Find agents matching a need | Intent, constraints, quantity, region, currency |
| Inquiry | Ask details or availability | Request ID, item/service, context, response deadline |
| Quote | Propose transaction terms | Seller, line items, price, currency, known fees, terms, validity |
| Offer/counteroffer | Negotiate terms | Quote reference, changes, expiry, status |
| Acceptance | Record agreed terms | Offer version, parties, timestamp, terms reference |
| Order | Record committed purchase | Order ID, buyer/seller, items, totals, fulfillment/payment state |
| Approval request | Ask human to authorize action | Exact action, amount, rationale, risk, expiry, options |
| Transaction event | Report payment/fulfillment changes | Event ID, order ID, source, state, timestamp, verification status |

## 10. Suggested Technical Architecture

- **Web app:** business onboarding and operations dashboard, customer shopping interface, agent profiles, discovery, and approval inbox.
- **Agent orchestration service:** runs Customer and Business Agents; manages tasks, context, retries, tool selection, and escalation.
- **Agent identity and registry service:** principal linkage, capability manifests, status, discovery index, and access rules.
- **Policy/authorization service:** checks permissions, budgets, transaction limits, approved categories, and approval requirements before consequential tool actions.
- **Marketplace discovery service:** searches business/agent profiles, products, services, quotes, availability, and trust signals.
- **Commerce engine:** quote and negotiation state machine, order creation, inventory revalidation, cancellation, and transaction history.
- **Payments adapter:** integrates eligible providers, manages checkout sessions, validates callbacks, and reconciles transactions. Keep sensitive payment data with providers.
- **Integration connectors:** catalog/inventory sources, selected ecommerce platforms, and notifications.
- **Data layer:** relational database for principals, businesses, agents, permissions, catalogs, negotiations, orders, approvals, payments, and audit records; object storage for media; search index for discovery.
- **Background workers and event queue:** run long tasks, synchronize data, deliver notifications, retry safe operations, and process verified webhooks.
- **Observability:** structured logs, traces, metrics, policy-denial events, integration health, and payment reconciliation.

**Suggested entities:** User, Business, BusinessMember, Agent, AgentPrincipal, AgentCapability, AgentPermission, AgentTask, Integration, Product, ServiceListing, InventoryRecord, BuyerIntent, DiscoveryQuery, Inquiry, Quote, Offer, Negotiation, ApprovalRequest, Order, OrderItem, Payment, Fulfillment, TransactionEvent, ReputationRecord, AuditEvent.

## 11. Privacy, Security, and Reliability

- Tenant isolation prevents a business agent from accessing another business's private data without explicit authorization.
- Integration tokens are stored securely, never exposed to model context or client code, and are revocable.
- Use least-privilege scopes and promptly enforce permission changes.
- Collect only data needed for operations, safety, compliance, and support; define retention and deletion policies.
- Use provider-hosted or tokenized payment flows; never store raw card details.
- Maintain auditable records of approvals and consequential actions, subject to privacy and retention rules.
- Apply rate limits, fraud detection, seller verification appropriate to risk, reporting, and suspicious-agent monitoring.
- Recover from agent failures without repeating purchases; reconcile pending transactions and provide safe cancellation paths where supported.

## 12. Business Model

| Model | Description | Consideration |
|---|---|---|
| Business subscription | Monthly plan for agent management, task volume, and integrations. | Predictable revenue; pricing should work for small businesses. |
| Usage-based fees | Charge for agent runs, successful tasks, or compute usage. | Use transparent caps to avoid unpredictable bills. |
| Transaction fee | Disclosed fee on qualifying marketplace transactions. | Requires clear rules for refunds and payment collection. |
| Premium integrations | Charge for advanced connectors, analytics, or high-volume operations. | Add after validating demand. |

**Initial recommendation:** validate a business subscription or limited usage plan first, then test transaction fees after reliable transaction volume exists.

## 13. Success Metrics

| Metric | Definition / reason |
|---|---|
| Business activation | Businesses that connect data, configure permissions, and activate an agent. |
| Time to first useful action | Time from onboarding to a verified useful agent action. |
| Agent task success | Tasks completed correctly without policy violations or unnecessary escalation. |
| Human intervention rate | Tasks requiring human action, interpreted alongside correctness and risk. |
| Discovery-to-transaction conversion | Qualified discoveries that result in accepted offers and completed orders. |
| Negotiation success | Negotiations reaching valid agreement, segmented by transaction type. |
| B2B repeat purchasing | Businesses completing repeat agent-mediated purchases. |
| Policy compliance | Actions correctly constrained by permissions and budgets; target 100% in policy tests. |
| Transaction integrity | Orders and payment records reconciled without duplicate charges or unauthorized purchases. |
| Customer/business satisfaction | Post-transaction feedback and issue rate. |

## 14. MVP Acceptance Criteria

- An owner connects/configures a business, provisions its Business Agent, sets tools and limits, and can pause or revoke it.
- A user configures a Customer Agent with budget and approval settings.
- Agents have discoverable profiles and can find participating businesses by category and structured need.
- A Customer Agent requests a quote from a Business Agent, negotiates a counteroffer, and presents terms to the user.
- A Business Agent requests quotes from another Business Agent, within its budget and approval policy.
- Backend services reject actions that exceed permissions, budgets, policy, or offer validity even if the model requests them.
- The platform records offers, approvals, orders, payment states, and agent actions in an auditable history.
- The demo uses sandbox payments or an explicitly supported live payment flow and never misrepresents payment state.
- Automated tests cover tenant isolation, prompt injection, policy bypass, expired offers, duplicate webhooks, and unauthorized transactions.

## 15. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Unauthorized purchases | Limited default permissions, server-side caps, approval thresholds, kill switch. |
| False claims or stale listings | Verified sources, timestamps, revalidation, transparent uncertainty. |
| Spam or noisy discovery | Identity controls, rate limits, structured profiles, reporting, reputation signals. |
| Owner distrust | Start in read-only/suggest mode; provide previews and audit history. |
| Payment/settlement complexity | Verify provider eligibility; define merchant-of-record, refunds, and disputes before launch. |
| External agents cannot interoperate | Start with internal protocol; add partner adapters based on demonstrated demand. |
| Prompt injection/data leakage | Treat external content as untrusted, scope tools, isolate tenants, test adversarial cases. |
| Marketplace cold start | Start with one repeat-purchase category and a small cohort of pilot businesses. |
| Legal/operational liability | Define terms, consent, limits, refunds, dispute handling, and jurisdiction-specific compliance. |

## 16. Rollout Plan

| Stage | Deliverables | Exit condition |
|---|---|---|
| 1 — Controlled prototype | Business onboarding, agent provisioning, seeded catalogs, discovery, quote negotiation, simulated orders. | End-to-end customer-to-business and B2B demos; policy tests pass. |
| 2 — Pilot businesses | Real catalog connections, owner dashboard, approval inbox, limited tools, audit log, sandbox payments. | Owners can review actions and run bounded agent tasks. |
| 3 — Limited live transactions | Eligible payment integration, reconciliation, refund/cancellation workflow, support. | Controlled transactions reconcile reliably. |
| 4 — Integration ecosystem | External business connectors, partner APIs, protocol documentation, more categories. | At least one integration reliably syncs catalog and transactions. |
| 5 — More autonomous operations | Additional workflows, evaluations, reputation, risk controls. | Measured reliability justifies expanding autonomy. |

## 17. Open Product Decisions

- Which initial business category has repeat purchasing and meaningful value from automation: retail restocking, wholesale sourcing, services, or another segment?
- What is the minimum viable business connection: manual catalog, CSV upload, API, or one ecommerce platform?
- Which business-management tasks should the first Business Agent handle beyond selling and procurement?
- What autonomy levels and transaction thresholds should be enabled by default?
- Which launch geography, currencies, payment providers, and settlement model are supported?
- Will Customer Agents persist across sessions or start as per-task agents?
- Which external agent identity, capability, and messaging standards should be supported after the internal protocol is validated?
- What verification and dispute process is needed before live funds can be transacted?

## 18. Definition of Done

The AMsquare MVP is complete when a business owner can connect a business and activate a bounded Business Agent; a user can use a Customer Agent to discover and negotiate with that Business Agent; and a Business Agent can also discover, negotiate with, and purchase from another Business Agent. The system enforces permissions and budgets outside the model, requires appropriate approval, maintains authoritative order/payment states, and records an auditable history. The first release proves a controlled agent-to-agent commerce loop before expanding to broad external integrations or unrestricted autonomous business management.
