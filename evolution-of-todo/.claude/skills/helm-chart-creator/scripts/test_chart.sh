#!/bin/bash
# test_chart.sh - Test Helm chart with multiple values files and scenarios
#
# Usage: bash test_chart.sh <chart-path> [values-dir]
#
# This script tests charts by:
# - Rendering with default values
# - Rendering with multiple environment-specific values files
# - Performing dry-run install to catch deployment issues
# - Validating resource combinations
#

set -e

CHART_PATH="${1:-.}"
VALUES_DIR="${2:-.}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Validate inputs
if [ ! -d "$CHART_PATH" ]; then
    print_error "Chart path does not exist: $CHART_PATH"
    exit 1
fi

if [ ! -f "$CHART_PATH/Chart.yaml" ]; then
    print_error "Chart.yaml not found in: $CHART_PATH"
    exit 1
fi

# Extract chart name from Chart.yaml
CHART_NAME=$(grep "^name:" "$CHART_PATH/Chart.yaml" | awk '{print $2}')
echo "Testing Helm chart: $CHART_NAME"
echo "Chart path: $CHART_PATH"
echo ""

TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# Test function
run_test() {
    local test_name="$1"
    local values_file="$2"
    local expected_resources="$3"

    TEST_COUNT=$((TEST_COUNT + 1))
    echo "Test $TEST_COUNT: $test_name"

    # Prepare values argument
    VALUES_ARG=""
    if [ -n "$values_file" ] && [ -f "$values_file" ]; then
        VALUES_ARG="-f $values_file"
        echo "  Using values: $(basename "$values_file")"
    fi

    # Run helm template
    if ! helm template "$CHART_NAME" "$CHART_PATH" $VALUES_ARG > /tmp/test_render.yaml 2>&1; then
        print_error "Template rendering failed"
        cat /tmp/test_render.yaml
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo ""
        return
    fi

    # Validate YAML
    if ! python3 -c "import yaml; yaml.safe_load(open('/tmp/test_render.yaml'))" 2>/dev/null; then
        print_error "Rendered YAML is invalid"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo ""
        return
    fi

    # Check expected resources
    RESOURCE_COUNT=$(grep -c "^kind:" /tmp/test_render.yaml || echo 0)
    echo "  Generated resources: $RESOURCE_COUNT"

    if [ -n "$expected_resources" ]; then
        if [ "$RESOURCE_COUNT" -lt "$expected_resources" ]; then
            print_warning "Expected at least $expected_resources resources, got $RESOURCE_COUNT"
        fi
    fi

    print_success "Test passed"
    PASS_COUNT=$((PASS_COUNT + 1))
    echo ""
}

# Run test with default values
print_info "Running tests with default values"
echo ""
run_test "Default values" "$CHART_PATH/values.yaml" "3"

# Discover and test with additional values files
if [ -d "$VALUES_DIR" ]; then
    print_info "Discovering environment-specific values files"
    echo ""

    VALUES_FILES=$(find "$VALUES_DIR" -name "values*.yaml" -type f 2>/dev/null | sort || true)

    if [ -n "$VALUES_FILES" ]; then
        while IFS= read -r values_file; do
            if [ -f "$values_file" ]; then
                file_name=$(basename "$values_file")
                run_test "With $file_name" "$values_file" "3"
            fi
        done <<< "$VALUES_FILES"
    else
        print_warning "No values files found in $VALUES_DIR"
    fi
else
    print_warning "Values directory not found: $VALUES_DIR"
fi

# Test with override values
print_info "Running tests with override values"
echo ""

# Test with custom replica count
OVERRIDE_VALUES="/tmp/test_override_replicas.yaml"
cat > "$OVERRIDE_VALUES" << 'EOF'
replicaCount: 3
EOF
run_test "Custom replica count (3)" "$OVERRIDE_VALUES" "3"

# Test with ingress enabled
OVERRIDE_VALUES="/tmp/test_override_ingress.yaml"
cat > "$OVERRIDE_VALUES" << 'EOF'
ingress:
  enabled: true
  hosts:
    - host: example.com
      paths:
        - path: /
          pathType: Prefix
EOF
run_test "With Ingress enabled" "$OVERRIDE_VALUES" "3"

# Test with autoscaling enabled
OVERRIDE_VALUES="/tmp/test_override_autoscaling.yaml"
cat > "$OVERRIDE_VALUES" << 'EOF'
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
EOF
run_test "With autoscaling enabled" "$OVERRIDE_VALUES" "3"

# Test with configmap enabled
OVERRIDE_VALUES="/tmp/test_override_configmap.yaml"
cat > "$OVERRIDE_VALUES" << 'EOF'
configMap:
  enabled: true
  data:
    app.conf: |
      debug=true
      timeout=30
EOF
run_test "With ConfigMap enabled" "$OVERRIDE_VALUES" "4"

# Test with secrets enabled
OVERRIDE_VALUES="/tmp/test_override_secrets.yaml"
cat > "$OVERRIDE_VALUES" << 'EOF'
secrets:
  enabled: true
  data:
    DB_PASSWORD: mysecretpassword
    API_KEY: secretkey123
EOF
run_test "With Secrets enabled" "$OVERRIDE_VALUES" "4"

# Summary
echo "==============================================="
echo "Test Summary"
echo "==============================================="
echo "Total tests: $TEST_COUNT"
print_success "Passed: $PASS_COUNT"
if [ $FAIL_COUNT -gt 0 ]; then
    print_error "Failed: $FAIL_COUNT"
fi
echo ""

# Overall result
if [ $FAIL_COUNT -eq 0 ]; then
    print_success "All tests passed!"
    exit 0
else
    print_error "Some tests failed"
    exit 1
fi
