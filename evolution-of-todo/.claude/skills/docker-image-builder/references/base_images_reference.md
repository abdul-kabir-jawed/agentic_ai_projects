# Base Image Comparison & Selection Guide

## Base Image Selection Matrix

| Image | Size | Use Case | Notes |
|-------|------|----------|-------|
| `alpine:3.18` | 7MB | Python, Ruby, Node.js | Minimal, musl libc, glibc issues rare |
| `debian:bookworm-slim` | 80MB | Python, Node.js, Ruby | Better compatibility, smaller than full |
| `debian:bookworm` | 125MB | When you need tools | Full Debian, includes apt utilities |
| `ubuntu:22.04` | 77MB | Broader compatibility | Familiar to Linux users |
| `distroless/base` | 20MB | Go, Java, compiled | No shell, no package manager |
| `distroless/base-debian11` | 20MB | Go, Java, C++ | Minimal, no glibc development tools |
| `python:3.11-alpine` | 50MB | Python apps | Python + Alpine base |
| `python:3.11-slim` | 150MB | Python apps | Python + Debian slim |
| `python:3.11` | 900MB | Python (dev) | Full Python dev environment |
| `node:18-alpine` | 170MB | Node.js apps | Node + Alpine |
| `node:18-slim` | 200MB | Node.js apps | Node + Debian slim |
| `node:18` | 900MB | Node.js (dev) | Full environment |
| `golang:1.20-alpine` | 370MB | Go (build stage) | Go + Alpine for compilation |
| `openjdk:17-jdk-slim` | 270MB | Java build stage | JDK + Debian slim |
| `openjdk:17-jre-slim` | 200MB | Java runtime | JRE only (smaller) |
| `maven:3.8-openjdk-17` | 570MB | Java build stage | Maven + JDK |
| `ruby:3.2-slim` | 150MB | Ruby apps | Ruby + Debian slim |
| `ruby:3.2-alpine` | 60MB | Ruby apps | Ruby + Alpine |

## Python Selection Decision Tree

```
Are you using Python?
├─ Yes, need minimal size?
│  └─ Use: python:3.11-alpine (50MB)
├─ Yes, need better compatibility?
│  └─ Use: python:3.11-slim (150MB)
└─ Yes, development/testing?
   └─ Use: python:3.11 (900MB)
```

### Alpine Compatibility Issues
Alpine uses `musl` libc instead of `glibc`.

**Packages that may have issues**:
- scipy, numpy (pre-compiled wheels not available)
- Some packages with C extensions
- Packages requiring glibc-specific features

**Solution**: Use slim if Alpine fails

## Node.js Selection Guide

```
Node.js Application?
├─ Next.js (production)?
│  └─ node:18-alpine (170MB) + multi-stage + standalone
├─ Express/other Node apps?
│  └─ node:18-alpine (170MB) + multi-stage
└─ Build stage (temporary)?
   └─ node:18-slim (200MB) for builder stage
```

### Next.js Specific
```dockerfile
# Use standalone mode for smaller image
FROM node:18-alpine AS builder
COPY . .
RUN npm ci && npm run build

# Runtime only needs .next and node_modules
FROM node:18-alpine
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
```

Result: 250-350MB (vs 1GB+ without optimization)

## Go Selection Guide

```
Building Go application?
├─ Can use distroless?
│  ├─ Binary is static/CGO_ENABLED=0?
│  │  └─ Use: distroless/base-debian11 (20MB)
│  └─ Binary needs glibc?
│     └─ Use: alpine:3.18 (7MB) + binary
└─ Can't use distroless?
   └─ Use: golang:1.20-alpine (370MB) for build only
```

### Go Multi-Stage Example
```dockerfile
# Stage 1: 370MB builder
FROM golang:1.20-alpine AS builder
RUN go build -o app .

# Stage 2: 20MB distroless
FROM distroless/base-debian11
COPY --from=builder /app /app
ENTRYPOINT ["/app"]
# Final: 20-50MB!
```

## Java Selection Guide

```
Java Application?
├─ Compiling from source?
│  ├─ Spring Boot JAR?
│  │  ├─ Builder: maven:3.8-openjdk-17 (570MB)
│  │  └─ Runtime: openjdk:17-jre-slim (200MB)
│  │  └─ Final: 300-500MB
│  └─ Need compiler?
│     └─ Use: openjdk:17-jdk-slim (270MB)
└─ Just running JAR?
   └─ Use: openjdk:17-jre-slim (200MB)
```

