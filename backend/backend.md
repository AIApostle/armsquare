# Backend Architecture

## Purpose

The backend is the trusted platform boundary for armsquare: an agentic marketplace where Business Agents and Customer Agents discover one another, exchange structured commercial terms, and act for an identified business or person. The two audience domains are named `user/` for individual users and `business/` for business owners and operators.

The backend owns identity, authorization, policy enforcement, negotiation and order state, and the audit history. Agents may propose actions; only backend services can authorize and execute consequential actions.

## Product scope

The MVP supports three commerce journeys over shared commerce primitives:

1. A business owner configures a business, its catalog, and a bounded Business Agent.
2. A Customer Agent discovers businesses, negotiates within the shopper's constraints, and requests approval where required.
3. A Business Agent discovers suppliers, negotiates within business purchasing policy, and escalates purchases that exceed its authority.

The initial rollout is a controlled prototype with seeded catalogs and simulated orders/payments. Do not present simulated state as live commerce. Live payment providers, external agent protocols, business data connectors, launch thresholds, and other open product decisions must remain explicit decisions rather than assumptions in the implementation.

## Architecture principles

- **Security first:** authenticate every request, authorize every resource access, isolate tenants, and deny by default.
- **Policy outside the model:** models and prompts never grant authority. Deterministic backend services enforce permissions, budgets, category and supplier restrictions, approval thresholds, and transaction state.
- **Modular domains:** user and business workflows have separate domain boundaries. Identity, policy, offers, orders, approvals, and audit are shared platform capabilities where their rules truly are shared.
- **Structured commerce:** inquiries, quotes, offers, approvals, orders, payments, and events are validated records with explicit state transitions—not free-form chat treated as authoritative.
- **Human control:** consequential actions require the configured approval; pause or revocation prevents subsequent tool use and new transactions.
- **Auditable behavior:** record the principal, agent, action, policy decision, approval, state transition, outcome, and timestamp for material actions.
- **Small, explicit dependencies:** use the appropriate library for each boundary; do not add infrastructure or abstractions before a product requirement needs them.

## Technology

| Concern | Choice and responsibility |
|---|---|
| Python environment and dependencies | **uv** manages the project, virtual environment, dependency groups, and lockfile. Keep `pyproject.toml` and `uv.lock` in sync; use reproducible locked installs. |
| HTTP API | **FastAPI** exposes the versioned API, request/response contracts, dependency injection, and generated OpenAPI schema. |
| ASGI runtime | **Uvicorn** serves the FastAPI application. |
| Agent orchestration | **Strands Agents SDK** coordinates Business and Customer Agent tasks and invokes explicitly registered tools. It does not own authorization, commerce state, or financial policy. |
| Authentication and Supabase access | Use the **Supabase Python SDK** for Supabase Auth and supported Supabase services. Verify the caller's identity on the server and derive the principal from verified credentials, never from a request body or agent message. |
| Data validation | **Pydantic** defines and validates API, domain-boundary, and integration data. Use **pydantic-settings** for typed configuration and **email-validator** for email fields that require validation. |
| HTTP integrations | Prefer **HTTPX** for async outbound HTTP in FastAPI paths. Use **Requests** only where a synchronous integration or library requires it; never block an async request handler with synchronous network I/O. |

This table documents the intended stack. It is not evidence that all packages or production integrations are already installed or configured.

## Local setup

From `backend/`, install the locked environment with `uv sync`, copy `.env.example` to `.env`, and fill in the Supabase project URL and anon key. Apply the SQL in `supabase/migrations/` through the project's Supabase migration workflow. Run the API with `uv run uvicorn armsquare.main:app --reload`; the frontend's default API URL is `http://localhost:8000`.

Never commit `.env` or use the service-role key for browser authentication. Production cookie settings must use HTTPS; `SameSite=None` is accepted only with secure cookies enabled.

## Service boundaries

1. **API layer** — versioned FastAPI routers, authentication dependencies, input/output schemas, and HTTP status mapping. It delegates business rules to application services.
2. **Application layer** — use cases that coordinate repositories, policy checks, domain transitions, and external adapters. It owns transaction boundaries and idempotency.
3. **Domain layer** — typed business rules and state transitions for identity, business operations, shopper preferences, agents, permissions, negotiation, approvals, orders, payments, and audit events. Keep it independent of FastAPI and Strands.
4. **Agent orchestration layer** — Strands agent definitions, task lifecycle, bounded tool registration, and escalation. Tools call application services; they do not access tables or integrations directly.
5. **Policy and authorization layer** — checks actor, principal, resource ownership, agent status, action scope, budgets, limits, approval state, and current transaction terms before every consequential operation.
6. **Infrastructure layer** — Supabase client setup, repository implementations, external HTTP clients, payment and catalog adapters, and observability integrations.

### Suggested source layout

