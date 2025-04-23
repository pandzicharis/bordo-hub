#!/bin/bash

set -a
source .env
set +a

# URL's
KONG_ADMIN_API_URL="http://localhost:${KONG_ADMIN_API_HTTP_PORT}"


# VARIABLES

# DOTNET
DOTNET_PATH=dotnet
DOTNET_ROUTE=dotnet-route
DOTNET_SERVICE=dotnet-service

# PYTHON
PYTHON_PATH=python
PYTHON_ROUTE=python-route
PYTHON_SERVICE=python-service

# NEST
NEST_PATH=nest
NEST_ROUTE=nest-route
NEST_SERVICE=nest-service

echo "🕒 Waiting for ${KONG_ADMIN_API_URL}..."
until curl -s "${KONG_ADMIN_API_URL}/status" >/dev/null; do
  sleep 2
done

echo "✅ Kong je spreman. Registrujem servise i rute..."

# DOTNET
curl -i -X POST "${KONG_ADMIN_API_URL}/services" \
  --data name="${DOTNET_SERVICE}" \
  --data url="http://host.docker.internal:${DOTNET_PORT}"

curl -i -X POST "${KONG_ADMIN_API_URL}/routes/" \
  --data "name=${DOTNET_ROUTE}" \
  --data "paths[]=/${DOTNET_PATH}" \
  --data "strip_path=true" \
  --data "service.name=${DOTNET_SERVICE}"

# PYTHON
curl -i -X POST "${KONG_ADMIN_API_URL}/services" \
  --data name="${PYTHON_SERVICE}" \
  --data url="http://host.docker.internal:${PYTHON_PORT}"

curl -i -X POST "${KONG_ADMIN_API_URL}/routes/" \
  --data "name=${PYTHON_ROUTE}" \
  --data "paths[]=/${PYTHON_PATH}" \
  --data "strip_path=true" \
  --data "service.name=${PYTHON_SERVICE}"

# NEST
curl -i -X POST "${KONG_ADMIN_API_URL}/services" \
  --data name="${NEST_SERVICE}" \
  --data url="http://host.docker.internal:${NEST_PORT}"

curl -i -X POST "${KONG_ADMIN_API_URL}/routes/" \
  --data "name=${NEST_ROUTE}" \
  --data "paths[]=/${NEST_PATH}" \
  --data "strip_path=false" \
  --data "service.name=${NEST_SERVICE}"

curl -i -X POST "${KONG_ADMIN_API_URL}:8001/plugins" \
  --data "name=file-log" \
  --data "config.path=/logs/api-gateway.log"