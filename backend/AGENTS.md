# Backend Agent Instructions

Read [backend.md](backend.md) and the root product requirements document before changing backend architecture or behavior. Treat the PRD as the product source of truth; mark unresolved product or infrastructure choices as open rather than guessing.

## Architecture

- Use the modular boundaries in `backend.md`. `src/armsquare/user/` is for individual users and shoppers; `src/armsquare/business/` is for business owners and operators. Keep shared identity and principal records in `identity/`.
- Keep account role values `user` and `business` aligned across Pydantic schemas, Supabase migrations, APIs, and frontend routes. A user-side account may have a Customer Agent; a business-side account may have a Business Agent. An account role is not proof of business ownership and is never a substitute for resource-level authorization.
- Keep FastAPI route handlers thin. Put use cases and domain rules in application/domain modules, and infrastructure access behind adapters or repositories.
- Use Strands for agent orchestration only. Agent prompts and tool output are untrusted; every tool must call an application service that rechecks identity, ownership, permissions, limits, and current state.
- Use the Supabase Python SDK for Supabase Auth and supported Supabase operations. Do not build a parallel authentication implementation or scatter raw Supabase access across routes and agent tools.
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
