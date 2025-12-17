# Helm Chart Creator Skill - Complete Manifest

**Skill Name**: helm-chart-creator
**Skill Type**: Kubernetes Deployment and Configuration Management
**Created**: 2025-12-11
**Status**: Production Ready

## Skill Purpose

Create reusable, production-ready Helm charts for deploying applications to Kubernetes with support for multi-environment configurations, comprehensive templating, and validation.

## Metadata

```yaml
name: helm-chart-creator
description: Creates reusable Helm charts for Kubernetes deployments with configurable values. Use this skill when an application needs Kubernetes deployment, requires multi-environment support, requires a reusable deployment package, or when updating Kubernetes deployment configuration. Validates charts with helm lint before completion.
```

## Directory Structure

```
helm-chart-creator/
├── SKILL.md                          (Main skill definition and workflow)
├── MANIFEST.md                       (This file - complete inventory)
│
├── scripts/                          (Executable utilities)
│   ├── init_helm_chart.sh           (Initialize new charts with templates)
│   ├── validate_chart.sh            (Validate chart structure and syntax)
│   └── test_chart.sh                (Test with multiple values files)
│
├── references/                       (Reference documentation)
│   ├── helm_templating_guide.md     (Syntax, functions, patterns)
│   ├── chart_structure_reference.md (Structure, organization, conventions)
│   ├── helm_best_practices.md       (Security, configuration, deployment)
│   └── examples.md                  (Code examples, complete templates)
│
└── assets/templates/                (Template examples for quick start)
    ├── Chart.yaml.template          (Chart metadata template)
    ├── values.yaml.template         (Default values template)
    ├── deployment.yaml.template     (Deployment manifest template)
    ├── service.yaml.template        (Service manifest template)
    ├── ingress.yaml.template        (Ingress manifest template)
    ├── configmap.yaml.template      (ConfigMap manifest template)
    ├── secret.yaml.template         (Secret manifest template)
    └── _helpers.tpl.template        (Helper functions template)
```

## File Inventory

### SKILL.md (Main Definition)
- **Purpose**: Primary skill documentation and workflow
- **Size**: ~6,000 lines
- **Content**:
  - YAML frontmatter with metadata
  - When to use the skill (6 use cases)
  - Skill assets overview
  - 6-step workflow for creating Helm charts
  - Quality checklist (18 items)
  - Common patterns and solutions
  - Troubleshooting guide
  - Reference material index

### Scripts (3 Bash executables)

#### init_helm_chart.sh (~300 lines)
- **Purpose**: Initialize new Helm charts with best-practices structure
- **Usage**: `bash init_helm_chart.sh <chart-name> [output-directory]`
- **Creates**:
  - Chart directory with proper organization
  - Chart.yaml with metadata
  - values.yaml with commented defaults
  - templates/ directory with 6 standard templates
  - _helpers.tpl with standard functions
  - .helmignore for clean packaging
- **Output**: Complete, ready-to-customize chart

#### validate_chart.sh (~250 lines)
- **Purpose**: Validate chart structure, syntax, and best practices
- **Usage**: `bash validate_chart.sh <chart-path> [values-file]`
- **Checks**:
  - Required files present (Chart.yaml, values.yaml, templates/)
  - YAML syntax validity
  - helm lint passes
  - Template rendering works
  - Hardcoded value detection
  - Resource counting
- **Output**: Colored validation report with pass/fail status

#### test_chart.sh (~250 lines)
- **Purpose**: Test charts with multiple values files and scenarios
- **Usage**: `bash test_chart.sh <chart-path> [values-directory]`
- **Tests**:
  - Default values rendering
  - Environment-specific values files
  - Custom overrides (replicas, ingress, autoscaling, etc.)
  - YAML validity of rendered output
  - Resource count verification
- **Output**: Test summary with pass/fail counts

### References (4 Markdown documents)

