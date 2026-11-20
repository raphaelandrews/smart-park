# Smart Park

Parking lot management, split into two independently deployable apps:

```
api/   Spring Boot 4 · Java 21 · Maven · H2 (dev) / Neon Postgres (prod) · Render
web/   TanStack Router · Vite · React · Bun · Cloudflare Workers (Alchemy)
```

The frontend talks to the API only over HTTP.

## Requirements

- JDK 21 (`mise install` if you use the included `.mise.toml`)
- Bun 1.3+
- Docker (optional: local Postgres or building the API image)

## Run locally

```bash
bun install
(cd web && bun install)

bun run dev
```

- API: <http://localhost:8080> — Swagger at `/swagger-ui/index.html`, health at `/health/readiness`
- Web: <http://localhost:3001> — parking spots at `/parking-spots`

The `dev` profile uses a file-based H2 database under `api/data/` and seeds demo
data. Reset it with `rm -rf api/data` (stop the API first).

The Vite dev server proxies `/api` to `localhost:8080`, so no CORS setup is needed
in development.

## Scripts (repository root)

| Command | Does |
|---|---|
| `bun run dev` | starts API and web together |
| `bun run build` | builds both |
| `bun run test` | runs the API tests |
| `bun run lint` | lints the web app |
| `bun run gen:api` | regenerates the typed API client (API must be running) |
| `bun run deploy:web` | deploys the web app to Cloudflare |

## Deploy

Deploy the API first, then the web app with the API URL.

### API → Render

- `render.yaml` at the repository root builds `api/Dockerfile` with `api/` as
  context and waits on `/health/readiness`.
- If the Render service was created manually instead of from the Blueprint, set
  **Dockerfile Path** = `api/Dockerfile` and **Docker Context** = `api`.
- Environment variables:

| Key | Value |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` (already in `render.yaml`) |
| `DATABASE_URL` | Neon `postgresql://…?sslmode=require` |
| `CORS_ALLOWED_ORIGINS` | the Cloudflare URL (comma-separated if several) |
| `PORT` | set by Render |

Verify:

```bash
curl https://<api>.onrender.com/health/readiness
```

### Web → Cloudflare

The scaffold deploys through Alchemy (`web/packages/infra`), not Pages/Wrangler.

1. Create `web/packages/infra/.env` with `CLOUDFLARE_API_TOKEN`,
   `CLOUDFLARE_ACCOUNT_ID` and `ALCHEMY_PASSWORD`.
2. Deploy with the API URL baked in:

```bash
VITE_API_URL=https://<api>.onrender.com bun run deploy:web
```

3. Copy the printed worker URL into `CORS_ALLOWED_ORIGINS` on Render.

`VITE_API_URL` is inlined at build time — rebuild and redeploy if it changes.

## Notes

- **API client:** `web/apps/web/openapi.json` and `src/api/generated.ts` are
  committed, so builds do not need the API running. After changing controllers or
  DTOs, run `bun run gen:api` and commit both files.
- **Free tiers:** Render sleeps after inactivity and Neon suspends compute; the
  first request after a pause is slow. The readiness probe intentionally avoids the
  database.
- More detail: [`api/README.md`](api/README.md) (profiles, database) and
  [`DEPLOY.md`](DEPLOY.md) (deployment, rollback).
