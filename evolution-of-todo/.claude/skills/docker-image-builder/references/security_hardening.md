# Docker Security Hardening Guide

## User Privilege Management

### Create Non-Root User
```dockerfile
# Alpine Linux
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Debian/Ubuntu
RUN groupadd -g 1001 -S appuser && \
    useradd -u 1001 -S appuser -g appuser

# Switch to user
USER appuser
```

**Why**:
- Root compromise = full container compromise
- Non-root prevents privilege escalation
- UID >1000 ensures non-system user

### Set File Ownership
```dockerfile
# Correct ownership during COPY
COPY --chown=appuser:appuser src/ /app/

# Or after copying
RUN chown -R appuser:appuser /app
```

## Secrets Management

### DO NOT: Hardcode Secrets
```dockerfile
# WRONG - Secret persists in image
ENV DATABASE_PASSWORD=secret123

# WRONG - Secret in layer
RUN export API_KEY=secret && npm install
```

### DO: Use Build Secrets
```dockerfile
# Dockerfile
RUN --mount=type=secret,id=npm_token \
    cat /run/secrets/npm_token > ~/.npmrc && \
    npm ci && \
    rm ~/.npmrc

# Build command
docker build --secret npm_token=~/.npmrc .
```

### DO: Use Runtime Secrets
```yaml
# docker-compose.yml
services:
  app:
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_pass
    secrets:
      - db_pass

secrets:
  db_pass:
    file: ./db_password.txt
```

## Base Image Security

### Image Selection Strategy
```dockerfile
# Minimal: Preferred
FROM distroless/base-debian11

# Alpine: Good balance
FROM alpine:3.18

# Slim: More compatibility
FROM debian:bookworm-slim

# Standard: Largest, most tools
FROM debian:bookworm

# Avoid in production
FROM ubuntu:latest  # 75MB+
FROM centos:latest  # 200MB+
```

### Vulnerability Scanning
```bash
# Scan before use
trivy image alpine:3.18
docker scan alpine:3.18

# Pin specific version after scanning
FROM alpine:3.18.2  # Not just 3.18
```

### Keep Updated
```bash
# Periodically rebuild images
docker build --pull --no-cache .
```

## File System Security

### Read-Only Filesystem
```yaml
# docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/tmp
```

### Restrict Permissions
```dockerfile
# Remove world-readable
RUN chmod 600 /app/config.yaml

# Remove write access
RUN chmod 555 /app/bin/app

# Set directory ownership
RUN mkdir -p /app/uploads && \
    chown appuser:appuser /app/uploads && \
    chmod 755 /app/uploads
```

### Remove Unnecessary Tools
```dockerfile
# Alpine - minimal by default
FROM alpine:3.18

# Don't add development tools
# Don't add shell if not needed
RUN apk add --no-cache \
    ca-certificates \  # Only what's needed
    curl
```

## Network Security

### Expose Minimal Ports
```dockerfile
# Expose only application port
EXPOSE 8080

# Don't expose database/admin ports
# Don't expose SSH (22)
```

### Container Runtime Isolation
```yaml
# docker-compose.yml
services:
  app:
    cap_drop:
      - ALL  # Drop all capabilities
    cap_add:
      - NET_BIND_SERVICE  # Add back only needed
```

## Image Security Features

### Labels for Metadata
```dockerfile
LABEL org.opencontainers.image.title="My App" \
      org.opencontainers.image.description="Secure app" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.source="https://github.com/user/repo" \
      security.scan.date="2024-01-01"
```

### Health Checks
```dockerfile
# Application-specific check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Detects hung processes
HEALTHCHECK --interval=60s --timeout=5s --start-period=10s \
    CMD test -f /tmp/healthy || exit 1
```

## Build Security

### Use .dockerignore
```
# .dockerignore
.git/
.github/
.gitignore
.dockerignore
.env.local
.env.*.local
node_modules/
npm-debug.log*
yarn-error.log*
__pycache__/
*.pyc
.pytest_cache/
.coverage
htmlcov/
dist/
build/
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
```

### Scan Builds
```bash
# Before pushing
docker scan myapp:latest

# Use Trivy for detailed analysis
trivy image --severity HIGH,CRITICAL myapp:latest

# Sign images
cosign sign --key cosign.key myapp:latest
```

## Production Security Checklist

- [ ] Runs as non-root user (UID >1000)
- [ ] Uses specific base image version
- [ ] Image scanned for vulnerabilities
- [ ] Secrets managed externally
- [ ] Health check implemented
- [ ] File permissions restrictive
- [ ] No development tools in image
- [ ] Read-only filesystem tested
- [ ] Network ports minimal
- [ ] Capabilities dropped where possible
- [ ] Labels included
- [ ] Image signed (cosign/notation)
- [ ] Supply chain security verified
- [ ] Dependencies pinned

## Container Runtime Security

### Run with Security Options
```bash
docker run \
  --read-only \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  -u 1001:1001 \
  -e DATABASE_URL=postgres://... \
  myapp:latest
```

### Docker Compose Example
```yaml
services:
  app:
    image: myapp:1.0.0
    user: "1001:1001"
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    security_opt:
      - no-new-privileges:true
    environment:
      DATABASE_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password
```

## Minimal Image Example (Go)

```dockerfile
# Stage 1: Build
FROM golang:1.20-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Stage 2: Runtime (distroless - no shell!)
FROM distroless/base-debian11

# Create user at build time
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Copy binary
COPY --from=builder /app /app

# Copy certs
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs/

USER appuser
EXPOSE 8080

# No shell available in distroless
ENTRYPOINT ["/app"]
```

**Security features**:
- No shell (can't exec)
- Minimal base image (only libc)
- Non-root user
- Read-only filesystem
- No package manager vulnerabilities

## Vulnerability Severity Levels

| Severity | CVSS | Action |
|----------|------|--------|
| CRITICAL | 9.0-10.0 | Patch immediately |
| HIGH | 7.0-8.9 | Patch within 1 week |
| MEDIUM | 4.0-6.9 | Patch within 30 days |
| LOW | 0.1-3.9 | Monitor |

## Key Security Principles

1. **Principle of Least Privilege**: Only include necessary files, capabilities, and permissions
2. **Defense in Depth**: Multiple security layers (base image, user, capabilities, read-only, network)
3. **Immutability**: Don't modify running containers
4. **Scanning**: Always scan before deployment
5. **Secrets Separation**: Never bake secrets into images
6. **Keep Updated**: Rebuild regularly with latest base images
7. **Supply Chain**: Verify image source and integrity
