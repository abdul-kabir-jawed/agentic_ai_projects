---
name: docker-image-builder
description: This skill creates optimized multi-stage Dockerfiles for applications with security best practices. Use this skill when creating new services, optimizing existing Dockerfiles, preparing applications for Kubernetes, or reducing image size below 200-400MB. Targets non-root users and production-ready images.
---

# Docker Image Builder Skill

This skill provides a comprehensive workflow for building optimized, secure, and production-ready Docker images using multi-stage build patterns and industry best practices.

## When to Use This Skill

Apply this skill when:

- **Creating new service container images**: Building Dockerfiles from scratch for microservices or applications
- **Optimizing existing Dockerfiles**: Reducing image size, improving build performance, or adding security features
- **Preparing for Kubernetes deployment**: Creating container images suitable for Kubernetes clusters
- **Reducing image size**: Targeting <400MB for most applications through multi-stage builds and optimization
- **Adjusting deployment targets**: Changing base images or build strategies for different platforms
- **Implementing security hardening**: Adding non-root users, health checks, and vulnerability scanning

## Skill Assets

This skill includes reusable scripts, reference documentation, and template examples organized for quick access.

### Scripts

Execute these Bash scripts to automate Docker image analysis, validation, and security checking:

- `scripts/analyze_app.sh` - Analyze application type, dependencies, and suggest Docker configuration
- `scripts/optimize_dockerfile.sh` - Scan existing Dockerfile for optimization and caching opportunities
- `scripts/scan_dockerfile.sh` - Security scanning for best practices and vulnerability risks

### References

Consult these reference documents for detailed knowledge about Docker patterns and strategies:

- `references/multistage_patterns.md` - Multi-stage build patterns for Python, Node.js, Go, Java, Ruby with size comparisons
- `references/docker_best_practices.md` - Optimization strategies, caching, layer reduction, and size targets
- `references/security_hardening.md` - User privilege management, secrets handling, and security features
- `references/base_images_reference.md` - Base image selection guide with decision trees and vulnerability considerations

### Assets

Use these template files as starting points for specific application types:

- `assets/dockerignore-templates/.dockerignore.nodejs` - .dockerignore for Node.js/Next.js projects
- `assets/dockerignore-templates/.dockerignore.python` - .dockerignore for Python projects
- `assets/dockerignore-templates/.dockerignore.go` - .dockerignore for Go projects

## Workflow: Building Optimized Docker Images

Follow this structured 6-step process to create production-ready Docker images.

### Step 1: Analyze the Application

**Objective**: Understand application structure, dependencies, and identify optimal Docker configuration.

1. **Execute analysis script** to automatically detect application type:
   ```bash
   bash scripts/analyze_app.sh <project-directory>
   ```
   This detects:
   - Application type (Node.js, Python, Go, Java, Ruby)
   - Dependency files and versions
   - Build output directories
   - Development vs runtime dependencies
   - Recommended base images and estimated final size

2. **Review analysis output** which includes:
   - Detected application type and version requirements
   - Dependency count and separation recommendations
   - Project structure analysis (tests, build outputs, etc.)
   - Estimated final image size with optimization
   - Language-specific recommendations

3. **Identify key requirements**:
   - Does application need compilation? (Go, Java, Rust)
   - Are there development-only dependencies? (npm devDependencies, requirements-dev.txt)
   - Are static assets included? (Next.js .next, webpack bundles)
   - What is the target image size? (<200MB recommended)

4. **Plan the build strategy**:
   - **For compiled languages** (Go, Java, Rust): Use builder stage + distroless or minimal runtime
   - **For dynamic languages** (Python, Ruby, Node.js): Use builder stage + slim/alpine runtime
   - **For Next.js**: Use standalone mode for minimal final image size

### Step 2: Design Multi-Stage Build Structure

**Objective**: Plan builder and runtime stages to minimize final image size.

1. **Identify what each stage needs**:

   **Builder Stage**:
   - Base image with build tools (gcc, maven, node, etc.)
   - All dependencies (production + development)
   - Source code for compilation
   - Build commands to create artifacts

   **Runtime Stage**:
   - Minimal base image (distroless, alpine, slim)
   - Only production dependencies (no dev tools)
   - Compiled artifacts or built application
   - Configuration and entrypoint

