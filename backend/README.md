## Backend

The backend is a FastAPI service with Supabase Auth for two explicit account
roles:

- `business` — business owners and operators
- `customer` — marketplace customers

### Configuration

Copy `.env.example` to `.env` and set the Supabase project URL and publishable
(anon) key. Never use a service-role key in the browser or expose it through
the API.

The workspace Supabase MCP configuration is in
[`../.vscode/mcp.json`](../.vscode/mcp.json). It prompts for a project
reference and scoped access token in VS Code.

### Run

```bash
uv sync
uv run backend
```

### Auth endpoints

| Endpoint | Purpose |
|---|---|
| `POST /auth/business/signup` | Create a business account |
| `POST /auth/customer/signup` | Create a customer account |
| `POST /auth/business/signin` | Sign in a business account |
| `POST /auth/customer/signin` | Sign in a customer account |
| `POST /auth/refresh` | Exchange a refresh token |
| `POST /auth/signout` | End the client session |
| `GET /auth/me` | Resolve the authenticated Supabase user |
| `GET /business/me` | Resolve the authenticated business user |
| `GET /customer/me` | Resolve the authenticated customer user |

Signup stores the role in Supabase user metadata. Sign-in and protected
endpoints verify that metadata server-side, so a customer token cannot access
business routes and vice versa.