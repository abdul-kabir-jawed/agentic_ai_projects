#!/bin/bash
# analyze_app.sh - Analyze application and suggest Docker configuration
#
# Usage: bash analyze_app.sh <project-directory>
#
# Analyzes project structure, detects application type, enumerates dependencies,
# and suggests appropriate base images and optimization strategies.
#

set -e

PROJECT_DIR="${1:-.}"
ANALYSIS_OUTPUT="/tmp/docker_analysis_$RANDOM.txt"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_error() { echo -e "${RED}✗ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_header() { echo -e "\n${BLUE}=== $1 ===${NC}\n"; }

# Validate project directory
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

print_header "Application Analysis"
echo "Project: $PROJECT_DIR"
echo ""

# Initialize variables
APP_TYPE=""
BASE_IMAGE=""
NODE_VERSION=""
PYTHON_VERSION=""
GO_VERSION=""
JAVA_VERSION=""
RUBY_VERSION=""

# Detect Node.js application
if [ -f "$PROJECT_DIR/package.json" ]; then
    print_success "Node.js application detected"
    APP_TYPE="nodejs"

    # Detect Node.js version
    if grep -q '"engines"' "$PROJECT_DIR/package.json"; then
        NODE_VERSION=$(grep '"node"' "$PROJECT_DIR/package.json" | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
        print_info "Specified Node.js version: $NODE_VERSION"
    else
        NODE_VERSION="18-alpine"
        print_warning "No specific Node.js version specified, recommending: $NODE_VERSION"
    fi

    # Detect app type (Next.js, Express, etc.)
    if grep -q '"next"' "$PROJECT_DIR/package.json"; then
        print_info "Next.js application detected"
        APP_TYPE="nextjs"
    elif grep -q '"express"' "$PROJECT_DIR/package.json"; then
        print_info "Express.js application detected"
        APP_TYPE="expressjs"
    fi

    # Count dependencies
    DEP_COUNT=$(grep -c '"' "$PROJECT_DIR/package.json" 2>/dev/null || echo "0")
    print_info "Dependencies: ~$(( DEP_COUNT / 2 )) packages"

    BASE_IMAGE="node:${NODE_VERSION}"
fi

# Detect Python application
if [ -f "$PROJECT_DIR/pyproject.toml" ] || [ -f "$PROJECT_DIR/requirements.txt" ] || [ -f "$PROJECT_DIR/setup.py" ]; then
    print_success "Python application detected"
    APP_TYPE="python"

    # Detect Python version from pyproject.toml
    if [ -f "$PROJECT_DIR/pyproject.toml" ]; then
        PYTHON_VERSION=$(grep -E 'python|version' "$PROJECT_DIR/pyproject.toml" | head -1 | sed 's/.*"\([^"]*\)".*/\1/' || echo "3.11")
    fi

    # Check for FastAPI
    if [ -f "$PROJECT_DIR/requirements.txt" ] && grep -q "fastapi" "$PROJECT_DIR/requirements.txt"; then
        print_info "FastAPI application detected"
        APP_TYPE="fastapi"
    elif [ -f "$PROJECT_DIR/pyproject.toml" ] && grep -q "fastapi" "$PROJECT_DIR/pyproject.toml"; then
        print_info "FastAPI application detected"
        APP_TYPE="fastapi"
    fi

    # Check for Django
    if [ -f "$PROJECT_DIR/requirements.txt" ] && grep -q "django" "$PROJECT_DIR/requirements.txt"; then
        print_info "Django application detected"
        APP_TYPE="django"
    fi

    BASE_IMAGE="python:${PYTHON_VERSION:-3.11}-slim"
fi

# Detect Go application
if [ -f "$PROJECT_DIR/go.mod" ] || [ -f "$PROJECT_DIR/go.sum" ]; then
    print_success "Go application detected"
    APP_TYPE="go"

    # Detect Go version
    if [ -f "$PROJECT_DIR/go.mod" ]; then
        GO_VERSION=$(grep '^go ' "$PROJECT_DIR/go.mod" | awk '{print $2}' || echo "1.20")
        print_info "Go version: $GO_VERSION"
    fi

    BASE_IMAGE="golang:${GO_VERSION:-1.20}-alpine"
fi

# Detect Java application
if [ -f "$PROJECT_DIR/pom.xml" ] || [ -f "$PROJECT_DIR/build.gradle" ] || [ -f "$PROJECT_DIR/build.gradle.kts" ]; then
    print_success "Java application detected"
    APP_TYPE="java"
    BASE_IMAGE="maven:3.8-openjdk-17"
fi

# Detect Ruby application
if [ -f "$PROJECT_DIR/Gemfile" ] || [ -f "$PROJECT_DIR/Gemfile.lock" ]; then
    print_success "Ruby application detected"
    APP_TYPE="ruby"

    # Detect Ruby version
    if [ -f "$PROJECT_DIR/.ruby-version" ]; then
        RUBY_VERSION=$(cat "$PROJECT_DIR/.ruby-version")
        print_info "Ruby version: $RUBY_VERSION"
    else
        RUBY_VERSION="3.2"
        print_warning "No specific Ruby version specified, recommending: $RUBY_VERSION"
    fi

    BASE_IMAGE="ruby:${RUBY_VERSION}-slim"
fi

# If no app type detected
if [ -z "$APP_TYPE" ]; then
    print_warning "Could not automatically detect application type"
    print_info "Common project files not found"
    APP_TYPE="generic"
    BASE_IMAGE="debian:bookworm-slim"
fi

# Analyze directory structure
print_header "Project Structure"
if [ -d "$PROJECT_DIR/src" ]; then
    print_info "Source code in: src/"
fi

if [ -d "$PROJECT_DIR/tests" ] || [ -d "$PROJECT_DIR/test" ] || [ -d "$PROJECT_DIR/__tests__" ]; then
    print_info "Test directory found (exclude from build context)"
fi

if [ -d "$PROJECT_DIR/.git" ]; then
    print_info ".git directory found (add to .dockerignore)"
fi

if [ -f "$PROJECT_DIR/.env" ] || [ -f "$PROJECT_DIR/.env.local" ]; then
    print_warning "Environment files found (add to .dockerignore)"
fi

# Check for build output directories
if [ -d "$PROJECT_DIR/build" ] || [ -d "$PROJECT_DIR/dist" ] || [ -d "$PROJECT_DIR/out" ]; then
    print_info "Build output directory found (exclude from build context)"
fi

# Analyze dependencies
print_header "Dependency Analysis"

if [ "$APP_TYPE" = "nodejs" ] || [ "$APP_TYPE" = "nextjs" ] || [ "$APP_TYPE" = "expressjs" ]; then
    if [ -f "$PROJECT_DIR/package-lock.json" ]; then
        print_success "package-lock.json found (use npm ci)"
    elif [ -f "$PROJECT_DIR/yarn.lock" ]; then
        print_success "yarn.lock found (use yarn install)"
    fi

    if [ -f "$PROJECT_DIR/package.json" ]; then
        DEV_DEPS=$(grep -c '"devDependencies"' "$PROJECT_DIR/package.json" || echo "0")
        [ "$DEV_DEPS" -gt 0 ] && print_info "Development dependencies detected (separate into build stage)"
    fi
fi

if [ "$APP_TYPE" = "python" ] || [ "$APP_TYPE" = "fastapi" ] || [ "$APP_TYPE" = "django" ]; then
    if [ -f "$PROJECT_DIR/requirements.txt" ]; then
        DEP_COUNT=$(wc -l < "$PROJECT_DIR/requirements.txt" || echo "0")
        print_info "Dependencies: $DEP_COUNT packages (in requirements.txt)"
    fi

    if [ -f "$PROJECT_DIR/requirements-dev.txt" ]; then
        print_info "Development requirements found (separate into build stage)"
    fi
fi

# Size estimation
print_header "Size Estimation"
print_info "Analyzing project size..."

APP_SIZE=$(du -sh "$PROJECT_DIR" 2>/dev/null | awk '{print $1}')
print_info "Project size: $APP_SIZE"

case "$APP_TYPE" in
    nextjs)
        print_info "Estimated final image: 200-400MB (with optimizations)"
        ;;
    expressjs|fastapi)
        print_info "Estimated final image: 100-250MB (with optimizations)"
        ;;
    go)
        print_info "Estimated final image: 20-100MB (distroless recommended)"
        ;;
    java)
        print_info "Estimated final image: 300-600MB (multi-stage critical)"
        ;;
    python)
        print_info "Estimated final image: 150-300MB (slim base recommended)"
        ;;
    *)
        print_info "Estimated final image: 100-500MB (depends on dependencies)"
        ;;