2. **Plan file copying order** for optimal caching:
   - Copy dependency files first (package.json, requirements.txt, go.mod)
   - Install dependencies in separate RUN command
   - Copy application code last (changes frequently)
   - Copy built artifacts in runtime stage

3. **Reference multi-stage patterns**:
   - Review `references/multistage_patterns.md` for language-specific examples
   - Use patterns as templates, customize for your application
   - Plan builder stage commands (compile, build, optimize)
   - Plan runtime stage with minimal overhead

4. **Select base images**:
   - Use `references/base_images_reference.md` to choose appropriate bases
   - Python: `python:3.11-alpine` (50MB) or `python:3.11-slim` (150MB)
   - Node.js: `node:18-alpine` (170MB) or `node:18-slim` (200MB)
   - Go: `golang:1.20-alpine` for builder (370MB) → `distroless/base-debian11` (20MB)
   - Java: `maven:3.8-openjdk-17` for builder (570MB) → `openjdk:17-jre-slim` (200MB)

### Step 3: Create the Dockerfile

**Objective**: Implement the multi-stage Dockerfile with optimizations and security best practices.

1. **Create builder stage** with all build tools and dependencies:
   ```dockerfile
   FROM <build-base-image> AS builder
   WORKDIR /app

   # Copy dependency files first (optimal caching)
   COPY package*.json ./

   # Install dependencies
   RUN npm ci --only=production

   # Copy source code
   COPY . .

   # Build application
   RUN npm run build
   ```

2. **Combine RUN commands** to minimize layers:
   ```dockerfile
   # Good - single layer
   RUN apt-get update && \
       apt-get install -y --no-install-recommends build-essential && \
       rm -rf /var/lib/apt/lists/*

   # Avoid - multiple layers
   RUN apt-get update
   RUN apt-get install -y build-essential
   RUN apt-get clean
   ```

3. **Create runtime stage** with minimal base image:
   ```dockerfile
   FROM <runtime-base-image>
   WORKDIR /app

   # Copy files from builder
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/public ./public

   # Copy dependency file and install production only
   COPY --from=builder /app/package*.json ./
   RUN npm ci --only=production
   ```

4. **Set working directory and entrypoint**:
   ```dockerfile
   WORKDIR /app
   EXPOSE 8000
   CMD ["npm", "start"]
   ```

5. **Copy all production code** from builder stage:
   - For Next.js: Copy `.next` and `public` directories
   - For Python: Copy installed dependencies from venv
   - For Go: Copy compiled binary
   - For Java: Copy JAR file

### Step 4: Create .dockerignore File

**Objective**: Exclude unnecessary files to minimize build context and improve build speed.

1. **Create .dockerignore file** in project root:
   ```bash
   touch .dockerignore
   ```

2. **Add exclusions** using provided templates:
   - Copy relevant template from `assets/dockerignore-templates/`
   - Use `.dockerignore.nodejs` for Node.js projects
   - Use `.dockerignore.python` for Python projects
   - Use `.dockerignore.go` for Go projects

3. **Customize exclusions** based on project:
   ```
   # Dependencies (recreated during build)
   node_modules/
   __pycache__/
   vendor/

   # Testing (not needed in runtime)
   tests/
   __tests__/
   .pytest_cache/
   coverage/

   # Development files
   .git/
   .env.local
   .vscode/
   .idea/

   # Build artifacts (rebuilt in builder stage)
   dist/
   build/
   .next/

   # Other
   .DS_Store
   *.swp
   ```

4. **Verify effectiveness**:
   - Build context should be <100MB (vs 500MB+ without .dockerignore)
   - Build should complete faster (seconds vs minutes)
   - Image size not affected, but build speed improved significantly

### Step 5: Optimize for Production

**Objective**: Reduce image size, improve caching, and prepare for deployment.

1. **Use specific base image versions** (never `latest`):
   ```dockerfile
   # Good - pinned version
   FROM python:3.11.5-alpine3.18

   # Avoid - will change unexpectedly
   FROM python:3.11
   FROM python:latest
   ```

