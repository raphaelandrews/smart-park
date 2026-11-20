# api

Spring Boot backend for Smart Park. The frontend lives in `../web`.

## Run

From this directory:

```bash
./mvnw spring-boot:run
```

From the repository root:

```bash
bun run dev:api     # or: mise run dev
```

Default port is `8080` (`PORT` overrides it). With the `dev` profile the API
uses a file-based H2 database at `data/smartpark.mvdb`, the H2 console at
`/h2-console`, and seeds a small demo data set (vehicles, one space type, three
spaces, one tariff).

- Swagger UI: <http://localhost:8080/swagger-ui/index.html>
- OpenAPI JSON: <http://localhost:8080/v3/api-docs>
- Health: <http://localhost:8080/health/readiness>

Reset the local database:

```bash
# stop the app first
rm -rf data
```

## Profiles

| Profile | Database | Notes |
|---|---|---|
| `dev` (default) | H2 file at `data/smartpark` | H2 console on, rate limiting off, demo seed |
| `prod` | PostgreSQL (Neon) | rate limiting on, no seed, no H2 console |

`prod` reads the database from environment variables:

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` **or** `jdbc:postgresql://…` |
| `DATABASE_USERNAME` | fallback when the URL has no userinfo |
| `DATABASE_PASSWORD` | fallback when the URL has no userinfo |
| `CORS_ALLOWED_ORIGINS` | comma-separated browser origins allowed to call the API |
| `PORT` | HTTP port (Render sets it) |

Neon and most providers hand out a `postgresql://` URL, which JDBC cannot use.
`NeonDataSourceConfig` converts it at startup (host, port, path, query string,
percent-decoded credentials), so you can paste the URL as-is.

Run the prod profile locally against the bundled Postgres:

```bash
docker compose up -d
DATABASE_URL="jdbc:postgresql://localhost:5432/smartpark" \
DATABASE_USERNAME=postgres \
DATABASE_PASSWORD=postgres \
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

## Schema management

Both profiles use `spring.jpa.hibernate.ddl-auto: update`. That is fine for a
course/demo project: Hibernate adds missing tables and columns automatically and
never runs `create-drop`. It is **not** safe long-term — it cannot rename or drop
columns and can fail on conflicting changes. Switch to Flyway (or Liquibase)
before storing data you care about.

## Neon notes

Neon's free tier suspends compute when idle, so the first request after a pause
can take a few seconds. The readiness probe (`/health/readiness`) deliberately
does not query the database: it only reports application readiness, so Render's
health checks do not keep Neon awake or fail while the database resumes.

## Deploy

`../render.yaml` is the Render Blueprint. It builds the image from
`api/Dockerfile` with `api/` as the build context and waits for
`/health/readiness`. Set `DATABASE_URL` and `CORS_ALLOWED_ORIGINS` in the Render
dashboard; `SPRING_PROFILES_ACTIVE=prod` is already in the blueprint.
