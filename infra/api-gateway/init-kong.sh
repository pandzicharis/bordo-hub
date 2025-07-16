#!/bin/bash

set -au
source .env
set +au

# DOCKER
DOCKER_HOST=host.docker.internal

# KONG
KONG_ADMIN_API_URL="http://localhost:${KONG_ADMIN_API_HTTP_PORT}"
JWT_CONSUMER=Z4X6C8V1B3N5M7L9K2J0H4G3

#NEST
NEST_SERVICE="nest-service"
NEST_ROUTE_PUBLIC="nest-auth-route"
NEST_ROUTE_PROTECTED="nest-protected-route"

# DOTNET
DOTNET_ROUTE=dotnet-route
DOTNET_SERVICE=dotnet-service

# PYTHON
PYTHON_ROUTE=python-route
PYTHON_SERVICE=python-service

# Creating Kongo Admin API
echo "🕒 Waiting for Kong Admin API at ${KONG_ADMIN_API_URL}..."
until curl -s "${KONG_ADMIN_API_URL}/status" >/dev/null; do
  sleep 2
done
echo "✅ Kong Admin API is ready."

# Creating nest service
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/services" \
  --data name="${NEST_SERVICE}" \
  --data url="http://${DOCKER_HOST}:${NEST_PORT}"
echo " ✅ Nest service created."

# Creating nest public routes for auth
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/routes" \
  --data name="${NEST_ROUTE_PUBLIC}" \
  --data paths[]="/auth" \
  --data strip_path=false \
  --data service.name="${NEST_SERVICE}"

echo " ✅ Auth service created."

# Creating nest secured routes
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/routes" \
  --data name="${NEST_ROUTE_PROTECTED}" \
  --data paths[]="/nest" \
  --data strip_path=false \
  --data service.name="${NEST_SERVICE}"
echo " ✅ Nest secured service route created."

# Adding JWT plugin to the secured route
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/routes/${NEST_ROUTE_PROTECTED}/plugins" \
  --data name="jwt" \
  --data "config.claims_to_verify=exp"
echo " ✅ JWT added."

# Adding consumer for JWT plugin
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/consumers" \
  --data "username=${JWT_CONSUMER}"
echo " ✅ Consumer created."

# Adding JWT credentials for the consumer
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/consumers/${JWT_CONSUMER}/jwt" \
  --data "key=${JWT_KEY}" \
  --data "secret=${JWT_SECRET}"
echo " ✅ JWT credentials added."

# Adding dotnet service
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/services" \
  --data name="${DOTNET_SERVICE}" \
  --data url="http://${DOCKER_HOST}:${DOTNET_PORT}"
echo " ✅ Dotnet service created."

# Adding dotnet routes
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/routes" \
  --data name="${DOTNET_ROUTE}" \
  --data paths[]="/dotnet" \
  --data strip_path=true \
  --data service.name="${DOTNET_SERVICE}"
echo " ✅ Dotnet route created."

# Adding JWT plugin to the dotnet route
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/routes/${DOTNET_ROUTE}/plugins" \
  --data name="jwt" \
  --data "config.claims_to_verify=exp"
echo " ✅ Dotnet JWT added."

# Adding python service
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/services" \
  --data name="${PYTHON_SERVICE}" \
  --data url="http://${DOCKER_HOST}:${PYTHON_PORT}"
echo " ✅ Python service created."

# Adding python routes
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/routes" \
  --data name="${PYTHON_ROUTE}" \
  --data paths[]="/python" \
  --data strip_path=true \
  --data service.name="${PYTHON_SERVICE}"
echo " ✅ Python route created."

# Addding JWT plugin to python
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/routes/${PYTHON_ROUTE}/plugins" \
  --data name="jwt" \
  --data "config.claims_to_verify=exp"
echo " ✅ Python JWT added."

# Adding CORS plugin to nest-service
curl -s -o /dev/null -w "%{http_code}" -X POST "${KONG_ADMIN_API_URL}/services/${NEST_SERVICE}/plugins" \
  --data "name=cors" \
  --data "config.origins=*" \
  --data "config.headers=Accept,Authorization,Content-Type,Origin" \
  --data "config.credentials=true"
echo " ✅ CORS plugin added to nest-service."

echo "🎉 Kong config DONE!"