2. **Clean package manager caches** after installation:
   ```dockerfile
   # Python
   RUN pip install --no-cache-dir requirements.txt

   # Node.js (already cached with ci)
   RUN npm ci --only=production

   # Alpine
   RUN apk add --no-cache ca-certificates && \
       rm -rf /var/lib/apk/lists/*

   # Debian
   RUN apt-get update && \
       apt-get install -y package && \
       apt-get clean && \
       rm -rf /var/lib/apt/lists/*
   ```

3. **Remove build dependencies** from final stage:
   - Don't copy build tools (gcc, maven, git) to runtime
   - Use multi-stage to exclude completely
   - Example: builder stage has 500MB, runtime only 100MB

4. **Copy files with correct ownership**:
   ```dockerfile
   COPY --chown=appuser:appuser --from=builder /app/dist ./dist
   ```

5. **Set environment variables** for optimization:
   ```dockerfile
   # Python: Unbuffered output for proper logging
   ENV PYTHONUNBUFFERED=1

   # Node.js: Disable telemetry
   ENV NEXT_TELEMETRY_DISABLED=1

   # Python: Don't write bytecode
   ENV PYTHONDONTWRITEBYTECODE=1
   ```

6. **Verify size targets**:
   - Python/FastAPI: Target <250MB
   - Node.js/Express: Target <300MB
   - Next.js: Target <350MB (with optimization)
   - Go: Target <80MB
   - Java: Target <500MB

### Step 6: Implement Security & Validation

**Objective**: Add security features and verify Dockerfile is production-ready.

1. **Create non-root user**:
   ```dockerfile
   # Alpine Linux
   RUN addgroup -g 1001 -S appuser && \
       adduser -S appuser -u 1001

   # Debian/Ubuntu
   RUN groupadd -g 1001 -S appuser && \
       useradd -u 1001 -S appuser -g appuser

   USER appuser
   ```

   Important: Use UID >1000 (system UIDs are 0-1000)

2. **Add health check**:
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
       CMD curl -f http://localhost:8000/health || exit 1
   ```

3. **Add labels for metadata**:
   ```dockerfile
   LABEL org.opencontainers.image.title="My App" \
         org.opencontainers.image.description="Microservice description" \
         org.opencontainers.image.version="1.0.0" \
         org.opencontainers.image.source="https://github.com/user/repo"
   ```

4. **Run optimization checks**:
   ```bash
   bash scripts/optimize_dockerfile.sh Dockerfile
   ```
   Should report: ✓ Multi-stage, ✓ Non-root user, ✓ No hardcoded values

5. **Run security scan**:
   ```bash
   bash scripts/scan_dockerfile.sh Dockerfile
   ```
   Should report: ✓ No critical issues, ✓ Non-root configured, ✓ Health check defined

6. **Build and test the image**:
   ```bash
   docker build -t myapp:1.0.0 .
   docker images myapp:1.0.0  # Check size
   docker run -u 1001:1001 myapp:1.0.0  # Test as non-root
   docker scan myapp:1.0.0  # Vulnerability scan
   ```

7. **Verify image meets targets**:
   - [ ] Final size <400MB (or language-specific target)
   - [ ] Runs as non-root user
   - [ ] Health check passes
   - [ ] Security scan passes
   - [ ] Builds in reasonable time
   - [ ] No hardcoded secrets
   - [ ] Uses specific base image versions

## Quality Checklist

Before deploying Docker images to production, verify:

- [ ] Multi-stage build used (separate builder and runtime)
- [ ] Final image size meets targets (<200-400MB)
- [ ] Runs as non-root user (UID >1000)
- [ ] All base images use specific versions (not `latest`)
- [ ] Health check endpoint defined and working
- [ ] No hardcoded secrets or passwords
- [ ] .dockerignore excludes unnecessary files
- [ ] RUN commands combined with && (minimal layers)
- [ ] Package manager caches cleaned
- [ ] File permissions set correctly with --chown
- [ ] Environment variables configured (PYTHONUNBUFFERED, etc.)
- [ ] WORKDIR defined (not root)
- [ ] EXPOSE port defined
- [ ] ENTRYPOINT or CMD defined
- [ ] Dockerfile passes optimization checks
- [ ] Dockerfile passes security scan
- [ ] Image built successfully locally
- [ ] Image tested with non-root user
- [ ] Image scanned for vulnerabilities
- [ ] Image works in intended runtime (Kubernetes, etc.)

## Common Patterns & Solutions

### Pattern 1: Next.js with Minimal Size

**Challenge**: Next.js images are large (1GB+)

**Solution**: Use standalone mode + multi-stage
```dockerfile
# In next.config.js
const nextConfig = {
  output: 'standalone',
}

