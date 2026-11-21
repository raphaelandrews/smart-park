# Smart Park

```bash
git clone https://github.com/raphaelandrews/smart-park.git
cd smart-park
```

**2. Install dependencies**

```bash
bun install
(cd web && bun install)
```

**3. Start API and web**

```bash
bun run dev
```

Stop with `Ctrl+C`. The database is created and seeded automatically at
`api/data/`; delete that folder to reset it.

## Run only the API (H2)

**1. Clone**

```bash
git clone https://github.com/raphaelandrews/smart-park.git
cd smart-park
```

**2. Start the API**

```bash
cd api
./mvnw spring-boot:run
```

## Troubleshooting

- **Port 8080 in use**

  ```bash
  ss -ltnp 'sport = :8080'
  ```

  ```bash
  kill <pid>
  ```

  Or

  ```bash
  kill "$(ss -ltnpH 'sport = :8080' | grep -oP 'pid=\K[0-9]+')"
