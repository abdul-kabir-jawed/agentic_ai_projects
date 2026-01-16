# Helm Templating Guide

This reference covers Helm templating syntax, built-in functions, and common patterns for creating reusable Kubernetes manifests.

## Basic Template Syntax

### Variable Substitution

Access values from `values.yaml` using dot notation:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Values.configMap.name }}
data:
  key: {{ .Values.data.value }}
```

### Ranges

Iterate over lists or maps:

```yaml
# Iterate over a list
{{- range .Values.tags }}
- {{ . }}
{{- end }}

# Iterate over a map
{{- range $key, $value := .Values.environment }}
{{ $key }}: {{ $value }}
{{- end }}
```

### Conditionals

Use `if` to conditionally include sections:

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "chart.fullname" . }}
{{- end }}
```

Conditional comparison:

```yaml
{{- if eq .Values.environment "production" }}
replicas: 5
{{- else }}
replicas: 1
{{- end }}
```

## Built-in Functions

### String Functions

```yaml
# Uppercase
{{ .Values.name | upper }}

# Lowercase
{{ .Values.name | lower }}

# Capitalize first letter
{{ .Values.name | title }}

# Quote
{{ .Values.name | quote }}

# Trimming
{{ .Values.name | trimSuffix "-" }}
{{ .Values.name | trimPrefix "pre-" }}

# Truncate to N characters
{{ .Values.name | trunc 63 | trimSuffix "-" }}
```

### Comparison Functions

```yaml
# Equality
{{- if eq .Values.env "prod" }}

# Not equal
{{- if ne .Values.env "dev" }}

# Greater/Less than
{{- if gt .Values.replicas 1 }}

# Less than
{{- if lt .Values.replicas 10 }}
```

### List Functions

```yaml
# Contains
{{- if has "production" .Values.environments }}

# Join list with separator
{{ join "," .Values.tags }}

# First element
{{ first .Values.list }}

# Last element
{{ last .Values.list }}

# Initial elements (all but last)
{{ initial .Values.list }}
```

### Dictionary Functions

```yaml
# Check if key exists
{{- if .Values.data.key }}

# Get value with default
{{ .Values.data.key | default "default-value" }}

# Merge dictionaries
{{- $merged := merge .Values.defaults .Values.overrides }}
```

### Type Conversion

```yaml
# To YAML
{{ .Values.data | toYaml }}

# To JSON
{{ .Values.data | toJson }}

# From JSON
{{ .Values.jsonString | fromJson }}

# List to string map
{{ list "key1" "value1" "key2" "value2" | dict }}
```

### Encoding

```yaml
# Base64 encode
{{ .Values.secret | b64enc }}

# Base64 decode
{{ .Values.secret | b64dec }}

# URL encode
{{ .Values.url | urlenc }}
```

## Control Structures

### Whitespace Control

Use `-` to strip whitespace:

```yaml
# Strip leading whitespace
{{- if condition }}

# Strip trailing whitespace
{{ value -}}

# Strip both
{{- value -}}
```

Good practice: Strip whitespace to avoid extra blank lines in output

```yaml
metadata:
  labels:
    {{- include "chart.labels" . | nindent 4 }}
```

### Define Variables

```yaml
# Define a variable
{{- $replicas := .Values.replicaCount }}

# Use the variable
replicas: {{ $replicas }}

# Variable scope within range
{{- range .Values.items }}
  name: {{ .name }}
  value: {{ $item }}
{{- end }}
```

### With Blocks

Change context for nested operations:

```yaml
{{- with .Values.service }}
type: {{ .type }}
port: {{ .port }}
targetPort: {{ .targetPort }}
{{- end }}
```

Equivalent to:

```yaml
type: {{ .Values.service.type }}
port: {{ .Values.service.port }}
targetPort: {{ .Values.service.targetPort }}
```

## Include and Template Functions

### Define Reusable Templates

In `_helpers.tpl`:

```yaml
{{- define "mychart.labels" -}}
app: {{ include "mychart.name" . }}
version: {{ .Chart.Version }}
{{- end }}
```

### Include Templates

```yaml
metadata:
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
```

### Named Templates

```yaml
{{- define "mychart.fullname" -}}
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
```

## Indentation and Formatting

### Nindent (indented newline)

Add indentation after newline:

```yaml
# Incorrect - broken indentation
spec:
  containers:
    {{ .Values.containerConfig | toYaml }}

# Correct - proper indentation
spec:
  containers:
    {{ .Values.containerConfig | toYaml | nindent 4 }}
```

### Indent

Add indentation without leading newline:

```yaml
{{- $config | indent 2 }}
```

## Context Object

Built-in values in every template:

```yaml
# Root context (.Release, .Chart, .Files, .Values)
.Release.Name              # Release name (from helm install)
.Release.Namespace         # Kubernetes namespace
.Release.IsUpgrade         # Boolean: is this an upgrade?
.Release.IsInstall         # Boolean: is this an install?
.Chart.Name                # Chart name from Chart.yaml
.Chart.Version             # Chart version from Chart.yaml
.Chart.AppVersion          # App version from Chart.yaml
.Values                    # All values from values.yaml
.Files                     # Access to non-template files
.Capabilities              # Kubernetes capabilities
.Capabilities.KubeVersion.Major  # Kubernetes major version
```

## Error Handling

### Default Values

Provide fallback if value not set:

```yaml
{{ .Values.optional.setting | default "default-value" }}
```

### Required Values

Fail if required value not set:

```yaml
{{- required "A valid .Values.name entry required!" .Values.name }}
```

## Common Patterns

### Label Selectors

```yaml
# Set labels
labels:
  {{- include "chart.labels" . | nindent 2 }}

# Select by labels
selector:
  matchLabels:
    {{- include "chart.selectorLabels" . | nindent 4 }}
```

### Replicas Conditional

```yaml
{{- if not .Values.autoscaling.enabled }}
replicas: {{ .Values.replicaCount }}
{{- end }}
```

### Environment Variables

```yaml
env:
{{- range $key, $value := .Values.env }}
- name: {{ $key | upper }}
  value: {{ $value | quote }}
{{- end }}
```

### Volume Mounts

```yaml
volumeMounts:
{{- range .Values.volumeMounts }}
- name: {{ .name }}
  mountPath: {{ .mountPath }}
  {{- if .subPath }}
  subPath: {{ .subPath }}
  {{- end }}
{{- end }}
```

## Testing

Verify templates render correctly:

```bash
# Render templates with default values
helm template <release-name> <chart-path>

# Render with custom values
helm template <release-name> <chart-path> -f values-custom.yaml

# Dry-run install
helm install <release-name> <chart-path> --dry-run --debug
```

## Common Issues

### Issue: Indentation Problems

**Symptom**: Invalid YAML after rendering

**Solution**: Use `nindent` for multi-line values

```yaml
# Wrong
spec:
  config: {{ .Values.config | toYaml }}

# Correct
spec:
  config: {{ .Values.config | toYaml | nindent 4 }}
```

### Issue: Extra Blank Lines

**Symptom**: Too many blank lines in rendered manifest

**Solution**: Strip whitespace with `-`

```yaml
{{- if .Values.enabled }}
resource: true
{{- end }}
```

### Issue: Undefined Variable

**Symptom**: Template renders blank or error

**Solution**: Check variable path and provide default

```yaml
{{ .Values.nested.key | default "default" }}
```

### Issue: Boolean Comparison

**Symptom**: Conditional not working as expected

**Solution**: Use proper boolean functions

```yaml
# Wrong
{{- if .Values.enabled }}

# Correct
{{- if eq .Values.enabled true }}
```