### Java Multi-Stage Example
```dockerfile
# Stage 1: 570MB (has mvn + JDK)
FROM maven:3.8-openjdk-17 AS builder
RUN mvn package

# Stage 2: 200MB (just JRE)
FROM openjdk:17-jre-slim
COPY --from=builder /target/app.jar .
# Final: 300-500MB
```

## Ruby Selection Guide

```
Ruby Application?
├─ Rails with assets?
│  ├─ Builder: ruby:3.2-slim (150MB)
│  └─ Runtime: ruby:3.2-slim (150MB)
│  └─ Final: 250-400MB
└─ Small script/gem?
   └─ ruby:3.2-alpine (60MB)
```

## Distroless vs Alpine vs Slim Comparison

### Distroless (Best for compiled languages)
```
Size: 20MB
Includes: libc, ca-certificates, tzdata
Missing: shell, package manager, standard utilities
Use for: Go, Java (JRE only), compiled binaries
Benefit: Minimal attack surface, no shell access
Drawback: Harder to debug, limited utilities
Example: distroless/base-debian11
```

### Alpine (Best for dynamic languages)
```
Size: 5-50MB
Includes: minimal tools, ash shell, apk package manager
Includes: musl libc (not glibc)
Use for: Python, Node, Ruby
Benefit: Small size, reasonable compatibility
Drawback: musl libc incompatibilities (rare), fewer packages
Example: alpine:3.18, python:3.11-alpine
```

### Slim (Best for compatibility)
```
Size: 80-200MB
Includes: Debian base, apt, bash, common utilities
Use for: When Alpine fails, broader compatibility needs
Benefit: Drop-in replacement, broad package support
Drawback: Larger than Alpine
Example: debian:bookworm-slim, python:3.11-slim
```

## Image Size Comparison Examples

### Python FastAPI
```
Base: python:3.11 (900MB) → +dependencies (100MB) = 1000MB
Base: python:3.11-slim (150MB) → +dependencies (100MB) = 250MB
Base: python:3.11-alpine (50MB) → +dependencies (100MB) = 150MB
Multi-stage alpine: 150MB
```

### Node.js Express
```
Base: node:18 (900MB) → +npm packages (200MB) = 1100MB
Base: node:18-slim (200MB) → +npm packages (200MB) = 400MB
Base: node:18-alpine (170MB) → +npm packages (200MB) = 370MB
Multi-stage alpine: 200-300MB
```

### Go API
```
Base: golang:1.20-alpine (370MB) for build only
Final: distroless (20MB) + binary = 50-80MB
```

### Spring Boot
```
Build: maven:3.8-openjdk-17 (570MB)
Runtime: openjdk:17-jre-slim (200MB) + JAR (50MB) = 250MB
Multi-stage result: 300-500MB
```

## Vulnerability Considerations

### Alpine Vulnerabilities
- Smaller surface area (fewer packages)
- musl libc has fewer publicized CVEs
- Still needs security scanning

### Debian Slim Vulnerabilities
- Standard glibc (more researched)
- More package management
- Needs regular updates and scanning

### Distroless Vulnerabilities
- Minimal attack surface
- Only base OS libraries
- Fewer dependencies = fewer vulnerabilities

## Selection Quick Reference

**Smallest possible**: Distroless + compiled language (20-80MB)
**Small & compatible**: Alpine + dynamic language (50-200MB)
**Maximum compatibility**: Debian slim + language (150-300MB)
**For production**: Always multi-stage regardless of base

## Updating Base Images

```bash
# Regular security updates
FROM python:3.11.5-alpine3.18  # Specific patch version
FROM node:18.18.0-alpine       # Not just node:18

# Rebuild periodically
docker build --pull --no-cache .

# Check for vulnerabilities
trivy image python:3.11.5-alpine3.18
```

## Summary Table: Final Image Size Targets

| Language | Multi-Stage | Base | Expected Final Size |
|----------|-------------|------|-------------------|
| Python | Yes | Alpine | 150-250MB |
| Node.js | Yes | Alpine | 200-350MB |
| Go | Yes | Distroless | 30-80MB |
| Java | Yes | JRE-slim | 300-500MB |
| Ruby | Yes | Slim | 250-400MB |
| Rust | Yes | Distroless | 20-100MB |

**Key**: Multi-stage is critical - it reduces final image by 50-80%