# In Dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Result: 250-350MB instead of 1GB+
```

### Pattern 2: Python with Virtual Environment

**Challenge**: Global pip install bloats image

**Solution**: Use virtual environment in builder stage
```dockerfile
FROM python:3.11-alpine AS builder
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-alpine
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Result: 150-250MB
```

### Pattern 3: Go Minimal Image with Distroless

**Challenge**: Go binaries are large with full Linux

**Solution**: Use distroless base
```dockerfile
FROM golang:1.20-alpine AS builder
RUN go build -o app .

FROM distroless/base-debian11
COPY --from=builder /app /app
ENTRYPOINT ["/app"]

# Result: 30-80MB
```

### Pattern 4: Java Spring Boot

**Challenge**: Java ecosystem is large (JDK is 500MB)

**Solution**: Use JRE for runtime + multi-stage
```dockerfile
FROM maven:3.8-openjdk-17 AS builder
RUN mvn package

FROM openjdk:17-jre-slim
COPY --from=builder /target/app.jar app.jar
CMD ["java", "-jar", "app.jar"]

# Result: 300-500MB
```

## Troubleshooting

### Issue: Image Size Larger Than Expected

**Diagnosis**:
```bash
docker image ls myapp  # Check reported size
docker history myapp   # See size per layer
```

**Solutions**:
1. Remove build dependencies from runtime stage
2. Use multi-stage build if not already
3. Clean package manager caches
4. Use alpine or distroless base
5. Run `bash scripts/optimize_dockerfile.sh`

### Issue: Build Takes Too Long

**Diagnosis**: Check if .dockerignore is used

**Solutions**:
1. Create .dockerignore file
2. Exclude node_modules, .git, tests, build artifacts
3. Build context should be <100MB
4. Check build output for "Sending build context"

### Issue: Hardcoded Secrets in Image

**Diagnosis**:
```bash
bash scripts/scan_dockerfile.sh Dockerfile
```

**Solutions**:
1. Move secrets to environment variables
2. Use Docker secrets (docker run --secret)
3. Use build secrets (docker build --secret)
4. Never COPY files containing secrets

### Issue: Alpine Compatibility Problems

**Diagnosis**: Build fails with musl libc errors

**Solutions**:
1. Switch to slim base: `python:3.11-slim`
2. Install gcompat: `apk add gcompat`
3. Check if wheels available for Alpine
4. Use buildkit with caching for build tools

## Reference Materials

For detailed information, consult the bundled references:

- **Multi-Stage Patterns**: See `references/multistage_patterns.md` for tested patterns for Python, Node.js, Go, Java, Ruby
- **Best Practices**: See `references/docker_best_practices.md` for optimization, caching, size reduction
- **Security**: See `references/security_hardening.md` for user management, secrets, and hardening
- **Base Images**: See `references/base_images_reference.md` for selection guide and comparisons

## Summary

Successfully building production-ready Docker images requires:

1. **Analyzing** the application type, dependencies, and requirements
2. **Designing** multi-stage builds separating build tools from runtime
3. **Creating** Dockerfile with optimizations and security features
4. **Configuring** .dockerignore to minimize build context
5. **Optimizing** for size, performance, and caching efficiency
6. **Securing** with non-root user, health checks, and vulnerability scanning
7. **Validating** with scripts and manual testing before deployment

Follow this workflow to create images that are:
- **Small**: <400MB for most applications
- **Secure**: Non-root user, no hardcoded secrets
- **Fast**: Efficient caching, optimized layers
- **Portable**: Works in Kubernetes and cloud platforms
- **Maintainable**: Clear structure, well-documented