#### helm_templating_guide.md (~500 lines)
- **Purpose**: Complete Helm templating syntax reference
- **Content**:
  - Variable substitution (.Values syntax)
  - Ranges and loops
  - Conditionals and comparisons
  - String, list, and dictionary functions
  - Type conversion and encoding
  - Control structures (whitespace, variables, with blocks)
  - Include and template functions
  - Indentation and formatting (nindent, indent)
  - Context object (.Release, .Chart, .Values)
  - Error handling and defaults
  - Common patterns (labels, replicas, environments, volumes)
  - Testing and common issues

#### chart_structure_reference.md (~400 lines)
- **Purpose**: Chart structure, organization, and conventions
- **Content**:
  - Complete directory structure
  - Chart.yaml fields and metadata
  - values.yaml structure and organization
  - Template file naming conventions
  - Conditional resource creation
  - Multi-environment support
  - Chart dependencies
  - Special files (NOTES.txt, .helmignore)
  - Values validation
  - Version compatibility
  - Testing chart structure

#### helm_best_practices.md (~300 lines)
- **Purpose**: Proven patterns for production Helm charts
- **Content**:
  - Configuration management (hierarchy, defaults, examples)
  - Template design (helpers, hardcoding, naming, indentation)
  - Documentation (NOTES.txt, values comments, README)
  - Validation and testing
  - Version compatibility
  - Security (secrets, RBAC, security context)
  - Deployment patterns (health checks, resources, rolling updates)
  - Common pitfalls and solutions (table format)
  - Chart publishing and versioning
  - Maintenance checklist (15 items)

#### examples.md (~700 lines)
- **Purpose**: Concrete, copy-paste-ready template examples
- **Content**:
  - Complete Deployment template
  - Complete Service template
  - Complete Ingress template
  - Complete ConfigMap template
  - Complete Secret template
  - Complete HPA template
  - Complete ServiceAccount template
  - Complete Role template
  - Complete RoleBinding template
  - Complete values.yaml example
  - Multi-environment values-prod.yaml example
  - Complete _helpers.tpl example
  - Complete NOTES.txt example

### Assets (8 Template Files)

All template files use `.template` extension and `CHART_NAME` placeholder:

#### Chart.yaml.template
- Chart metadata with all standard fields
- Ready to customize with actual chart information

#### values.yaml.template
- Complete default configuration structure
- Organized by component (image, service, ingress, resources)
- Every value documented with comments
- Includes all configuration options from other templates

#### deployment.yaml.template
- Production-ready Deployment manifest
- Includes: service account, security context, probes, resources
- All hardcoded values use template variables
- Conditional rendering for autoscaling

#### service.yaml.template
- Kubernetes Service manifest
- Configurable: type, port, targetPort, annotations
- Uses selector labels from helpers

#### ingress.yaml.template
- Ingress manifest with conditional creation
- Supports multiple hosts and paths
- TLS configuration included

#### configmap.yaml.template
- Conditional ConfigMap with data iteration
- Handles both string and complex YAML values

#### secret.yaml.template
- Conditional Secret with base64 encoding
- Proper secret handling patterns

#### _helpers.tpl.template
- Standard Helm helper functions
- Naming functions (name, fullname, chart)
- Label functions (labels, selectorLabels)
- ServiceAccount name helper

## Skill Capabilities

### Scripts Capability
The skill includes 3 production-ready Bash scripts that automate:
- New chart initialization with best-practices templates
- Comprehensive chart validation (structure, syntax, helm lint)
- Multi-scenario testing with multiple values files

### Documentation Capability
Four reference documents totaling ~1,900 lines covering:
- Complete Helm templating syntax and functions
- Chart structure, organization, and conventions
- Best practices for security, configuration, and deployment
- Real-world code examples for every common use case

### Template Assets Capability
8 template files providing:
- Chart metadata structure
- Complete values.yaml with all options
- Deployment, Service, Ingress templates
- ConfigMap, Secret, and helper templates
- Ready to customize with 5-minute chart creation

## Trigger Conditions

