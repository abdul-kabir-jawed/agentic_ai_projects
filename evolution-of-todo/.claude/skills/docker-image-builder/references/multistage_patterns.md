# Multi-Stage Build Patterns by Language

This reference provides tested multi-stage Dockerfile patterns for common application types.

## Python & FastAPI

### Pattern: Python 3.11 FastAPI with Alpine

```dockerfile
# Stage 1: Builder
FROM python:3.11-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev libffi-dev openssl-dev

# Copy dependency file first (optimize caching)
COPY requirements.txt .

# Install dependencies to a virtual environment
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

# Copy application code
COPY --chown=appuser:appuser . .

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Pattern: Django with Slim Debian

```dockerfile
# Stage 1: Builder
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

RUN groupadd -g 1001 -S appuser && \
    useradd -S appuser -u 1001 -g appuser

COPY --from=builder /opt/venv /opt/venv
COPY --chown=appuser:appuser . .

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "config.wsgi"]
```

## Node.js & Next.js

### Pattern: Next.js with Node 18 Alpine

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm install --frozen-lockfile; \
    else npm ci; fi

# Stage 2: Builder
FROM node:18-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    PORT=3000

EXPOSE 3000

USER nextjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "server.js"]
```

### Pattern: Express.js with Node 18 Alpine

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production

# Stage 2: Builder (with dev dependencies)
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodeuser && \
    adduser -S nodeuser -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodeuser /app/dist ./dist
COPY --from=builder --chown=nodeuser:nodeuser /app/package*.json ./

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000
USER nodeuser

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

## Go

### Pattern: Go with Distroless (Minimal)

```dockerfile
# Stage 1: Builder
FROM golang:1.20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" \
    -o /app/bin/main ./cmd/main.go

# Stage 2: Runtime (distroless)
FROM gcr.io/distroless/base-debian11

WORKDIR /app

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

COPY --from=builder /app/bin/main /app/main

EXPOSE 8080

ENTRYPOINT ["/app/main"]
```

### Pattern: Go with Alpine

```dockerfile
# Stage 1: Builder
FROM golang:1.20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s" \
    -o /app/bin/main ./cmd/main.go

# Stage 2: Runtime
FROM alpine:3.18

RUN apk add --no-cache ca-certificates && \
    addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

COPY --from=builder /app/bin/main /app/main

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s CMD /app/main -health || exit 1

CMD ["/app/main"]
```

## Java

### Pattern: Java Spring Boot with Maven

```dockerfile
# Stage 1: Builder
FROM maven:3.8-openjdk-17-slim AS builder

WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline

COPY . .

RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM openjdk:17-jdk-slim

WORKDIR /app

RUN groupadd -g 1001 -S appuser && \
    useradd -u 1001 -S appuser -g appuser

COPY --from=builder --chown=appuser:appuser /app/target/*.jar /app/app.jar

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

## Ruby

### Pattern: Ruby on Rails

```dockerfile
# Stage 1: Builder
FROM ruby:3.2-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY Gemfile Gemfile.lock ./

RUN bundle install --frozen --without development test

COPY . .

RUN bundle exec rake assets:precompile

# Stage 2: Runtime
FROM ruby:3.2-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* && \
    groupadd -g 1001 -S appuser && \
    useradd -u 1001 -S appuser -g appuser

COPY --from=builder /usr/local/bundle /usr/local/bundle

COPY --from=builder --chown=appuser:appuser /app .

ENV RAILS_ENV=production \
    BUNDLE_PATH=/usr/local/bundle \
    RAILS_SERVE_STATIC_FILES=true

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
```

## Key Principles for All Patterns

1. **Separate Builder and Runtime**: Large build dependencies don't ship in final image
2. **Copy in Optimal Order**: Dependency files first, then source code (optimize cache)
3. **Minimize Layers**: Use && to chain commands
4. **Clean Package Caches**: Remove apt/yum/apk caches after installation
5. **Non-Root User**: Always add USER directive
6. **Health Checks**: Define application-specific health check
7. **Specific Versions**: Never use "latest" tag for base images
8. **File Ownership**: Use --chown during COPY for security
9. **Environment Variables**: Set NODE_ENV=production, PYTHONUNBUFFERED=1, etc.
10. **Expose One Port**: Keep container focused, expose application port

## Size Comparison

| Language | Pattern | Base | Builder | Final | Notes |
|----------|---------|------|---------|-------|-------|
| Python | Alpine | 50MB | +200MB | 150-250MB | Smallest Python option |
| Python | Slim | 120MB | +150MB | 200-300MB | More compatible |
| Node.js | Alpine | 170MB | +150MB | 200-350MB | Next.js with standalone mode |
| Go | Distroless | 20MB | +50MB | 20-80MB | Smallest option available |
| Go | Alpine | 5MB | +50MB | 50-150MB | Minimal with Go runtime |
| Java | Slim | 150MB | +400MB | 300-600MB | Java inherently large |
| Ruby | Slim | 130MB | +300MB | 250-400MB | Rails has many dependencies |

## Optimization Tips

1. **Use distroless for statically-linked binaries** (Go, Rust, C++)
2. **Use Alpine for dynamic languages** (Python, Ruby, Node)
3. **Use slim variants** for better compatibility if Alpine is incompatible
4. **Avoid ubuntu/centos** - use specific-purpose base images
5. **Multi-stage is always worth it** - reduces final image by 50-80%
