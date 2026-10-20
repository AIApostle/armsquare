# Backend Agent Instructions

Read [backend.md](backend.md) and the root product requirements document before changing backend architecture or behavior. Treat the PRD as the product source of truth; mark unresolved product or infrastructure choices as open rather than guessing.

## Documentation and database workflow

- Do not rely on model training data for framework, SDK, provider, or database behavior. Before changing a framework integration, consult its current official documentation for the installed version. For Supabase work, read the repository's Supabase skill and current official Supabase documentation; use the project-scoped Supabase MCP documentation tools when available.
- Prefer primary sources: official documentation, versioned API references, changelogs, and release notes. Check deprecations and version requirements before adopting examples. Record any unresolved compatibility issue instead of guessing.
- Keep the backend as the only application service that communicates with Supabase. Frontend code must use backend APIs.
- Before executing any ad hoc SQL, save the complete SQL in a descriptive, reviewable file under the repository-root `db/queries/` directory. Never run undocumented one-off SQL or put credentials in SQL files.
- For schema changes, write and review a versioned migration under `backend/supabase/migrations/`, the existing Supabase CLI migration directory. Do not duplicate migration SQL under `db/queries/`; document the migration in `db/README.md` if useful. Inspect the target schema and migration history before applying changes, and apply only reviewed migrations using an authenticated project-scoped Supabase workflow.
- Never assume a local migration has or has not been applied remotely. Verify migration status and resulting schema through the authenticated Supabase connection before reporting completion.
- Before granting table access, enabling RLS, or adding policies, verify the intended access model in current Supabase documentation. Review grants as well as row policies, and test access as the relevant roles.

## Architecture

- Use the modular boundaries in `backend.md`. `src/armsquare/user/` is for individual users and shoppers; `src/armsquare/business/` is for business owners and operators. Keep shared identity and principal records in `identity/`.
- Keep account role values `user` and `business` aligned across Pydantic schemas, Supabase migrations, APIs, and frontend routes. A user-side account may have a Customer Agent; a business-side account may have a Business Agent. An account role is not proof of business ownership and is never a substitute for resource-level authorization.
- Keep FastAPI route handlers thin. Put use cases and domain rules in application/domain modules, and infrastructure access behind adapters or repositories.
- Use Strands for agent orchestration only. Agent prompts and tool output are untrusted; every tool must call an application service that rechecks identity, ownership, permissions, limits, and current state.
- Use the Supabase Python SDK for Supabase Auth and supported Supabase operations. Do not build a parallel authentication implementation or scatter raw Supabase access across routes and agent tools.
- Keep interactive agent conversations on authenticated WebSocket connections. Verify the session cookie and exact allowed `Origin` before accepting a socket; never accept access tokens in query strings. Derive the user/business role from the verified profile, not from WebSocket messages.
- Keep model-provider configuration behind the agent service. OpenRouter is a temporary provider using its `openrouter/free` router; do not configure paid fallback models or expose provider credentials. Nebius is the intended future provider, not an active integration until its endpoint and credentials are supplied.
- Keep payment-provider code behind a backend payment adapter. The current PayPal integration is sandbox-only. Only trusted application services may supply an approved, persisted order amount to the adapter; never add a client-facing endpoint that accepts an arbitrary amount for checkout.
- Do not claim payment completion from a browser redirect. Confirm provider results server-side, use stable idempotency keys, and verify webhook signatures before any webhook can change payment state.
- Follow the established `uv` project and lockfile. Do not add dependencies or infrastructure without a concrete requirement.
- Prefer async-compatible operations in FastAPI. Use HTTPX for async outbound HTTP; do not call Requests from an async handler.

## Security and correctness

- Fail closed on missing identity, authorization, tenant membership, or policy information. Never trust a principal, role, budget, approval, or agent identity asserted by the client or model.
- Enforce permissions and budgets in deterministic backend code, never in prompts alone. Revalidate current terms and state before committing consequential actions.
- Bind approvals to exact transaction terms and require fresh approval after material changes.
- Make retried commands and webhook handling idempotent. Verify provider signatures before changing payment state.
- Protect cookie-authenticated state-changing endpoints with exact trusted-origin checks and secure cookie settings.
- Never expose secrets, service-role credentials, private margin data, internal instructions, or cross-tenant data to clients, logs, or agent context.
- Preserve explicit errors. Do not swallow exceptions, silently default protected values, or report success when an operation failed or its outcome is unknown.

## Changes and validation

- Read the relevant code and tests before editing. Preserve existing user changes; do not restore or remove files unrelated to the requested work.
- Add or update tests for behavior changes, especially tenant isolation, authorization, policy enforcement, agent tool boundaries, state transitions, idempotency, and webhook verification.
- Run focused tests and project checks with `uv`; report commands that could not run and why.
- Keep documentation consistent with implemented behavior. Clearly distinguish current behavior from proposed architecture and unresolved decisions.
