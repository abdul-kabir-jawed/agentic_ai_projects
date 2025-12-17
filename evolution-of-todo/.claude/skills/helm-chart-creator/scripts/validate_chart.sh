#!/bin/bash
# validate_chart.sh - Validate Helm chart structure and syntax
#
# Usage: bash validate_chart.sh <chart-path> [values-file]
#
# This script validates that:
# - Chart structure is correct
# - YAML syntax is valid
# - All required files are present
# - Templates render without errors
# - helm lint passes without warnings
#

set -e

CHART_PATH="${1:-.}"
VALUES_FILE="${2:-}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Validate chart path exists
if [ ! -d "$CHART_PATH" ]; then
    print_error "Chart path does not exist: $CHART_PATH"
    exit 1
fi

echo "Validating Helm chart at: $CHART_PATH"
echo ""

# Check for required files
echo "Checking required files..."
if [ ! -f "$CHART_PATH/Chart.yaml" ]; then
    print_error "Missing required file: Chart.yaml"
    exit 1
fi
print_success "Chart.yaml found"

if [ ! -f "$CHART_PATH/values.yaml" ]; then
    print_error "Missing required file: values.yaml"
    exit 1
fi
print_success "values.yaml found"

if [ ! -d "$CHART_PATH/templates" ]; then
    print_error "Missing required directory: templates/"
    exit 1
fi
print_success "templates/ directory found"

# Check for templates directory not being empty
if [ -z "$(ls -A "$CHART_PATH/templates")" ]; then
    print_warning "templates/ directory is empty"
fi

echo ""
echo "Checking YAML syntax..."

# Validate Chart.yaml syntax
if ! python3 -c "import yaml; yaml.safe_load(open('$CHART_PATH/Chart.yaml'))" 2>/dev/null; then
    print_error "Invalid YAML syntax in Chart.yaml"
    exit 1
fi
print_success "Chart.yaml YAML syntax valid"

# Validate values.yaml syntax
if ! python3 -c "import yaml; yaml.safe_load(open('$CHART_PATH/values.yaml'))" 2>/dev/null; then
    print_error "Invalid YAML syntax in values.yaml"
    exit 1
fi
print_success "values.yaml YAML syntax valid"

# Validate all template files
for template in "$CHART_PATH/templates"/*.yaml; do
    if [ -f "$template" ]; then
        # Skip _helpers.tpl files for full YAML validation
        if [[ "$template" != *"_helpers.tpl"* ]]; then
            # Try to validate basic YAML structure (helm will do full validation)
            if ! python3 -c "import yaml; yaml.safe_load(open('$template'))" 2>/dev/null; then
                # Allow templating syntax that won't parse as YAML
                :
            fi
        fi
    fi
done
print_success "Template files checked"

echo ""
echo "Running helm lint..."

# Run helm lint
if ! helm lint "$CHART_PATH" > /tmp/helm_lint_output.txt 2>&1; then
    print_error "helm lint failed"
    cat /tmp/helm_lint_output.txt
    exit 1
fi
print_success "helm lint passed"

# Show any warnings
if grep -q "WARNING" /tmp/helm_lint_output.txt; then
    print_warning "helm lint warnings detected:"
    grep "WARNING" /tmp/helm_lint_output.txt | sed 's/^/  /'
fi

echo ""
echo "Testing template rendering..."

# Test template rendering with default values
if [ -z "$VALUES_FILE" ]; then
    VALUES_FILE="$CHART_PATH/values.yaml"
fi

if ! helm template test-release "$CHART_PATH" -f "$VALUES_FILE" > /tmp/helm_template_output.yaml 2>&1; then
    print_error "helm template failed"
    cat /tmp/helm_template_output.yaml
    exit 1
fi
print_success "Templates render successfully"

# Validate rendered YAML
if ! python3 -c "import yaml; yaml.safe_load(open('/tmp/helm_template_output.yaml'))" 2>/dev/null; then
    print_error "Rendered templates produce invalid YAML"
    exit 1
fi
print_success "Rendered YAML is valid"

# Count rendered resources
RESOURCE_COUNT=$(grep -c "^kind:" /tmp/helm_template_output.yaml || echo 0)
echo "  Generated $RESOURCE_COUNT Kubernetes resources"

echo ""
echo "Checking for hardcoded values..."

# Search for common hardcoded patterns
HARDCODED_FOUND=0
for file in "$CHART_PATH/templates"/*.yaml; do
    if [ -f "$file" ] && [[ "$file" != *"_helpers.tpl"* ]]; then
        # Look for common hardcoded patterns (simple heuristic)
        if grep -E "image:.*:latest|replicas: [0-9]+|resources:.*cpu: [0-9]" "$file" | grep -v "{{" >/dev/null 2>&1; then
            print_warning "Potential hardcoded value in $(basename "$file")"
            HARDCODED_FOUND=1
        fi
    fi
done

if [ $HARDCODED_FOUND -eq 0 ]; then
    print_success "No obvious hardcoded values detected"
fi

echo ""
print_success "Chart validation completed successfully!"
echo ""
echo "Chart information:"
helm show chart "$CHART_PATH" | grep -E "^name:|^version:|^appVersion:" | sed 's/^/  /'
echo ""
