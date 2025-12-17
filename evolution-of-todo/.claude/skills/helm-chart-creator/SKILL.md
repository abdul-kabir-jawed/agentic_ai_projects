---
name: helm-chart-creator
description: This skill creates reusable Helm charts for Kubernetes deployments with configurable values. Use this skill when an application needs Kubernetes deployment, requires multi-environment support, requires a reusable deployment package, or when updating Kubernetes deployment configuration. Validates charts with helm lint before completion.
---

# Helm Chart Creator Skill

This skill provides a comprehensive workflow for creating production-ready Helm charts that deploy applications to Kubernetes across multiple environments.

## When to Use This Skill

Apply this skill when:

- **Creating new Kubernetes deployments**: Building a Helm chart from existing Kubernetes manifests or from scratch
- **Setting up multi-environment deployments**: Configuring development, staging, and production environments
- **Packaging applications for distribution**: Creating reusable charts for organizational repositories or public distribution
- **Updating deployment configurations**: Modifying existing Helm charts to add features, fix issues, or change values structure
- **Implementing deployment infrastructure**: Building cloud-native deployment packages with proper templating and configuration management
- **Converting raw manifests to templates**: Transforming hardcoded YAML into flexible, parameterized Helm charts

## Skill Assets

This skill includes reusable scripts, reference documentation, and template examples.

### Scripts

Execute these Bash scripts to streamline Helm chart operations:

- `scripts/init_helm_chart.sh` - Initialize a new Helm chart with best-practices structure, templates, and values files
- `scripts/validate_chart.sh` - Validate chart structure, YAML syntax, and run `helm lint` with comprehensive checks
- `scripts/test_chart.sh` - Test charts with multiple values files and scenarios, verifying template rendering

### References

Consult these reference documents to understand Helm patterns and procedures:

- `references/helm_templating_guide.md` - Complete guide to Helm template syntax, functions, and control structures
- `references/chart_structure_reference.md` - Reference for Chart.yaml, values.yaml structure, and chart organization
- `references/helm_best_practices.md` - Proven patterns for security, configuration management, and deployment
- `references/examples.md` - Concrete examples of templated Kubernetes manifests and full chart configurations

### Assets

Template files for quick chart creation:

- `assets/templates/Chart.yaml.template` - Chart metadata template
- `assets/templates/values.yaml.template` - Default configuration template
- `assets/templates/deployment.yaml.template` - Deployment manifest template
- `assets/templates/service.yaml.template` - Service manifest template
- `assets/templates/ingress.yaml.template` - Ingress manifest template
- `assets/templates/configmap.yaml.template` - ConfigMap manifest template
- `assets/templates/secret.yaml.template` - Secret manifest template
- `assets/templates/_helpers.tpl.template` - Helper template functions

## Workflow: Creating a Helm Chart

Follow this structured process to create a complete, production-ready Helm chart.

### Step 1: Analyze Existing Kubernetes Manifests

**Objective**: Understand current resources and identify configuration requirements.

1. **Read all Kubernetes manifests** that will be included in the chart (deployments, services, configmaps, secrets, ingresses, etc.)
   - Use the Read tool to examine each manifest file
   - Document all hardcoded values that should become configurable

2. **Identify environment-specific values** by comparing manifests across environments
   - Compare development vs. production configurations
   - Note differences in replicas, resources, environment variables, hosts

3. **Define the chart structure** based on manifest analysis
   - Determine required templates (which resource types are needed)
   - Plan optional components (features that should be conditionally created)
   - Decide on values hierarchy (how to organize configuration)

4. **Document all configurable parameters** that users need to control
   - List parameters with current hardcoded values
   - Define sensible defaults for each parameter
   - Plan conditional logic for optional features

### Step 2: Initialize Chart Structure

**Objective**: Create a properly structured Helm chart directory with templates and configuration files.

1. **Execute the init script** to generate chart skeleton:
   ```bash
   bash scripts/init_helm_chart.sh <chart-name> <output-directory>
   ```
   This creates:
   - Chart.yaml with metadata
   - values.yaml with default configuration
   - templates/ directory with all required templates
   - .helmignore for clean packaging
   - Helper templates in _helpers.tpl

2. **Update Chart.yaml metadata**:
   - Set accurate chart name (lowercase, hyphens)
   - Provide clear description
   - Set initial version (0.1.0 for new charts)
   - Add maintainer information
   - Specify Kubernetes version requirements

