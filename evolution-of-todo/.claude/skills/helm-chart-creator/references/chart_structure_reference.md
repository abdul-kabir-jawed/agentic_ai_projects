# Helm Chart Structure Reference

This reference document describes the structure, metadata, and organization of Helm charts.

## Chart Directory Structure

```
my-chart/
├── Chart.yaml                  # Chart metadata
├── values.yaml                 # Default configuration values
├── charts/                      # Dependency charts
│   ├── subchart1/
│   └── subchart2/
├── templates/                   # Kubernetes manifest templates
│   ├── NOTES.txt               # Post-install notes
│   ├── _helpers.tpl            # Template helpers
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── serviceaccount.yaml
├── crds/                        # Custom Resource Definitions
│   └── my-resource.yaml
├── .helmignore                  # Files to ignore when packaging
└── README.md                    # Chart documentation
```

## Chart.yaml

The chart manifest describing the chart itself.

### Required Fields

```yaml
apiVersion: v2                           # Chart API version (v2 for Helm 3)
name: mychart                            # Chart name (lowercase, alphanumeric, hyphens)
version: 0.1.0                           # Chart version (semantic versioning)
```

### Common Optional Fields

```yaml
apiVersion: v2
name: mychart
description: A Helm chart for Kubernetes applications
type: application                        # application or library
version: 0.1.0
appVersion: "1.0.0"                     # Version of packaged application
kubeVersion: ">=1.19.0"                 # Kubernetes version requirement
keywords:                               # Search keywords
  - kubernetes
  - deployment
home: https://github.com/user/mychart   # Project home page
sources:                                # Project source repositories
  - https://github.com/user/mychart
maintainers:                            # Chart maintainers
  - name: John Doe
    email: john@example.com
    url: https://github.com/johndoe
icon: https://example.com/icon.png      # Icon URL
engine: gotpl                           # Template engine (gotpl is default)
dependencies:                           # Chart dependencies
  - name: postgresql
    version: "12.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    alias: postgres
annotations:                            # Custom annotations
  key: value
```

### Metadata Best Practices

- **name**: Use lowercase, hyphens instead of spaces
- **version**: Follow semantic versioning (MAJOR.MINOR.PATCH)
- **appVersion**: Version of the application being deployed
- **description**: Clear, concise description (one sentence)
- **maintainers**: Include name and email for support
- **keywords**: Up to 5 relevant keywords for discoverability

## values.yaml

The default configuration values for the chart.

### Structure and Organization

```yaml
# Group related values together
# Use nested structure for clarity
# Provide defaults that work out-of-the-box

# Global values (used across multiple components)
global:
  environment: production
  domain: example.com

# Application-specific configuration
app:
  name: myapp
  replicaCount: 1

# Image configuration
image:
  repository: myapp
  pullPolicy: IfNotPresent
  tag: "1.0.0"

# Service configuration
service:
  type: ClusterIP
  port: 80
  targetPort: 8080

# Ingress configuration
ingress:
  enabled: false
  className: nginx
  hosts:
    - host: example.com
      paths:
        - path: /
          pathType: Prefix

# Resource limits
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

### Values.yaml Conventions

#### Option 1: Flat Structure
Use for simple charts:

```yaml
replicaCount: 1
imageName: myapp
imageTag: "1.0.0"
port: 8080
```

#### Option 2: Nested Structure (Recommended)
Use for complex charts with multiple components:

```yaml
image:
  repository: myapp
  tag: "1.0.0"

service:
  port: 80
  targetPort: 8080

resources:
  limits:
    cpu: 500m
```

#### Option 3: Component-Based Structure
For multi-component systems:

```yaml
backend:
  image: backend:1.0
  replicas: 2
  resources:
    memory: 512Mi

frontend:
  image: frontend:1.0
  replicas: 3
  resources:
    memory: 256Mi
```

## Template Organization

### _helpers.tpl

Reusable template functions:

```yaml
# Naming templates
{{- define "mychart.name" -}}
{{- default .Chart.Name .Values.nameOverride }}
{{- end }}