esac

# Generate recommendations
print_header "Recommendations"

echo "Application Type: $APP_TYPE"
echo "Recommended Base Image: $BASE_IMAGE"
echo ""

print_success "Multi-stage build strategy:"
echo "  - Stage 1 (Builder): Install build tools and dependencies"
echo "  - Stage 2 (Runtime): Minimal runtime with only necessary files"
echo ""

print_success "Optimization strategies:"
echo "  - Use .dockerignore to exclude unnecessary files"
echo "  - Combine RUN commands to reduce layers"
echo "  - Copy files in optimal order for caching"
echo "  - Remove build dependencies from final stage"
echo ""

print_success "Security recommendations:"
echo "  - Create non-root user (recommended UID: 1001)"
echo "  - Use specific base image versions (avoid 'latest')"
echo "  - Set file permissions correctly"
echo "  - Add health check endpoint"
echo ""

if [ "$APP_TYPE" = "nextjs" ]; then
    print_info "Next.js-specific:"
    echo "  - Copy .next directory from builder stage"
    echo "  - Copy public directory for static assets"
    echo "  - Use npm ci with --only=production"
    echo "  - Consider standalone mode for smaller images"
fi

if [ "$APP_TYPE" = "python" ]; then
    print_info "Python-specific:"
    echo "  - Use --no-cache-dir in pip install"
    echo "  - Set PYTHONUNBUFFERED=1 for proper logging"
    echo "  - Use pip-compile or constraints file for reproducibility"
fi

if [ "$APP_TYPE" = "go" ]; then
    print_info "Go-specific:"
    echo "  - Use distroless base image for minimal size"
    echo "  - Binary will be statically linked and minimal"
    echo "  - Consider using scratch image (no OS)"
fi

print_header "Next Steps"
echo "1. Review generated Dockerfile using: docker-image-builder generate-dockerfile <type>"
echo "2. Create .dockerignore using provided templates"
echo "3. Build and test: docker build -t myapp:latest ."
echo "4. Scan for vulnerabilities: docker scan myapp:latest"
echo "5. Check size: docker image ls myapp:latest"
echo ""

print_success "Analysis complete!"