3. **Review generated directory structure**:
   - Verify templates directory contains necessary files
   - Check .helmignore file for correct exclusion patterns
   - Ensure _helpers.tpl exists with standard functions

### Step 3: Convert Manifests to Templates

**Objective**: Transform hardcoded Kubernetes manifests into flexible Helm templates.

For each Kubernetes manifest file:

1. **Extract hardcoded values** and replace with template variables:
   - Image references: `{{ .Values.image.repository }}:{{ .Values.image.tag }}`
   - Replica counts: `{{ .Values.replicaCount }}`
   - Port numbers: `{{ .Values.service.targetPort }}`
   - Domain names: `{{ .Values.ingress.hosts[0].host }}`

2. **Implement conditional resource creation** for optional features:
   ```yaml
   {{- if .Values.ingress.enabled }}
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   ...
   {{- end }}
   ```

3. **Use helper templates for consistency**:
   - Reference helper templates for labels: `{{ include "mychart.labels" . | nindent 4 }}`
   - Use helper functions for naming: `{{ include "mychart.fullname" . }}`
   - Maintain consistent selector labels across resources

4. **Implement proper indentation** for nested structures:
   - Use `nindent` for multi-line YAML values
   - Use `indent` for single-line values
   - Strip whitespace with `-` to avoid blank lines

5. **Handle resource-specific templating**:
   - For Deployments: Make replicas conditional on autoscaling
   - For Ingress: Make entire resource conditional on enabled flag
   - For ConfigMaps/Secrets: Iterate over key-value pairs

### Step 4: Define Values Configuration

**Objective**: Create a comprehensive values.yaml that users will configure.

1. **Organize values hierarchically** by component:
   - Group related settings (image, service, ingress, resources)
   - Use nested structures for clarity
   - Keep top-level flat (2-3 levels maximum)

2. **Provide complete defaults**:
   - Every value in templates must exist in values.yaml
   - Defaults must allow chart installation without additional input
   - Sensible defaults for optional features (disabled by default)

3. **Document every value thoroughly**:
   ```yaml
   # Image configuration
   image:
     # Docker image repository
     repository: myapp
     # Image pull policy: IfNotPresent, Always, Never
     pullPolicy: IfNotPresent
   ```

4. **Support multi-environment configuration**:
   - Create separate values files: values-dev.yaml, values-prod.yaml
   - Keep base values.yaml for defaults only
   - Document how to override values for different environments

### Step 5: Implement Template Logic

**Objective**: Add conditional rendering, loops, and helper functions.

1. **Create reusable helpers in _helpers.tpl**:
   - Define naming functions (name, fullname)
   - Define label functions (labels, selectorLabels)
   - Define utility functions for ServiceAccount names

2. **Implement conditional rendering**:
   - Optional resources (enabled flag)
   - Conditional fields (e.g., replicas only if autoscaling disabled)
   - API version compatibility checks for different Kubernetes versions

3. **Add loops for repeated structures**:
   ```yaml
   env:
   {{- range $key, $value := .Values.env }}
   - name: {{ $key | upper }}
     value: {{ $value | quote }}
   {{- end }}
   ```

4. **Validate required values**:
   ```yaml
   {{- required "image.repository is required" .Values.image.repository }}
   ```

### Step 6: Test the Chart

**Objective**: Validate that the chart renders correctly and installs successfully.

1. **Run helm lint** to check structure and syntax:
   ```bash
   bash scripts/validate_chart.sh <chart-path>
   ```
   Fix all errors and warnings before proceeding.

2. **Test template rendering** with default values:
   ```bash
   helm template myapp ./mychart
   ```
   Review output to ensure:
   - All variables are properly substituted
   - Indentation is correct
   - No extra blank lines
   - Optional resources appear/disappear as expected

3. **Test with multiple values files** using the test script:
   ```bash
   bash scripts/test_chart.sh <chart-path> <values-directory>
   ```
   This tests:
   - Default values
   - Each environment-specific values file
   - Override scenarios (replicas, ingress, autoscaling, ConfigMap, Secrets)

4. **Perform dry-run installations**:
   ```bash
   helm install test-release ./mychart --dry-run --debug
   ```
   Verify that:
   - All resources are valid
   - No validation errors occur
   - Resources are created in correct order

