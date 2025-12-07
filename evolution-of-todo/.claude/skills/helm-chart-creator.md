---
name: helm-chart-creator
description: Creates reusable Helm charts for Kubernetes deployments with configurable values. Use when application needs Kubernetes deployment, managing multiple environments, simplifying deployment process, or when deployment configuration changes. Validates with helm lint.
allowed-tools: Read, Write, Edit, Grep, Run Terminal
---

# Helm-Chart-Creator

This Skill creates reusable Helm charts that simplify Kubernetes deployment across environments.

## When to Use

- Creating Kubernetes deployment
- Managing multiple environments
- Simplifying deployment process
- Creating reusable deployment package
- When application needs Kubernetes deployment
- When deployment configuration changes
- When creating new environment

## Instructions

### Step 1: Analyze Kubernetes Manifests
1. Use **Read** to review existing Kubernetes manifests (deployments, services, configmaps, secrets)
2. Use **Grep** to identify values that should be configurable
3. Identify environment-specific differences
4. Determine chart structure

### Step 2: Create Chart Structure
1. Use **Run Terminal** to initialize Helm chart: `helm create <chart-name>`
2. Organize templates directory
3. Use **Write** to create Chart.yaml with metadata
4. Create values.yaml with defaults

### Step 3: Convert Manifests to Templates
1. Use **Edit** to convert static manifests to Helm templates
2. Replace hardcoded values with template variables
3. Use Helm template functions (if, range, with, etc.)
4. Add template comments

### Step 4: Define Values Schema
1. Use **Write** to create values.yaml with all configurable values
2. Organize values by component (frontend, backend, database)
3. Add comments explaining each value
4. Set sensible defaults

### Step 5: Add Template Logic
1. Add conditional logic for optional resources
2. Add loops for multiple replicas
3. Add helper templates for common patterns
4. Add validation (if needed)

### Step 6: Test Chart
1. Use **Run Terminal** to run `helm lint` to validate chart
2. Run `helm template` to render templates
3. Test with different values
4. Verify chart installs: `helm install --dry-run`

## Quality Checks

1. **Validation:** Chart passes `helm lint`
2. **Templates:** All templates render correctly
3. **Values:** All hardcoded values are configurable
4. **Documentation:** values.yaml is well-documented
5. **Installation:** Chart installs successfully

## Example

**Input:**
- Kubernetes deployment manifest
- Service manifest
- ConfigMap manifest

**Output:**
```yaml
# Chart.yaml
apiVersion: v2
name: todo-app
description: Todo List Application
type: application
version: 0.1.0
appVersion: "1.0.0"

# values.yaml
replicaCount: 2

image:
  repository: todo-frontend
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ClusterIP
  port: 80

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "todo-app.fullname" . }}-frontend
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ include "todo-app.name" . }}
  template:
    metadata:
      labels:
        app: {{ include "todo-app.name" . }}
    spec:
      containers:
      - name: frontend
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
```

## Common Pitfalls to Avoid

1. **Hardcoded Values:** Not making values configurable
2. **Template Errors:** Syntax errors in templates
3. **Missing Defaults:** Values without defaults cause failures
4. **Poor Organization:** Values not organized logically
5. **No Documentation:** Values not explained
