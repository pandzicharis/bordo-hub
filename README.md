# Service Access

- API Gateway: http://localhost:8080
- Auth Service: http://auth-service:3000
- Postgres: localhost:5432 (username: admin, pass: admin)
- Migrations: make migrate-up

http://host.docker.internal:4100 dodati u grafanu prilikom povezivanja na loki

napraviti folder logs i dba file-a - ako ne postoji

1. make infra-init
2. make kong-init
3. make logger-init

Gasenje
make infra-down
