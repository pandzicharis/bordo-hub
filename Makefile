# Load environment variables from .env file
ifneq (,$(wildcard .env))
	include .env
	export
endif

# Compose command shortcuts
DOCKER_COMPOSE_DB = docker compose -f infra/db/docker-compose.yml
DOCKER_COMPOSE_API_GATEWAY = docker compose -f infra/api-gateway/docker-compose.yml
NEST_ROOT = docker compose -f services/nest/docker-compose.yml
PYTHON_ROOT = docker compose -f services/python/docker-compose.yml
DOTNET_ROOT = docker compose -f services/dotnet/docker-compose.yml
LOGGER_LGP = docker compose -f infra/logging/docker-compose.yml
CACHE_ROOT = docker compose -f infra/cache/docker-compose.yml
EVENTS_ROOT = docker compose -f infra/events/docker-compose.yml

# Migration URL
GO_MIGRATE_DB_URL = postgresql://$(SHARED_DB_USER):$(SHARED_DB_PASSWORD)@postgres:$(SHARED_DB_PORT)/$(SHARED_DB_NAME)?sslmode=disable

# ========== INFRA ==========
infra-init:
	@echo "🔌 Create network..."
	@docker network ls | grep app-network || docker network create app-network

	@echo "🐘 Starting Kong DB..."
	$(DOCKER_COMPOSE_API_GATEWAY) up -d kong-database
	@echo "⏳ Waiting for Postgres..."
	@sleep 5

	@echo "🔧 Running migrations..."
	@if ! docker exec kong-database psql -U $(KONG_POSTGRES_USER) -d $(KONG_POSTGRES_DB) -c "SELECT * FROM schema_migrations;" > /dev/null 2>&1; then \
		echo "⚙️  There is not migrations, starting bootstrap..."; \
		$(DOCKER_COMPOSE_API_GATEWAY) run --rm kong-migrations; \
	else \
		echo "✅ Migrations done."; \
	fi

	@echo "🚀 Starting Kong gateway..."
	$(DOCKER_COMPOSE_API_GATEWAY) up -d kong

	@echo "🗄️  Starting cache..."
	$(CACHE_ROOT) up -d --build 

	@echo "🗄️  Starting events..."
	$(EVENTS_ROOT) up -d --build 

	@echo "🗄️  Starting services..."
	$(DOCKER_COMPOSE_DB) up -d --build shared-db
	$(DOCKER_COMPOSE_DB) up -d --build nest-db
	$(DOCKER_COMPOSE_DB) up -d --build python-db
	$(DOCKER_COMPOSE_DB) up -d --build dotnet-db
	$(NEST_ROOT) up -d --build
	$(PYTHON_ROOT) up -d --build
	$(DOTNET_ROOT) up -d --build


infra-down:
	@echo "🛑 Removing API Gateway..."
	$(DOCKER_COMPOSE_API_GATEWAY) down -v 

	@echo "🛑 Removing DB..."
	$(DOCKER_COMPOSE_DB) down -v

	@echo "🛑 Removing Nest..."
	$(NEST_ROOT) down -v

	@echo "🛑 Removing Python..."
	$(PYTHON_ROOT) down -v

	@echo "🛑 Removing .NET..."
	$(DOTNET_ROOT) down -v

	@echo "🛑 Removing logger..."
	$(LOGGER_LGP) down -v

	@echo "🛑 Removing cache..."
	$(CACHE_ROOT) down -v

	@echo "🛑 Removing events..."
	$(EVENTS_ROOT) down -v

# ========== KONG ==========
kong-init:
	./infra/api-gateway/init-kong.sh

# ========== MIGRATIONS ==========
migrate-create:
	$(DOCKER_COMPOSE_DB) run --rm --no-deps migrate create -ext sql -dir /app/migrations -seq $(name)

migrate-up:
	$(DOCKER_COMPOSE_DB) run --rm --no-deps migrate \
		-path=/app/migrations \
		-database $(GO_MIGRATE_DB_URL) up

# ========== LOGGER ==========
logger-init:
	$(LOGGER_LGP) up --build -d
	cd infra/logging && ./init.sh
