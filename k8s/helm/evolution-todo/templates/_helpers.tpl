{{/*
Expand the name of the chart.
*/}}
{{- define "evolution-todo.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "evolution-todo.fullname" -}}
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
{{- define "evolution-todo.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "evolution-todo.labels" -}}
helm.sh/chart: {{ include "evolution-todo.chart" . }}
{{ include "evolution-todo.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "evolution-todo.selectorLabels" -}}
app.kubernetes.io/name: {{ include "evolution-todo.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "evolution-todo.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "evolution-todo.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Frontend full name
*/}}
{{- define "evolution-todo.frontend.fullname" -}}
{{- printf "%s-frontend" (include "evolution-todo.fullname" .) }}
{{- end }}

{{/*
Backend full name
*/}}
{{- define "evolution-todo.backend.fullname" -}}
{{- printf "%s-backend" (include "evolution-todo.fullname" .) }}
{{- end }}

{{/*
Secret name
*/}}
{{- define "evolution-todo.secretName" -}}
{{- if .Values.secrets.existingSecret }}
{{- .Values.secrets.existingSecret }}
{{- else }}
{{- include "evolution-todo.fullname" . }}-secrets
{{- end }}
{{- end }}
