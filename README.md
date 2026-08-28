# Cobuccio Wallet Web

Next.js frontend for the wallet challenge, bootstrapped with `create-next-app`.

## Prerequisites

Everything below is needed on both macOS and Linux. Docker + `make` are enough to run the whole stack (`make up-dev`); Node + Yarn are only needed for commands that run on the host instead of inside a container (`make install`, or any direct `yarn ...` command).

### Docker + Docker Compose

- **macOS**: install [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/) (bundles Docker Compose). Or via Homebrew: `brew install --cask docker`.
- **Linux**: install [Docker Engine](https://docs.docker.com/engine/install/) for your distro (e.g. `curl -fsSL https://get.docker.com | sh` works on most), then the Compose plugin if it isn't already bundled (Debian/Ubuntu: `sudo apt-get install docker-compose-plugin`). Add your user to the `docker` group so you don't need `sudo` for every command: `sudo usermod -aG docker $USER` (log out and back in for it to take effect).

Check with `docker --version` and `docker compose version`.

### `make`

Check first: `make --version`.

- **macOS**: ships with `make` via the Xcode Command Line Tools. If the check above fails: `xcode-select --install`.
- **Linux (Debian/Ubuntu)**: `sudo apt-get update && sudo apt-get install -y make`
- **Linux (Fedora/RHEL)**: `sudo dnf install -y make`
- **Linux (Arch)**: `sudo pacman -S make`

`make` itself also checks for Docker/Docker Compose (`check-docker`) and fails with a clear error if either is missing.

### Node.js (via nvm) + Yarn

This repo pins its Node version in `.nvmrc`. Install nvm following the [official instructions](https://github.com/nvm-sh/nvm#installing-and-updating) (same install script for macOS and Linux), then, from inside this repo:

```bash
$ nvm install   # reads .nvmrc automatically
$ nvm use
```

Yarn (Classic, v1) is the package manager used throughout. If it's not already installed:

```bash
$ npm install --global yarn
```

## Docker (Makefile)

This repo is self-contained: it has its own `Makefile`, `docker-compose.yml` and `.env.example`.

### Getting started

From scratch, running these in order gets you a working frontend in dev mode (needs `cobuccio-wallet-api` already running — see its README):

```bash
$ cp .env.example .env    # the Makefile also does this automatically on the first run of any command
$ make install              # installs dependencies locally
$ make build-dev              # builds the dev image
$ make up-dev                  # starts the web app in dev mode (hot reload) at http://localhost:3000
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
$ make install
$ make test
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx` — it auto-updates as you edit the file.
