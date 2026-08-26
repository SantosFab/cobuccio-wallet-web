# Cobuccio Wallet Web

Next.js frontend for the wallet challenge, bootstrapped with `create-next-app`.

## Docker (Makefile)

This repo is self-contained: it has its own `Makefile`, `docker-compose.yml` and `.env.example`.

```bash
# copy the environment file (the Makefile also does this automatically
# on the first run of any command, if .env is missing)
$ cp .env.example .env
```

Available commands, grouped the same way as in the `Makefile`:

```bash
# dependencies
$ make install                # installs project dependencies locally (yarn, outside Docker)

# development
$ make build-dev               # [dev] builds the development image
$ make up-dev                  # [dev] starts the development container (hot reload)
$ make stop-dev                # [dev] stops every container in this repo

# production
$ make build                    # [prod] builds the production image
$ make up                       # [prod] starts the production container
$ make stop                     # [prod] stops every container in this repo

# misc
$ make logs SERVICE=web-dev      # follows the logs of a given service (web or web-dev)
$ make help                      # lists every available command
```

- Web: http://localhost:3000 (port configurable via `DOCKER_WEB_PORT` in `.env`)
- Needs `cobuccio-wallet-api` running for `NEXT_PUBLIC_API_URL` to resolve.

Both repos must use the same `COMPOSE_PROJECT_NAME` in their `.env` so they join the same Docker network and can reach each other by hostname.

## Getting Started (without Docker)

```bash
$ yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx` — it auto-updates as you edit the file.
