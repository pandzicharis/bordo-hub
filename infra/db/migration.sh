#!/bin/bash

if [ -z "$1" ]; then
  echo "Please setup migration name!"
  exit 1
fi

MIGRATION_NAME=$1
TIMESTAMP=$(date +%Y%m%d%H%M%S)

touch ./migrations/${TIMESTAMP}_${MIGRATION_NAME}.up.sql
touch ./migrations/${TIMESTAMP}_${MIGRATION_NAME}.down.sql

echo "Migration ${TIMESTAMP}_${MIGRATION_NAME} created."
