# Smart Park

## Run locally — H2

```bash
mise run dev
```

or

```bash
./mvnw spring-boot:run
```

- API: <http://localhost:8080/vehicle>
- Reset the local DB: stop the app and delete `data/`

## Run prod - PostgreSQL

```bash
cp .env.example .env   # then replace the placeholder values
```

```bash
mise run prod
```

## Troubleshooting

- **Port 8080 in use**
  ```bash
  ss -ltnp 'sport = :8080'
  kill <pid>
  ```
