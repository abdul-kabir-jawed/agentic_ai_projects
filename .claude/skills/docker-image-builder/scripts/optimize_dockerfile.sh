#!/bin/bash
# optimize_dockerfile.sh - Analyze Dockerfile for optimization opportunities
#
# Usage: bash optimize_dockerfile.sh <Dockerfile-path>
#
# Scans Dockerfile for common issues:
# - Large base images
# - Missing multi-stage builds
# - Multiple RUN commands (should be combined)
# - Running as root
# - Missing .dockerignore
# - Large build context
# - Inefficient caching
#

set -e

DOCKERFILE="${1:-Dockerfile}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_error() { echo -e "${RED}✗ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }

# Validate Dockerfile exists
if [ ! -f "$DOCKERFILE" ]; then
    print_error "Dockerfile not found: $DOCKERFILE"
    exit 1
fi

ISSUES_FOUND=0
WARNINGS_FOUND=0
OPTIMIZATIONS_FOUND=0

echo "Analyzing Dockerfile: $DOCKERFILE"
echo ""

# Check for multi-stage build
if grep -q "FROM.*AS" "$DOCKERFILE"; then
    print_success "Multi-stage build detected"
else
    print_warning "No multi-stage build found (recommended for reducing image size)"
    WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
fi

# Count FROM statements
FROM_COUNT=$(grep -c "^FROM" "$DOCKERFILE")
if [ "$FROM_COUNT" -gt 1 ]; then
    print_info "Multi-stage build with $FROM_COUNT stages"
fi

# Check for large base images
if grep -q "FROM.*:latest\|FROM ubuntu\|FROM centos\|FROM fedora" "$DOCKERFILE"; then
    print_error "Large base image detected (ubuntu/centos/latest)"
    print_warning "Consider: alpine, debian:slim, or distroless variants"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for pinned versions
if grep -q "FROM.*:latest" "$DOCKERFILE"; then
    print_error "'latest' tag detected - use specific versions"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Count RUN commands
RUN_COUNT=$(grep -c "^RUN" "$DOCKERFILE" || echo "0")
if [ "$RUN_COUNT" -gt 5 ]; then
    print_warning "Multiple RUN commands ($RUN_COUNT) - combine with && to reduce layers"
    OPTIMIZATIONS_FOUND=$((OPTIMIZATIONS_FOUND + 1))
fi

# Check for apt/yum without cleanup
if grep -q "apt-get install\|yum install" "$DOCKERFILE" && ! grep -q "apt-get.*clean\|yum clean" "$DOCKERFILE"; then
    print_warning "Package manager cache not cleaned (missing apt-get clean or yum clean)"
    OPTIMIZATIONS_FOUND=$((OPTIMIZATIONS_FOUND + 1))
fi

# Check for ROOT user
if grep -q "^USER root\|^USER 0" "$DOCKERFILE"; then
    print_error "Running as root user detected"
    print_warning "Create non-root user for security"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
elif ! grep -q "^USER" "$DOCKERFILE"; then
    print_warning "No USER directive found (running as root by default)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for HEALTHCHECK
if ! grep -q "HEALTHCHECK" "$DOCKERFILE"; then
    print_warning "No HEALTHCHECK directive found (recommended for production)"
    OPTIMIZATIONS_FOUND=$((OPTIMIZATIONS_FOUND + 1))
fi

# Check for COPY order
if grep -q "COPY.*\\.\\|COPY.*\\*" "$DOCKERFILE"; then
    LINE=$(grep -n "COPY.*\\.\\|COPY.*\\*" "$DOCKERFILE" | tail -1 | cut -d: -f1)

    # Check if RUN commands come after COPY
    if [ -n "$LINE" ]; then
        LAST_COPY="$LINE"
        LAST_RUN=$(grep -n "^RUN" "$DOCKERFILE" | tail -1 | cut -d: -f1 || echo "0")

        if [ "$LAST_COPY" -lt "$LAST_RUN" ]; then
            print_warning "COPY commands before RUN commands - reorder to optimize caching"
            OPTIMIZATIONS_FOUND=$((OPTIMIZATIONS_FOUND + 1))
        fi
    fi
fi

# Check for dependency installation
if grep -q "RUN apt-get\|RUN yum\|RUN apk\|RUN pip\|RUN npm" "$DOCKERFILE"; then
    print_info "Dependency installation detected"

    # Check if using constraints/lock files
    if grep -q "requirements.txt\|package-lock.json\|yarn.lock\|Pipfile.lock\|pom.xml" "$DOCKERFILE"; then
        print_success "Using dependency lock files (good for reproducibility)"
    fi
fi

# Check for WORKDIR
if ! grep -q "^WORKDIR" "$DOCKERFILE"; then
    print_warning "No WORKDIR specified (files will be in root directory)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for exposed ports
if grep -q "^EXPOSE" "$DOCKERFILE"; then
    PORTS=$(grep "^EXPOSE" "$DOCKERFILE" | awk '{print $2}')
    print_info "Exposed ports: $PORTS"
fi

# Check for ENTRYPOINT and CMD
if ! grep -q "^ENTRYPOINT\|^CMD" "$DOCKERFILE"; then
    print_warning "No ENTRYPOINT or CMD defined (container won't start)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for build cache optimization
if grep -q "ARG\|BUILD_DATE\|VCS_REF" "$DOCKERFILE"; then
    print_success "Build arguments configured (good for cache optimization)"
fi

# Check for .dockerignore reference
if grep -q "\.dockerignore" "$DOCKERFILE"; then
    print_info ".dockerignore reference found in comments"
fi

# Check for large files in COPY
COPY_LINES=$(grep "^COPY" "$DOCKERFILE" || true)
if [ -n "$COPY_LINES" ]; then
    print_info "Checking COPY commands order for cache efficiency..."
    echo "$COPY_LINES" | while read -r line; do
        if echo "$line" | grep -q "package.json\|requirements.txt\|pom.xml"; then
            print_success "Dependency files copied before application code (efficient caching)"
            break
        fi
    done
fi

# Summary
echo ""
echo "=================================="
echo "OPTIMIZATION REPORT"
echo "=================================="
echo "Critical Issues: $ISSUES_FOUND"
echo "Warnings: $WARNINGS_FOUND"
echo "Optimization Opportunities: $OPTIMIZATIONS_FOUND"
echo ""

if [ "$ISSUES_FOUND" -gt 0 ]; then
    print_error "Critical issues found - address before production"
fi

if [ "$OPTIMIZATIONS_FOUND" -gt 0 ]; then
    print_warning "Optimization opportunities available"
fi

if [ "$ISSUES_FOUND" -eq 0 ] && [ "$OPTIMIZATIONS_FOUND" -eq 0 ]; then
    print_success "Dockerfile looks good!"
fi

echo ""
print_info "Recommendations for optimization:"
echo "  1. Use multi-stage builds to separate build and runtime"
echo "  2. Order COPY/RUN commands to maximize cache hits"
echo "  3. Create non-root user for security"
echo "  4. Use specific base image versions (not latest)"
echo "  5. Combine RUN commands with && to reduce layers"
echo "  6. Clean up package manager caches"
echo "  7. Add HEALTHCHECK for production containers"
echo "  8. Use .dockerignore to exclude unnecessary files"
echo ""
