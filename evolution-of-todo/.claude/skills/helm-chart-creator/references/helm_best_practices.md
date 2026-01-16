# Helm Chart Best Practices

## 1. Configuration Management

### Use values.yaml as the Single Source of Truth
All configurable settings must reside in `values.yaml`, never hardcode values in templates.

**Good Practice:**
```yaml
image:
  repository: myapp
  tag: "1.0.0"
replicas: 3
```

**Poor Practice:**
```yaml
# Hardcoded in template - impossible to reuse
image: myapp:latest
```

### Provide Safe Defaults
Every value should have a sensible default allowing chart installation without additional input.

### Group Related Configuration Hierarchically
```yaml
database:
  host: postgres
  port: 5432
  name: mydb

cache:
  enabled: true
  ttl: 3600
```

### Disable Optional Features by Default
```yaml
ingress:
  enabled: false
postgresql:
  enabled: false
monitoring:
  enabled: false
```

## 2. Template Best Practices

### Define Helper Templates in _helpers.tpl
Reusable functions prevent duplication and ensure consistency.

```yaml
{{- define "mychart.labels" -}}
app: {{ include "mychart.name" . }}
version: {{ .Chart.AppVersion }}
{{- end }}

# Use everywhere
metadata:
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
```

### Never Hardcode Values in Templates
All dynamic content must use template variables from values.yaml.

### Use Consistent Naming
Apply naming conventions consistently across all resources.

### Handle Indentation Correctly
Use `nindent` for multi-line values to maintain proper YAML indentation:
```yaml
# Wrong - broken indentation
metadata:
  labels:
    {{ .Values.customLabels | toYaml }}

# Correct
metadata:
  labels:
    {{- toYaml .Values.customLabels | nindent 4 }}
```

### Strip Whitespace to Avoid Blank Lines
Use `-` to control whitespace in templates:
```yaml
{{- if .Values.enabled }}
resource: true
{{- end }}
```

### Implement Conditional Logic for Optional Features
```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
...
{{- end }}
```

## 3. Documentation Requirements

### Include NOTES.txt for Post-Install Guidance
Provide clear instructions on how to access and verify the deployment.

### Document values.yaml Thoroughly
Every value must have a comment explaining its purpose:
```yaml
# Number of replicas (ignored if autoscaling enabled)
replicaCount: 1

# Docker image repository
image:
  repository: myapp
  tag: "1.0.0"
```

### Create Comprehensive README.md
Document installation, configuration, and all key options.

## 4. Validation and Testing

### Run helm lint Before Committing
Fix all errors and warnings:
```bash
helm lint ./mychart
```

### Test with Multiple Values Files
Test different scenarios (dev, staging, prod):
```bash
helm template myapp ./mychart -f values-prod.yaml
```

### Perform Dry-Run Installs
```bash
helm install myapp ./mychart --dry-run --debug
```

### Render Templates to Verify Output
```bash
helm template myapp ./mychart | less
```

## 5. Version Compatibility

### Specify Kubernetes Version Requirements
```yaml
kubeVersion: ">=1.19.0"
```

### Use API Version Detection
```yaml
{{- if .Capabilities.APIVersions.Has "batch/v1/CronJob" }}
apiVersion: batch/v1
{{- else }}
apiVersion: batch/v1beta1
{{- end }}
```

## 6. Security Best Practices

### Never Include Secrets in Default values
Secrets must be provided at install time, never in defaults.

### Implement RBAC and ServiceAccounts
```yaml
serviceAccount:
  create: true
rbac:
  create: true
```

### Define Security Context
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

## 7. Deployment Patterns

### Implement Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 30

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
```

### Define Resource Requests and Limits
```yaml
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Use Rolling Updates
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

## 8. Common Pitfalls to Avoid

| Problem | Solution |
|---------|----------|
| Hardcoded values | Use values.yaml for all configuration |
| Broken indentation | Use `nindent` and `indent` filters |
| Missing defaults | Provide safe defaults for all values |
| No validation | Run `helm lint` regularly |
| Poor templating | Use consistent helper templates |
| Lack of documentation | Comment values.yaml, provide NOTES.txt |
| Version incompatibility | Test with multiple Kubernetes versions |
| Secrets in defaults | Provide secrets at install time only |

## 9. Chart Publishing

### Follow Semantic Versioning
```yaml
version: 1.0.0
appVersion: "1.0.0"
```

- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes

### Package for Distribution
```bash
helm package ./mychart
```

## 10. Maintenance Checklist

- [ ] Run `helm lint` successfully
- [ ] Test with `helm template`
- [ ] Test with `helm install --dry-run`
- [ ] All values documented
- [ ] No hardcoded values in templates
- [ ] Helper templates defined in _helpers.tpl
- [ ] Security context configured
- [ ] Health checks implemented
- [ ] Resource limits defined
- [ ] README.md complete
- [ ] NOTES.txt provides user guidance
- [ ] Tested with multiple values files