```text
backend/
├── backend.md
├── AGENTS.md
├── pyproject.toml
├── uv.lock
└── src/
    └── armsquare/
        ├── main.py
        ├── core/                 # settings, errors, logging, shared primitives
        ├── api/
        │   └── v1/               # routers, dependencies, request/response schemas
        ├── identity/             # authentication, principals, membership, roles
        ├── business/             # business profile, catalog, owner and agent workflows
        ├── user/                 # shopper profile, preferences, Customer Agent workflows
        ├── agents/               # Strands orchestration, task lifecycle, bounded tools
        ├── policy/               # authorization, budgets, limits, approvals
        ├── marketplace/          # discovery and published capabilities/listings
        ├── commerce/             # inquiries, quotes, offers, negotiation, orders
        ├── payments/             # payment abstraction, verified events, reconciliation
        ├── audit/                # append-only material action history
        └── infrastructure/       # Supabase, repositories, external clients, adapters
```

This is a module map, not a mandate to create empty packages or implement every future capability up front. Add a module when there is a concrete use case. In this codebase, `user/` is for individual users and shoppers, while `business/` is for business owners/operators. Keep shared authentication and principal identity in `identity/`; a user's account type is not proof of business ownership or an authorization grant. Put other shared behavior in a shared module only when its rules and ownership are genuinely common. Platform administration can be added as a separate domain when that scope is funded.

## Request and agent execution flow

1. FastAPI authenticates the request using the configured Supabase Auth integration and constructs a trusted actor/principal context.
2. The API validates input with Pydantic and calls an application use case.
3. The use case checks authorization, tenant ownership, current record state, and policy before reading or changing protected data.
4. For agent work, the application layer starts or resumes a bounded task. Strands may reason and propose tool calls; each tool delegates to the same application services used by API requests.
5. Before a consequential tool action, policy is evaluated against current persisted permissions and current terms. Model output, tool arguments, and approval requests are untrusted input.
6. If human approval is required, persist an approval request bound to the exact proposed terms. Revalidate those terms and policy when the owner decides; changed price, inventory, shipping, currency, expiry, or other material terms require new approval.
7. Persist each authoritative state transition and its audit event. Use idempotency for retried commands and external callbacks so recovery cannot repeat a purchase.
8. Return or publish the authoritative result. Do not infer order or payment success from an agent response, client redirect, or unverified event.

## Data and integration boundaries

- Supabase is the managed data and identity platform. Access it through the Supabase Python SDK and repository boundaries; keep persistence details out of domain rules and route handlers.
- Derive tenant scope from verified identity and membership. Apply server-side ownership checks to every read and write; use database-level row policies as defense in depth where supported. Never treat row-level security as a replacement for application authorization.
- Keep service-role credentials server-only and out of client responses, logs, prompts, and agent tool context. Store configuration in validated environment settings or an approved secret manager; never commit secrets.
- Persist authoritative principals, businesses, agents, permissions, listings, negotiations, approvals, orders, payment references, and audit events. Define retention and deletion behavior for personal data.
- Treat catalog content, uploaded documents, listings, and remote tool results as untrusted. Validate and constrain them before use; prompt injection must not change permissions or expose private data.
- Use provider-hosted or tokenized payment flows. Do not store raw card data. Payment state changes only from verified provider events and reconciliation.
- Keep external providers behind narrow adapters. Use HTTPX for asynchronous calls, explicit timeouts, bounded retries, and idempotency where the provider supports it.
- The PRD calls for asynchronous tasks, notifications, integrations, and webhook processing, but does not select a queue or worker technology. Select one only when the required workloads and delivery guarantees are clear.

## Security and reliability requirements

- Default to least privilege. Scope each user, agent, and integration credential to the minimum actions, resources, and duration required; revoke access promptly.
- Enforce authorization, tenant isolation, agent lifecycle state, and policy on the server for every operation. Client-side checks and prompts are not controls.
- Do not expose private costs, margin floors, credentials, internal instructions, or another tenant's data to unauthorized users or agent contexts.
- Validate signatures and replay/idempotency controls for provider webhooks. Do not let a callback directly set payment state without verifying its source and expected transition.
- Use explicit state machines and valid transitions for offers, approvals, orders, and payments. Revalidate inventory and terms before order creation.
- Use safe timeouts and bounded retries for network operations. Retry only operations that are safe or idempotent; surface failures rather than returning success-shaped fallbacks.
- Keep audit records of consequential actions and policy outcomes. Avoid logging secrets, credentials, payment data, or unnecessary personal information.
- Apply request limits and abuse controls at exposed boundaries. Add metrics, structured logs, and tracing without leaking sensitive payloads.
- Test tenant isolation, authorization failures, policy bypass attempts, prompt injection, revoked or paused agents, changed/expired offer terms, duplicate commands and webhooks, and payment reconciliation.

## Testing and delivery expectations

- Use `uv` and the lockfile for reproducible development, CI, and deployment environments.
- Add focused unit tests for domain rules and state transitions; integration tests for Supabase repositories and external adapters; API tests for authentication, authorization, validation, and error behavior.
- Policy tests must prove that prohibited actions are rejected server-side even when directly requested by an agent tool.
- Keep secrets and external services out of ordinary unit tests. Use safe fixtures and isolated test resources for integration tests.
- Validate the exact behavior and persistence guarantees changed by a feature; run the relevant tests and static checks before considering it complete.

## Decisions not made here

The PRD leaves the payment provider, merchant-of-record and settlement model, launch geography/currencies, initial business connection, autonomy defaults and transaction thresholds, Customer Agent persistence, external agent protocol, queue technology, and production retention policy open. Do not silently choose these in implementation; document a decision when product requirements resolve them.
