include .env
export $(shell sed 's/=.*//' .env)

DOCKER_COMPOSE_DB = docker compose -f infra/db/docker-compose.yml
DOCKER_COMPOSE_API_GATEWAY = docker compose -f infra/api-gateway/docker-compose.yml
NEST_ROOT = docker compose -f services/nest/docker-compose.yml
PYTHON_ROOT = docker compose -f services/python/docker-compose.yml
DOTNET_ROOT = docker compose -f services/dotnet/docker-compose.yml

up:
	@echo "Check app network..."
	@docker network ls | grep app-network || docker network create app-network

	@echo "Starting API Gateway..."
	$(DOCKER_COMPOSE_API_GATEWAY) up --build -d kong-database kong-migrations && \
	$(DOCKER_COMPOSE_API_GATEWAY) up --build -d kong
	
	@echo "Starting postgres server..."
	$(DOCKER_COMPOSE_DB) up --build -d
	
	@echo "Starting Nest server..."
	$(NEST_ROOT) up --build -d
	
	@echo "Starting Python server..."
	$(PYTHON_ROOT) up --build -d

	@echo "Starting dotnet server..."
	$(DOTNET_ROOT) up --build -d

kong:
	./scripts/init-kong.sh