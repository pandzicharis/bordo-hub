#!/bin/bash

EMAIL="haris@example.com"
PASSWORD="password123"

echo "Waiting for services to be ready..."
sleep 15

echo "Creating default user via API..."
RESPONSE=$(curl -s -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$RESPONSE" | grep -q "already exists\|successfully\|id\|email"; then
    echo "Default user created or already exists!"
    echo "Email: $EMAIL"
    echo "Password: $PASSWORD"
    echo "Response: $RESPONSE"
else
    echo "Failed to create default user"
    echo "Response: $RESPONSE"
    exit 1
fi 