# Full name combining release and chart
{{- define "mychart.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "mychart.name" .) }}
{{- end }}

# Labels for resource selection
{{- define "mychart.labels" -}}
helm.sh/chart: {{ include "mychart.chart" . }}
app.kubernetes.io/name: {{ include "mychart.name" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

# Selector labels
{{- define "mychart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mychart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

### Template File Naming

- `deployment.yaml` - Deployment resource
- `service.yaml` - Service resource
- `ingress.yaml` - Ingress resource
- `configmap.yaml` - ConfigMap resource
- `secret.yaml` - Secret resource
- `hpa.yaml` - HorizontalPodAutoscaler
- `serviceaccount.yaml` - ServiceAccount
- `role.yaml` - RBAC Role
- `rolebinding.yaml` - RBAC RoleBinding
- `_helpers.tpl` - Helper templates
- `NOTES.txt` - Post-install notes

### Conditional Resource Creation

```yaml
# deployment.yaml
{{- if .Values.deployment.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mychart.fullname" . }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.deployment.replicaCount }}
  {{- end }}
  ...
{{- end }}
```

## Multi-Environment Support

### Using Multiple Values Files

**values.yaml** (defaults):
```yaml
replicaCount: 1
resources:
  requests:
    memory: 256Mi
```

**values-dev.yaml**:
```yaml
replicaCount: 1
environment: development
resources:
  requests:
    memory: 128Mi
```

**values-prod.yaml**:
```yaml
replicaCount: 3
environment: production
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
resources:
  requests:
    memory: 512Mi
  limits:
    memory: 1Gi
```

### Install with Environment Values

```bash
# Install with default values
helm install myapp ./mychart

# Install for development
helm install myapp ./mychart -f values-dev.yaml

# Install for production
helm install myapp ./mychart -f values-prod.yaml

# Override specific values
helm install myapp ./mychart --set replicaCount=5 --set image.tag="2.0.0"
```

## Chart Dependencies

### Chart.yaml Dependencies

```yaml
dependencies:
  - name: postgresql
    version: "12.1.0"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled

  - name: redis
    version: "17.0.0"
    repository: "https://charts.bitnami.com/bitnami"
    alias: cache
```

### Managing Dependencies

```bash
# Update dependencies (download charts)
helm dependency update ./mychart

# List dependencies
helm dependency list ./mychart

# Build dependencies
helm dependency build ./mychart
```

### Values for Dependencies

```yaml
# Parent chart values.yaml

# Enable/disable postgres dependency
postgresql:
  enabled: true
  auth:
    password: mypassword
    username: myuser

# Redis dependency (aliased as 'cache')
cache:
  enabled: true
  auth:
    enabled: true
    password: cachepassword
```

## Special Files

### NOTES.txt

Displayed after chart installation:

```
{{ .Release.Name }} has been deployed successfully!

To get the application URL:

1. Get the application URL by running these commands:
   kubectl get ingress {{ include "mychart.fullname" . }}

2. Check the deployment status:
   kubectl get pods -l app={{ include "mychart.name" . }}

3. View the application logs:
   kubectl logs -f deployment/{{ include "mychart.fullname" . }}
```

### .helmignore

Files to exclude from chart package:

```
# Ignore patterns (similar to .gitignore)
.git/
.gitignore
.DS_Store
*.swp
*.bak
.vscode/
.idea/
*.iml
tests/
.github/
.gitlab-ci.yml
.circleci/
```

## Values Validation

### Checking for Required Values

In templates:
```yaml
{{- required "A valid image.repository must be provided" .Values.image.repository }}
```

### Default Values

```yaml
# Provide safe defaults
image:
  tag: {{ .Values.image.tag | default .Chart.AppVersion }}
port: {{ .Values.port | default 8080 }}
```

## Version Compatibility

### Kubernetes Version

```yaml
# Chart.yaml
kubeVersion: ">=1.19.0"
```

In templates:
```yaml
{{- if .Capabilities.APIVersions.Has "networking.k8s.io/v1/Ingress" }}
apiVersion: networking.k8s.io/v1
{{- else }}
apiVersion: networking.k8s.io/v1beta1
{{- end }}
kind: Ingress
```

### Helm Version

API versions:
- `v1` - Helm 3.0+ only
- `v2` - Helm 3.0+ only (use for new charts)

## Testing Chart Structure

```bash
# Validate chart structure
helm lint ./mychart

# Render templates
helm template myrelease ./mychart

# Dry-run install
helm install myrelease ./mychart --dry-run --debug

# Get values
helm values ./mychart

# Show chart information
helm show chart ./mychart
helm show values ./mychart
helm show all ./mychart
```
