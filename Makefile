include .env
export $(shell sed 's/=.*//' .env)

DOCKER_COMPOSE_DB = docker compose -f infra/db/docker-compose.yml
DOCKER_COMPOSE_API_GATEWAY = docker compose -f infra/api-gateway/docker-compose.yml
NEST_ROOT = docker compose -f services/nest/docker-compose.yml
PYTHON_ROOT = docker compose -f services/python/docker-compose.yml
DOTNET_ROOT = docker compose -f services/dotnet/docker-compose.yml

GO_MIGRATE_DB_URL='postgresql://$(DB_USER):$(DB_PASSWORD)@postgres:5432/$(DB_NAME)?sslmode=disable'

LOGGER_LGP = docker compose -f infra/logging/docker-compose.yml

infra-init:
	@echo "Check app network..."
	@docker network ls | grep app-network || docker network create app-network

	@echo "Starting API Gateway..."
	$(DOCKER_COMPOSE_API_GATEWAY) up --build -d kong-database kong-migrations && \
	$(DOCKER_COMPOSE_API_GATEWAY) up --build -d kong
	
	@echo "Starting postgres server..."
	$(DOCKER_COMPOSE_DB) up postgres --build -d
	
	@echo "Starting Nest server..."
	$(NEST_ROOT) up --build -d
	
	@echo "Starting Python server..."
	$(PYTHON_ROOT) up --build -d

	@echo "Starting dotnet server..."
	$(DOTNET_ROOT) up --build -d

kong-init:
	./infra/api-gateway/init-kong.sh

migrate-create:
	$(DOCKER_COMPOSE_DB) run --rm --no-deps migrate create -ext sql -dir /app/migrations -seq $(name)

migrate-up:
	$(DOCKER_COMPOSE_DB) run --rm --no-deps migrate \
	-path=/app/migrations \
	-database $(GO_MIGRATE_DB_URL) up

logger-init:
	$(LOGGER_LGP) up --build -d
	cd infra/logging && ./init.sh
