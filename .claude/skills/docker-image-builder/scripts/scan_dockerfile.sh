#!/bin/bash
# scan_dockerfile.sh - Security scanning for Dockerfile best practices
#
# Usage: bash scan_dockerfile.sh <Dockerfile-path>
#
# Checks for security issues:
# - Root user execution
# - Missing health checks
# - Hardcoded secrets
# - Public network ports
# - Unvetted base images
# - Missing image labels
#

set -e

DOCKERFILE="${1:-Dockerfile}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_error() { echo -e "${RED}✗ CRITICAL: $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ WARNING: $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }

if [ ! -f "$DOCKERFILE" ]; then
    print_error "Dockerfile not found: $DOCKERFILE"
    exit 1
fi

CRITICAL=0
WARNINGS=0

echo "Security Scanning: $DOCKERFILE"
echo ""

# Check 1: Root user
if ! grep -q "^USER" "$DOCKERFILE"; then
    print_error "Container runs as root user (missing USER directive)"
    CRITICAL=$((CRITICAL + 1))
else
    USER_LINE=$(grep "^USER" "$DOCKERFILE" | tail -1)
    if echo "$USER_LINE" | grep -q "root\|0"; then
        print_error "Container explicitly runs as root user"
        CRITICAL=$((CRITICAL + 1))
    else
        print_success "Non-root user configured"
    fi
fi

# Check 2: Health check
if ! grep -q "HEALTHCHECK" "$DOCKERFILE"; then
    print_warning "No health check defined"
    WARNINGS=$((WARNINGS + 1))
else
    print_success "Health check configured"
fi

# Check 3: Hardcoded secrets
if grep -qE "PASSWORD|SECRET|TOKEN|KEY|AWS_|PRIVATE" "$DOCKERFILE"; then
    print_error "Possible hardcoded secrets detected in Dockerfile"
    grep -n "PASSWORD\|SECRET\|TOKEN\|KEY" "$DOCKERFILE" | head -3
    CRITICAL=$((CRITICAL + 1))
fi

# Check 4: ENV variables with sensitive names
if grep -qE "ENV.*PASSWORD|ENV.*SECRET|ENV.*TOKEN" "$DOCKERFILE"; then
    print_warning "Sensitive information in ENV variables (use secrets instead)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 5: Base image security
if grep -q "FROM.*:latest" "$DOCKERFILE"; then
    print_error "Using ':latest' tag - base image may change unexpectedly"
    CRITICAL=$((CRITICAL + 1))
fi

if grep -q "FROM ubuntu\|FROM centos\|FROM fedora" "$DOCKERFILE"; then
    print_warning "Large base image used - consider alpine or distroless"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 6: Sudo usage
if grep -q "^RUN.*sudo\|apt-get sudo\|yum sudo" "$DOCKERFILE"; then
    print_error "Sudo found in Dockerfile (not needed in containers)"
    CRITICAL=$((CRITICAL + 1))
fi

# Check 7: Package manager caching
if grep -q "apt-get install\|yum install\|apk add" "$DOCKERFILE"; then
    if ! grep -q "apt-get.*clean\|yum clean\|rm.*cache\|apk.*--no-cache" "$DOCKERFILE"; then
        print_warning "Package manager cache not cleaned (security + size issue)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check 8: EXPOSE for privileged ports
if grep -q "^EXPOSE" "$DOCKERFILE"; then
    EXPOSED=$(grep "^EXPOSE" "$DOCKERFILE" | awk '{print $2}')
    for PORT in $EXPOSED; do
        if [ "$PORT" -lt 1024 ]; then
            print_warning "Exposing privileged port $PORT (requires root, use port >1024)"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
fi

# Check 9: Labels for metadata
if ! grep -q "^LABEL" "$DOCKERFILE"; then
    print_warning "No LABEL directives for image metadata"
    WARNINGS=$((WARNINGS + 1))
else
    print_success "Image labels configured"
fi

# Check 10: Build-time secrets handling
if grep -q "RUN.*password\|RUN.*secret" "$DOCKERFILE"; then
    print_warning "Secrets appear in RUN commands (will be in image layers)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 11: File permissions
if grep -q "COPY.*--chown\|RUN.*chown" "$DOCKERFILE"; then
    print_success "File ownership configured"
else
    print_warning "Missing explicit file ownership configuration"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 12: Read-only filesystem
if grep -q "security_opt.*read_only\|read.only" "$DOCKERFILE"; then
    print_success "Read-only filesystem option configured"
fi

# Summary
echo ""
echo "===================================="
echo "SECURITY SCAN REPORT"
echo "===================================="
echo "Critical Issues: $CRITICAL"
echo "Warnings: $WARNINGS"
echo ""

if [ "$CRITICAL" -gt 0 ]; then
    print_error "CRITICAL SECURITY ISSUES FOUND"
    echo ""
    echo "Must fix before production deployment:"
    echo "  1. Add USER directive with non-root user (UID > 1000)"
    echo "  2. Remove hardcoded secrets (use build secrets or secrets at runtime)"
    echo "  3. Use specific base image versions (not :latest)"
    echo "  4. Remove sudo usage"
    echo ""
    exit 1
fi

if [ "$WARNINGS" -gt 0 ]; then
    print_warning "SECURITY WARNINGS PRESENT"
    echo ""
    echo "Recommended improvements:"
    echo "  1. Add HEALTHCHECK directive"
    echo "  2. Use minimal base images (alpine, debian:slim, distroless)"
    echo "  3. Clean package manager caches after install"
    echo "  4. Add LABEL directives for image metadata"
    echo "  5. Configure file ownership with --chown"
    echo "  6. Use non-root user (UID 1001+) by default"
    echo ""
fi

if [ "$CRITICAL" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    print_success "Dockerfile passes security scan!"
fi

print_info "For additional security:"
echo "  - Use build secrets for sensitive data (docker build --secret)"
echo "  - Scan final image: docker scan <image>"
echo "  - Use container scanning tools (Trivy, Grype, Clair)"
echo "  - Sign images with notation or cosign"
echo ""
