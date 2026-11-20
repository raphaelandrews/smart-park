# Smart Park

Requirements: JDK 21 and Bun.

## Run

```bash
bun install
(cd web && bun install)
bun run dev
```

- Web: <http://localhost:3001>
- API: <http://localhost:8080>
- Swagger: <http://localhost:8080/swagger-ui/index.html>

## Commands

```bash
bun run dev        # run API + web
bun run build      # build both
bun run test       # API tests
bun run gen:api    # regenerate the typed client (API must be running)
```

## Deploy

See [DEPLOY.md](DEPLOY.md).
