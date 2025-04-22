FROM golang:1.21

WORKDIR /app

RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@v4.17.1

ENV PATH="/go/bin:${PATH}"

ENTRYPOINT ["migrate"]
