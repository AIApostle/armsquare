# Database SQL

This directory is the repository home for standalone SQL queries. Save a complete, descriptive SQL file under `db/queries/` before executing it against any environment. Include a short comment in the file describing the purpose and expected effect. Never include credentials or secret values.

## Schema migrations

Versioned schema migrations remain in `backend/supabase/migrations/`, the existing Supabase CLI migration directory and source of truth for schema changes. Do not duplicate a migration in `db/queries/`. Inspect the target project's current schema and migration history before applying a migration, and verify the result through an authenticated, project-scoped Supabase workflow.

## Query safety

- Prefer read-only inspection queries before proposing changes.
- Keep statements narrowly scoped and review destructive or irreversible operations before execution.
- For exposed tables, review both explicit grants and row-level security policies against the intended access model.
- Never report a database change as complete until the resulting schema or data has been independently verified.
