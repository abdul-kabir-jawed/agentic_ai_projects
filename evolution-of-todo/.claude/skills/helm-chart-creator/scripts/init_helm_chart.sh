#!/bin/bash
# init_helm_chart.sh - Initialize a new Helm chart with best-practices structure
#
# Usage: bash init_helm_chart.sh <chart-name> [output-directory]
#
# This script creates a new Helm chart directory with:
# - Properly structured Chart.yaml
# - Comprehensive values.yaml with commented sections
# - Template directory with common Kubernetes resources
# - _helpers.tpl for reusable template functions
# - .helmignore for clean packages
#

set -e

CHART_NAME="${1:-}"
OUTPUT_DIR="${2:-.}"

# Validate inputs
if [ -z "$CHART_NAME" ]; then
    echo "Error: Chart name is required"
    echo "Usage: $0 <chart-name> [output-directory]"
    exit 1
fi

# Normalize chart name (lowercase, replace spaces with hyphens)
CHART_NAME=$(echo "$CHART_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

CHART_PATH="$OUTPUT_DIR/$CHART_NAME"

# Check if chart already exists
if [ -d "$CHART_PATH" ]; then
    echo "Error: Chart directory already exists at $CHART_PATH"
    exit 1
fi

# Create directory structure
echo "Creating Helm chart structure for: $CHART_NAME"
mkdir -p "$CHART_PATH/templates"
mkdir -p "$CHART_PATH/charts"

# Create .helmignore
cat > "$CHART_PATH/.helmignore" << 'EOF'
# Patterns to ignore when building packages.
# This supports shell glob patterns, relative paths, and negated patterns (prefixed with '!')
# by default, helm ignores these entries
.git/
.gitignore
.helmignore
.DS_Store
*.swp
*.swo
*~
.vscode/
.idea/
*.iml
*.tmp
*.bak
.env
.env.local
EOF

# Create Chart.yaml
cat > "$CHART_PATH/Chart.yaml" << EOF
apiVersion: v2
name: $CHART_NAME
description: A Helm chart for deploying $CHART_NAME on Kubernetes
type: application
version: 0.1.0
appVersion: "1.0.0"
keywords:
  - kubernetes
  - deployment
maintainers:
  - name: DevOps Team
    email: devops@example.com
home: https://github.com/yourusername/$CHART_NAME
sources:
  - https://github.com/yourusername/$CHART_NAME
EOF

# Create values.yaml
cat > "$CHART_PATH/values.yaml" << 'EOF'
# Default values for the Helm chart.
# These are YAML-formatted default values for the chart.
# Declare variables to be passed into templates.

# Global settings
global:
  environment: production
  domain: example.com

# Replica configuration
replicaCount: 1

# Image configuration
image:
  repository: myapp
  pullPolicy: IfNotPresent
  tag: "1.0.0"

# Image pull secrets for private registries
imagePullSecrets: []

# Service account configuration
serviceAccount:
  create: true
  annotations: {}
  name: ""

# Pod annotations
podAnnotations: {}

# Pod security context
podSecurityContext: {}

# Container security context
securityContext: {}

# Service configuration
service:
  type: ClusterIP
  port: 80
  targetPort: 8080
  annotations: {}

# Ingress configuration
ingress:
  enabled: false
  className: "nginx"
  annotations: {}
  hosts:
    - host: example.com
      paths:
        - path: /
          pathType: Prefix
  tls: []

# Resource limits and requests
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

# Autoscaling configuration
autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

# Node selector
nodeSelector: {}

# Tolerations
tolerations: []

# Affinity
affinity: {}

# ConfigMap data
configMap:
  enabled: true
  data: {}

# Secrets
secrets:
  enabled: false
  data: {}

# Probes
probes:
  liveness:
    enabled: true
    initialDelaySeconds: 30
    periodSeconds: 10
  readiness:
    enabled: true
    initialDelaySeconds: 5
    periodSeconds: 5
EOF

# Create _helpers.tpl
cat > "$CHART_PATH/templates/_helpers.tpl" << 'EOF'
{{/*
Expand the name of the chart.
*/}}
{{- define "CHART_NAME.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "CHART_NAME.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "CHART_NAME.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.AppVersion | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "CHART_NAME.labels" -}}
helm.sh/chart: {{ include "CHART_NAME.chart" . }}
{{ include "CHART_NAME.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "CHART_NAME.selectorLabels" -}}
app.kubernetes.io/name: {{ include "CHART_NAME.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "CHART_NAME.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "CHART_NAME.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
EOF

# Create DEPLOYMENT template
cat > "$CHART_PATH/templates/deployment.yaml" << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "CHART_NAME.fullname" . }}
  labels:
    {{- include "CHART_NAME.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "CHART_NAME.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "CHART_NAME.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "CHART_NAME.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
      - name: {{ .Chart.Name }}
        securityContext:
          {{- toYaml .Values.securityContext | nindent 12 }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        ports:
        - name: http
          containerPort: {{ .Values.service.targetPort }}
          protocol: TCP
        {{- if .Values.probes.liveness.enabled }}
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: {{ .Values.probes.liveness.initialDelaySeconds }}
          periodSeconds: {{ .Values.probes.liveness.periodSeconds }}
        {{- end }}
        {{- if .Values.probes.readiness.enabled }}
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: {{ .Values.probes.readiness.initialDelaySeconds }}
          periodSeconds: {{ .Values.probes.readiness.periodSeconds }}
        {{- end }}
        resources:
          {{- toYaml .Values.resources | nindent 12 }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
EOF

# Create SERVICE template
cat > "$CHART_PATH/templates/service.yaml" << 'EOF'
apiVersion: v1
kind: Service
metadata:
  name: {{ include "CHART_NAME.fullname" . }}
  labels:
    {{- include "CHART_NAME.labels" . | nindent 4 }}
  {{- with .Values.service.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    {{- include "CHART_NAME.selectorLabels" . | nindent 4 }}
EOF

# Create ServiceAccount template
cat > "$CHART_PATH/templates/serviceaccount.yaml" << 'EOF'
{{- if .Values.serviceAccount.create -}}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "CHART_NAME.serviceAccountName" . }}
  labels:
    {{- include "CHART_NAME.labels" . | nindent 4 }}
  {{- with .Values.serviceAccount.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
EOF

# Create ConfigMap template (optional)
cat > "$CHART_PATH/templates/configmap.yaml" << 'EOF'
{{- if .Values.configMap.enabled }}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "CHART_NAME.fullname" . }}
  labels:
    {{- include "CHART_NAME.labels" . | nindent 4 }}
data:
  {{- range $key, $value := .Values.configMap.data }}
  {{ $key }}: |
    {{ $value | nindent 4 }}
  {{- end }}
{{- end }}
EOF

# Create Secret template (optional)
cat > "$CHART_PATH/templates/secret.yaml" << 'EOF'
{{- if .Values.secrets.enabled }}
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "CHART_NAME.fullname" . }}
  labels:
    {{- include "CHART_NAME.labels" . | nindent 4 }}
type: Opaque
data:
  {{- range $key, $value := .Values.secrets.data }}
  {{ $key }}: {{ $value | b64enc | quote }}
  {{- end }}
{{- end }}
EOF

# Create Ingress template (optional)
cat > "$CHART_PATH/templates/ingress.yaml" << 'EOF'
{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "CHART_NAME.fullname" . }}
  labels:
    {{- include "CHART_NAME.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  {{- if .Values.ingress.tls }}
  tls:
    {{- range .Values.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "CHART_NAME.fullname" $ }}
                port:
                  number: {{ $.Values.service.port }}
          {{- end }}
    {{- end }}
{{- end }}
EOF

# Create HPA template (optional)
cat > "$CHART_PATH/templates/hpa.yaml" << 'EOF'
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "CHART_NAME.fullname" . }}
  labels:
    {{- include "CHART_NAME.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "CHART_NAME.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    {{- if .Values.autoscaling.targetCPUUtilizationPercentage }}
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
    {{- end }}
{{- end }}
EOF

echo "✓ Helm chart '$CHART_NAME' created successfully at: $CHART_PATH"
echo ""
echo "Next steps:"
echo "  1. Customize values.yaml with your application settings"
echo "  2. Update Chart.yaml metadata (maintainers, repository links)"
echo "  3. Customize templates as needed for your application"
echo "  4. Run: helm lint $CHART_PATH"
echo "  5. Run: helm template $CHART_NAME $CHART_PATH"
echo ""
