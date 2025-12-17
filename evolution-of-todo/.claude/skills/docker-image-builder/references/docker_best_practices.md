# Docker Best Practices for Image Building

## Optimization Strategies

### 1. Layer Caching
**Principle**: Order commands to maximize cache hits.

**Pattern**: Copy dependency files before application code
```dockerfile
# Good - dependency files change infrequently
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Bad - any code change invalidates cache
COPY . .
RUN npm install
RUN npm run build
```

### 2. Reducing Layers
**Principle**: Combine RUN commands to minimize image layers.

```dockerfile
# Each RUN = new layer
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get clean

# Better - single layer
RUN apt-get update && \
    apt-get install -y python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 3. Multi-Stage Builds
**Principle**: Builder stage contains compile tools, runtime stage contains only runtime.

```dockerfile
# Stage 1: Contains maven (300MB)
FROM maven:3.8 AS builder
RUN mvn package

# Stage 2: Only needs Java runtime (150MB)
FROM openjdk:17-jdk-slim
COPY --from=builder /app/target/*.jar .
```

Benefits:
- Reduces final image size by 50-80%
- Excludes build tools from production
- Faster deployments

### 4. Image Size Optimization
**Target Size**: <400MB for most apps, <100MB for Go/Rust

**Techniques**:
1. Use alpine base images (5-50MB vs 100-300MB)
2. Use distroless for compiled languages (20-100MB)
3. Remove build tools from final stage
4. Clean package manager caches
5. Delete temp files after build
6. Don't copy unnecessary files

```dockerfile
# Save 200MB by cleaning apt cache
RUN apt-get update && \
    apt-get install -y mypackage && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 5. Build Context Optimization
**Principle**: .dockerignore excludes files from build context.

```dockerfile
# .dockerignore
node_modules/
.git/
.env.local
__pycache__/
.pytest_cache/
.next/
build/
dist/
coverage/
.DS_Store
```

**Impact**: Can reduce build context from 500MB to 50MB

## Security Hardening

### 1. Non-Root User
**Always** run containers as non-root user.

```dockerfile
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

USER appuser
```

UID should be >1000 (system UIDs are 0-1000).

### 2. Minimal Base Images
- `alpine:latest` - 5MB, minimal utilities
- `debian:bookworm-slim` - 80MB, broader compatibility
- `distroless/base` - 20MB, only OS utilities (Go/Java)
- **Avoid**: ubuntu (75MB), centos (200MB), full Debian (300MB)

### 3. Specific Versions
```dockerfile
# Bad - image changes with updates
FROM python:latest
FROM python:3.11

# Good - predictable, auditable
FROM python:3.11.5-alpine3.18
```

### 4. Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
```

### 5. Read-Only Filesystem
```yaml
# In docker-compose.yml
services:
  app:
    read_only: true
    tmpfs: /tmp
```

### 6. Least Privilege
```dockerfile
# Create with minimal permissions
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 && \
    mkdir -p /app && \
    chown -R appuser:appuser /app
```

## Common Pitfalls

| Pitfall | Impact | Solution |
|---------|--------|----------|
| No multi-stage builds | 2-5x larger images | Always separate builder/runtime |
| Running as root | Security risk | Add USER directive |
| Missing .dockerignore | Slow builds, large context | Exclude unnecessary files |
| `FROM xxx:latest` | Non-reproducible | Pin specific versions |
| Multiple RUN commands | More layers | Use && to combine |
| Copying entire directory | Cache invalidation | Copy dependencies first |
| Not cleaning caches | Larger images | Run apt/yum clean |
| Missing HEALTHCHECK | No health monitoring | Add application-specific check |
| Dev dependencies in final image | Larger, less secure | Use multi-stage with --only=production |
| Hardcoded secrets | Security breach | Use build secrets or env vars |

## Caching Strategy

### Good Caching
```dockerfile
# Dependency file changes rarely
COPY package.json ./
RUN npm install
# This cache is valid for many builds

# Application code changes frequently
COPY . .
RUN npm run build
# This cache invalidates on every code change
```

### Poor Caching
```dockerfile
# Everything copied at once
COPY . .
RUN npm install
# Even if only code changed, dependencies re-install
```

## Build Performance

### Build Time Optimization
1. Use `--build-arg` to invalidate only changed args
2. Order COPY commands by change frequency
3. Use Docker BuildKit: `DOCKER_BUILDKIT=1 docker build`
4. Use build cache volumes for dependency downloads
5. Minimize number of FROM statements

### BuildKit Benefits
```bash
# Enable BuildKit (default in Docker 20.10+)
DOCKER_BUILDKIT=1 docker build .

# Cache mounts for package managers
RUN --mount=type=cache,target=/root/.npm \
    npm install
```

## Image Size Targets

| App Type | Target Size | Achievable | Base | Technique |
|----------|-------------|-----------|------|-----------|
| Python/FastAPI | 150-250MB | Yes | python:3.11-alpine | Multi-stage |
| Node.js/Express | 150-250MB | Yes | node:18-alpine | Multi-stage |
| Next.js | 200-350MB | Yes | node:18-alpine | Standalone mode |
| Go API | 20-50MB | Yes | distroless | Compiled binary |
| Java/Spring | 300-500MB | Yes | openjdk-slim | Multi-stage |
| Ruby/Rails | 250-400MB | Yes | ruby:slim | Multi-stage |

## Production Readiness Checklist

- [ ] Uses multi-stage build
- [ ] Final image <400MB
- [ ] Runs as non-root user (UID >1000)
- [ ] Base image has specific version (not latest)
- [ ] HEALTHCHECK defined
- [ ] No hardcoded secrets
- [ ] .dockerignore optimized
- [ ] All RUN commands use && chaining
- [ ] Package caches cleaned
- [ ] File permissions set correctly
- [ ] Labels included for metadata
- [ ] Passes security scan
- [ ] Tested in Kubernetes
- [ ] Scanned for vulnerabilities
- [ ] Size acceptable for distribution

## Vulnerability Scanning

```bash
# Scan image with Trivy
trivy image myapp:latest

# Scan with Grype
grype myapp:latest

# Docker official scanning
docker scan myapp:latest
```

Common vulnerabilities:
- Outdated base image (missing security patches)
- Unvetted OS packages
- Hardcoded credentials
- Running as root
- No version pinning
