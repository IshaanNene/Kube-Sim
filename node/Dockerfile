FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY main.go .
RUN go mod init node && go build -o node

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/node .
CMD ["./node"]