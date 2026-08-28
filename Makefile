#!make
SHELL := $(shell which bash || echo 'no-bash')
GIT := $(shell which git || echo 'no-git')

all: help

# Creates .env from .env.example, if it does not exist yet
ENV_FILE := ./.env
$(ENV_FILE):
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Creating .env file..."; \
		cp ./.env.example $(ENV_FILE); \
	else \
		echo ".env file already exists. Keeping current file."; \
	fi

include $(ENV_FILE)

SYSTEM_VERSION := $(if ${IMAGE_VERSION},$(shell echo "${IMAGE_VERSION}"),$(shell $(GIT) describe --tag --dirty=-local-changes --always 2>/dev/null || echo "dev"))

# Checks if Docker and Docker Compose are installed
DOCKER_CMD_PATH=$(shell which docker >/dev/null 2>&1 && echo "docker" || echo "no-docker")
DOCKER_COMPOSE_CMD=$(shell (docker compose version >/dev/null 2>&1 && echo "docker compose") || (which docker-compose >/dev/null 2>&1 && echo "docker-compose") || echo "no-docker")

DOCKER_ENV=SYSTEM_VERSION=${SYSTEM_VERSION}
DOCKER_CMD=${DOCKER_ENV} docker
DOCKER_COMPOSE=${DOCKER_ENV} ${DOCKER_COMPOSE_CMD} -f docker-compose.yml

# BSD sed (macOS) requires a backup suffix right after -i, GNU sed (Linux) does not.
# Without this, macOS treats the next "-e" as the suffix and leaves a stray ".env-e" file behind.
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
	SED_INPLACE := sed -i ''
else
	SED_INPLACE := sed -i
endif

check-docker:
	@echo "Checking Docker and Docker Compose..."
ifeq ($(DOCKER_CMD_PATH), no-docker)
	$(error "Docker not found")
endif
ifeq ($(DOCKER_COMPOSE_CMD), no-docker)
	$(error "Docker Compose not found")
endif

versions: ## Sets NODE_VERSION and SYSTEM_VERSION into the .env file
	@echo "System version: ${SYSTEM_VERSION}"
	@echo "${SYSTEM_VERSION}" > ./.version
	@export NODE_VERSION=$$(cat ./.nvmrc | sed -e 's/v//g' | sed -e 's/\//-/g'); \
		echo "Node [$$NODE_VERSION]"; \
		${SED_INPLACE} -e "s|^NODE_ENV=.*|NODE_ENV=${ENV_RUN}|" ./.env; \
		${SED_INPLACE} -e "s|^NODE_VERSION=.*|NODE_VERSION=$$NODE_VERSION|" ./.env; \
		${SED_INPLACE} -e "s|^SYSTEM_VERSION=.*|SYSTEM_VERSION=${SYSTEM_VERSION}|" ./.env

## --- Dependencies ---

install: ## Installs project dependencies locally (yarn, outside Docker)
	@yarn install

## --- Tests ---
## Run directly on the host (like `make install`), not inside Docker.

test: ## Runs unit tests
	@yarn test

test-watch: ## Runs unit tests in watch mode
	@yarn test:watch

## --- Development ---

build-dev: check-docker versions ## [dev] Builds the development image
	@${DOCKER_COMPOSE} build web-dev

up-dev: check-docker versions ## [dev] Starts the development container (hot reload)
	@${DOCKER_COMPOSE} up -d --force-recreate web-dev

stop-dev: check-docker versions ## [dev] Stops every container in this repo
	@${DOCKER_COMPOSE} down

## --- Production ---

build: check-docker versions ## [prod] Builds the production image
	@${DOCKER_COMPOSE} build web

up: check-docker versions ## [prod] Starts the production container
	@${DOCKER_COMPOSE} up -d --force-recreate web

stop: check-docker versions ## [prod] Stops every container in this repo
	@${DOCKER_COMPOSE} down

## --- Misc ---

logs: check-docker ## Shows the logs. Usage: make logs SERVICE=web|web-dev
	@${DOCKER_COMPOSE} logs -f $(SERVICE)

help: versions ## Shows this help
	@echo
	@echo "Available commands:"
	@echo
	@sed -n -E -e 's|^([a-zA-Z0-9_-]+):.+## (.+)|\1@\2|p' $(MAKEFILE_LIST) | column -s '@' -t
	@echo

# vim: set ts=4 sw=4 tw=0 noet :
