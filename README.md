# Service Access

- API Gateway: http://localhost:8080
- Auth Service: http://auth-service:3000
- Postgres: localhost:5432 (username: admin, pass: admin)
- Migrations: make migrate-up

http://host.docker.internal:4100 dodati u grafanu prilikom povezivanja na loki

napraviti folder logs i dba file-a - ako ne postoji

1. make infra-init - pokrece sve servise, od servera, baza, loging sistema i migracija, kong-a

Gasenje
make infra-down

Kreiranje migracija:

shared baza:

1. make migrate-up_shared name=test - ovo ce kreirati dva migracijska fajla, za up i down, gdje je potrebno rucno nakucati sql kod za tu migraciju
2. migrate-up_shared - ovo ce pokrenuti sve migracije i applyati na bazu

nest baza:

1. make migrate-create_nest name=test - ovo ce kreirati i APPLYATI migraciju na bazu na osnovu prisma scheme
2. opcionalno se moze pozvati i make migrate-up_nest koji ce applyati sve zadnje migracije na bazu

python baza:

1. make migrate-create_python name=test - ovo ce napraviti jedan fajl u kojem je potrebno unijeti kod za migraciju pisan u alembic
2. kada napravimo kod, migraciju moramo applyati rucno preko komande make migrate-up_python