The helm-chart-creator skill is automatically triggered when:

1. **User mentions Kubernetes deployment creation**
   - "Create a Helm chart for this app"
   - "Build a Kubernetes deployment package"
   - "Set up Helm chart for microservice"

2. **User needs multi-environment support**
   - "Deploy to dev, staging, and production"
   - "Create different configurations for each environment"
   - "Set up environment-specific Helm values"

3. **User is converting manifests to templates**
   - "Turn these YAML files into a Helm chart"
   - "Templatize our Kubernetes manifests"
   - "Make our deployment reusable with Helm"

4. **User is updating deployment configuration**
   - "Update the Helm chart with new settings"
   - "Add Ingress to our Helm deployment"
   - "Change the Kubernetes deployment structure"

5. **User needs deployment infrastructure**
   - "Create a cloud-native deployment package"
   - "Set up Kubernetes deployment automation"
   - "Build deployment infrastructure as code"

## Quality Assurance

### Validation Checklist
- ✅ YAML frontmatter with required fields (name, description)
- ✅ Single SKILL.md file with comprehensive content
- ✅ 3 production-ready Bash scripts
- ✅ 4 detailed reference documents
- ✅ 8 template examples with proper formatting
- ✅ All content uses imperative/infinitive style
- ✅ No placeholder text - all content complete
- ✅ Consistent markdown formatting throughout
- ✅ Scripts are executable and functional
- ✅ References are comprehensive and well-organized
- ✅ Templates are production-ready
- ✅ Clear workflow from conception to completion
- ✅ Troubleshooting section included
- ✅ Best practices documented throughout
- ✅ Examples provided for every concept

### Skill Readiness
- **Documentation**: Complete (SKILL.md + 4 references)
- **Scripts**: Complete (3 utilities)
- **Templates**: Complete (8 examples)
- **Examples**: Complete (20+ code examples)
- **Testing**: Included (validation and test scripts)
- **Best Practices**: Comprehensive (helm_best_practices.md)

## Usage Workflow

1. **User Request**: User asks to create/update Helm chart
2. **Skill Activation**: Skill is triggered automatically
3. **Workflow Engagement**: Claude executes 6-step workflow:
   - Analyze existing manifests
   - Initialize chart structure
   - Convert manifests to templates
   - Define values configuration
   - Implement template logic
   - Test and validate
4. **Script Usage**: Uses init_helm_chart.sh, validate_chart.sh, test_chart.sh as needed
5. **Reference Consultation**: References helm_templating_guide.md, chart_structure_reference.md, etc.
6. **Asset Usage**: Copies and customizes template files from assets/templates/
7. **Quality Output**: Deliverable is production-ready Helm chart with documentation

## Distribution

### Packaging
Package with: `helm package ./helm-chart-creator`
Output: `helm-chart-creator-1.0.0.zip` or equivalent

### Distribution Channels
- Organization skill repository
- Shared with development teams
- Claude model context (auto-available)

### Dependencies
- Helm 3.0+
- Kubernetes 1.19+
- Bash shell for scripts
- Python 3.x (for validation script YAML parsing)

## Maintenance Notes

### Version 1.0.0
- Initial release
- 3 production scripts
- 4 comprehensive references
- 8 template examples
- Complete workflow documentation

### Future Enhancements (Possible)
- Support for Helm 2.x compatibility
- Additional template examples (StatefulSet, DaemonSet)
- Integration with specific registries (Docker Hub, ECR, etc.)
- CI/CD integration examples
- Security scanning templates
- Performance optimization guides

## Summary

The helm-chart-creator skill provides a complete, professional-grade system for creating Helm charts. With production-ready scripts, comprehensive documentation, and copy-paste-ready templates, users can create sophisticated Kubernetes deployment packages in minutes, not hours.

Total skill content: ~8,500 lines of documentation, examples, and utilities.
Completeness: 100% - All specified requirements met.
Production readiness: ✅ Complete
