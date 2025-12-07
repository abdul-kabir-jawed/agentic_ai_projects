---
name: docker-image-builder
description: Creates optimized multi-stage Dockerfiles for applications with security best practices. Use when creating new services, optimizing existing Dockerfiles, preparing for Kubernetes deployment, or reducing image size. Targets image size <200-400MB with non-root user.
allowed-tools: Read, Write, Edit, Grep, Run Terminal
---

# Docker-Image-Builder

This Skill creates optimized, secure Docker images using multi-stage builds following best practices.

## When to Use

- Creating new service
- Optimizing existing Dockerfile
- Preparing for Kubernetes deployment
- Reducing image size for faster deployments
- When deployment target changes
- When optimizing image size

## Instructions

### Step 1: Analyze Application
1. Use **Read** to identify application type (Python/FastAPI, Node.js/Next.js, etc.)
2. Use **Grep** to list all dependencies
3. Identify build-time vs runtime dependencies
4. Identify static assets
5. Determine base image requirements

### Step 2: Design Multi-Stage Build
1. **Stage 1 (Builder):** Install dependencies, build application
2. **Stage 2 (Runtime):** Copy artifacts, minimal runtime dependencies
3. Identify what to copy between stages
4. Plan to minimize final image size

### Step 3: Create Dockerfile
1. Use **Write** to create Dockerfile
2. Choose appropriate base images (alpine for size, debian for compatibility)
3. Set up build stage with all build tools
4. Install dependencies
5. Build application
6. Set up runtime stage
7. Copy only necessary files
8. Configure entrypoint/command

### Step 4: Create .dockerignore
1. Use **Write** to create .dockerignore file
2. Exclude unnecessary files (node_modules, .git, tests, etc.)
3. Reduce build context size
4. Improve build speed

### Step 5: Optimize Image
1. Use specific version tags (not latest)
2. Combine RUN commands to reduce layers
3. Remove build dependencies in final stage
4. Use multi-stage build effectively
5. Minimize layers

### Step 6: Add Security Best Practices
1. Run as non-root user
2. Set proper file permissions
3. Use specific base image versions
4. Add health checks
5. Use **Run Terminal** to scan for vulnerabilities

## Quality Checks

1. **Image Size:** Meets target size requirements (<200-400MB)
2. **Security:** Runs as non-root, minimal attack surface
3. **Build Time:** Build completes in reasonable time
4. **Layers:** Minimal number of layers
5. **Caching:** Build layers are cacheable

## Example

**Input:**
- Application: Next.js frontend
- Dependencies: Node.js 18, npm packages
- Build: `npm run build`
- Runtime: Static files served by Node.js

**Output:**
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["npm", "start"]
```

**.dockerignore:**
```
node_modules
.next
.git
.env.local
.env*.local
npm-debug.log*
.DS_Store
coverage
```

## Common Pitfalls to Avoid

1. **Large Images:** Not using multi-stage builds
2. **Security Issues:** Running as root user
3. **Slow Builds:** Not using .dockerignore
4. **Cache Invalidation:** Copying files before installing dependencies
5. **Unnecessary Dependencies:** Including dev dependencies in final image