5. **Validate rendered YAML** is valid Kubernetes:
   ```bash
   helm template myapp ./mychart | kubectl apply --dry-run=client -f -
   ```

## Quality Checklist

Before declaring a chart complete, verify:

- [ ] `helm lint` passes with zero errors
- [ ] `helm template` renders without errors
- [ ] All hardcoded values replaced with template variables
- [ ] Chart.yaml contains accurate metadata
- [ ] values.yaml fully documented with comments
- [ ] All values used in templates exist in values.yaml
- [ ] Helper templates defined in _helpers.tpl
- [ ] Optional features use conditional rendering
- [ ] Indentation is correct (use `nindent` and `indent`)
- [ ] Tests pass with multiple values files
- [ ] Dry-run install succeeds
- [ ] Security context configured (non-root, read-only filesystem)
- [ ] Resource limits and requests defined
- [ ] Health probes configured (liveness, readiness)
- [ ] NOTES.txt provides post-install guidance
- [ ] README.md documents chart purpose and usage
- [ ] No secrets stored in default values.yaml
- [ ] ServiceAccount and RBAC configured if needed
- [ ] Kubernetes version compatibility specified

## Common Patterns and Solutions

### Pattern 1: Multi-Environment Configuration

**Scenario**: Deploy to dev, staging, and production with different settings.

**Solution**: Create values files for each environment:
```bash
helm install myapp ./mychart -f values-prod.yaml
helm install myapp ./mychart -f values-dev.yaml
```

Reference: See `references/examples.md` for complete multi-environment example.

### Pattern 2: Optional Components

**Scenario**: Ingress should only be created if enabled in values.

**Solution**: Wrap entire resource in conditional:
```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
...
{{- end }}
```

### Pattern 3: Environment Variables from Values

**Scenario**: Populate pod environment variables from values.

**Solution**: Use range loop in Deployment:
```yaml
env:
{{- range $key, $value := .Values.env }}
- name: {{ $key | upper }}
  value: {{ $value | quote }}
{{- end }}
```

### Pattern 4: Resource Naming Consistency

**Scenario**: Ensure all resources use the same naming pattern.

**Solution**: Use helper template defined once in _helpers.tpl:
```yaml
metadata:
  name: {{ include "mychart.fullname" . }}
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
```

## Troubleshooting

### Issue: `helm lint` fails with indentation errors

**Cause**: YAML indentation is broken in templates
**Solution**: Verify use of `nindent` for multi-line values, review indentation in templates

### Issue: Template rendering produces blank lines

**Cause**: Whitespace not controlled in template
**Solution**: Use `-` to strip whitespace: `{{- if condition }}`

### Issue: Values in template are empty

**Cause**: Value doesn't exist in values.yaml or typo in reference
**Solution**: Check values.yaml has the value, verify spelling in template

### Issue: Chart installs but resources aren't created

**Cause**: Resource is wrapped in conditional that evaluates to false
**Solution**: Check values.yaml for enabled/disabled flags, review conditional logic

## Next Steps After Chart Creation

1. **Store chart in version control** with clear git history
2. **Package chart** for distribution: `helm package ./mychart`
3. **Publish to chart repository** (Artifact Hub, private registry)
4. **Create release notes** documenting chart changes
5. **Add to CI/CD pipeline** for automated testing and publishing
6. **Document deployment procedures** for operations team

## Reference Materials

For detailed information, consult the bundled references:

- **Templating Syntax**: See `references/helm_templating_guide.md` for all functions, control structures, and patterns
- **Chart Organization**: See `references/chart_structure_reference.md` for structure details and conventions
- **Best Practices**: See `references/helm_best_practices.md` for security, configuration, and deployment patterns
- **Code Examples**: See `references/examples.md` for complete, copy-paste-ready template examples

## Summary

Successfully creating a Helm chart requires:

1. **Analyzing** existing manifests and identifying configurable parameters
2. **Initializing** proper chart structure with templates and values
3. **Converting** hardcoded YAML to flexible Helm templates
4. **Configuring** comprehensive values.yaml with good defaults
5. **Implementing** template logic, conditionals, and helper functions
6. **Testing** thoroughly with multiple values files and scenarios
7. **Validating** with helm lint, helm template, and dry-run installs
8. **Documenting** all values and providing post-install guidance

Follow this workflow to create reusable, maintainable charts that deploy applications consistently across development, staging, and production Kubernetes environments.
