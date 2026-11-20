# Deployment

Two independent apps:

| App | Folder | Host | Runtime |
|---|---|---|---|
| API | `api/` | Render | Docker (`api/Dockerfile`) + Neon Postgres |
| Web | `web/` | Cloudflare | Workers, static Vite build via Alchemy |

They only talk over HTTPS. Neither deploy depends on the other's files.

## Order (first deploy)

1. Deploy the **API** to Render and note its URL.
2. Build the **Web** app with that URL in `VITE_API_URL` and deploy to Cloudflare.
3. Put the resulting Cloudflare URL in the API's `CORS_ALLOWED_ORIGINS` and let
   Render restart.

Doing the web first is possible, but the bundle would point at the wrong API until
rebuilt, because `VITE_API_URL` is inlined at build time.

---

## API on Render

The Blueprint lives at the repository root (`render.yaml`), because Render reads it
from there. It builds `api/Dockerfile` with `api/` as the build context:

```yaml
runtime: docker
dockerfilePath: ./api/Dockerfile
dockerContext: ./api
healthCheckPath: /health/readiness
buildFilter:
  paths: [api/**]
```

### Environment variables

| Key | Value | Set where |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | already in `render.yaml` |
| `DATABASE_URL` | Neon connection string, e.g. `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require` | Render dashboard (`sync: false`) |
| `CORS_ALLOWED_ORIGINS` | `https://<worker>.workers.dev` (comma-separated for more) | Render dashboard (`sync: false`) |
| `PORT` | set by Render automatically | — |

`DATABASE_URL` is accepted in `postgresql://` form; the app converts it to JDBC at
startup. Do not commit it.

### Blueprint vs manual service

- If the Render service was created from `render.yaml`, the Blueprint sync applies
  `dockerfilePath`/`dockerContext` automatically.
- If it was created manually in the dashboard, Render ignores `render.yaml`. Set
  **Dockerfile Path** = `api/Dockerfile` and **Docker Context** = `api` in the
  service settings, otherwise the build fails with "Dockerfile not found".

### Verify

```bash
curl https://<service>.onrender.com/health/readiness   # {"status":"UP"}
curl https://<service>.onrender.com/v3/api-docs        # OpenAPI JSON
```

Keep `/health/*` and `/info` public. Render restarts a service whose health check
fails, so never put them behind auth.

### Free-tier behaviour

- Render free web services sleep after ~15 minutes of inactivity; the next request
  takes 30–60 s to wake.
- Neon suspends compute when idle; the first query after that is slower.
- The readiness probe deliberately does not query the database, so health checks do
  not keep Neon awake.

### Build the image locally (optional)

```bash
docker build -f api/Dockerfile -t smart-park:local api
docker run --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev smart-park:local
curl http://localhost:8080/health/readiness
```

---

## Web on Cloudflare

The scaffold deploys through **Alchemy** (`web/packages/infra/alchemy.run.ts`), not
Wrangler/Pages.

### Credentials

Create `web/packages/infra/.env` (git-ignored):

```dotenv
CLOUDFLARE_API_TOKEN=<token with Workers + account access>
CLOUDFLARE_ACCOUNT_ID=<account id>
ALCHEMY_PASSWORD=<random string used to encrypt Alchemy state>
```

The token needs permission to manage Workers and their assets for that account.

### Build and deploy

```bash
cd web
VITE_API_URL=https://<service>.onrender.com bun run deploy
```

or from the repository root:

```bash
VITE_API_URL=https://<service>.onrender.com bun run deploy:web
```

The first deploy prints the worker URL (typically
`https://<name>.<account>.workers.dev`). Use it in `CORS_ALLOWED_ORIGINS` on Render.

`VITE_API_URL` is baked into the bundle, so **rebuild after changing it**:

```bash
VITE_API_URL=https://api.example.com bun run build:web
grep -r "api.example.com" web/apps/web/dist/assets | head
```

In development the app uses `/api`, which Vite proxies to `localhost:8080`; that
fallback is dev-only and must not be used in production.

### Verify

Open the worker URL and visit `/parking-spots`. The table should list the seeded
spaces (`A1`, `A2`, `A3`) when the API is reachable.

### Custom domain

Add the domain in Cloudflare, point it at the worker, then append it to
`CORS_ALLOWED_ORIGINS` on Render (both origins can coexist, comma-separated).

---

## Regenerating the typed client

The web app's client is generated from the API's OpenAPI document:

```bash
bun run gen:api     # requires the API on http://localhost:8080
```

`web/apps/web/openapi.json` and `src/api/generated.ts` are committed, so builds do
not need the API running. Regenerate and commit both whenever a controller or DTO
changes.

---

## Rollback

- **Render:** deploy an earlier commit from the dashboard, or `git revert` + push.
- **Cloudflare:** check out the previous commit, rebuild with the same
  `VITE_API_URL`, and deploy again.
