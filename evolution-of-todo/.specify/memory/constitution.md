# Evolution of Todo Constitution

A 5-phase hackathon project building a Todo system that evolves from Python console app to cloud-native AI chatbot.

## Core Principles

### I. Spec-Driven Development

All implementation MUST be generated from specifications, never manually written.

- Every feature requires complete documentation chain: SPECIFICATION.md → PLAN.md → TASKS.md → Implementation
- Code is produced by AI coding assistants from specs; manual coding is prohibited
- Iterate by refining specifications and prompts until outputs meet acceptance criteria
- No implementation begins without an approved specification

**Rationale**: Specifications create a traceable, reviewable, and reproducible development process. AI-generated code from clear specs ensures consistency and reduces human error.

### II. Atomic Reasoning

Every unit of work MUST be decomposable into measurable, time-boxed components.

- Every task = 15-30 minutes of focused work
- Every decision = justified with documented rationale
- Every ambiguity = surfaced in CLARIFICATION.md before proceeding
- No vague requirements; all criteria MUST be measurable and testable

**Rationale**: Atomic tasks enable accurate progress tracking, parallel execution, and clear accountability. Documented decisions create institutional memory.

### III. Reusable Intelligence

Repeating patterns MUST be extracted into reusable components.

- Create a **SKILL** when a workflow has 2-6 decision points and will be used ≥3 times
- Create a **SUBAGENT** when a process requires >7 decisions and autonomous judgment
- Skills location: `.gemini/skills/` or equivalent
- Subagents location: `.gemini/sub_agents/` or equivalent

**Rationale**: Extracting patterns reduces duplication, ensures consistency across features, and builds compounding intelligence over time.

### IV. Progressive Enhancement

Features MUST mature across phases without breaking existing functionality.

- Phase I: Core CRUD + completion in console (Python)
- Phase II: Web UI + persistence + intermediate features (Next.js + FastAPI + Neon)
- Phase III: AI chatbot controlling todos via natural language (OpenAI ChatKit, Agents SDK, MCP SDK)
- Phase IV: Local Kubernetes deployment (Minikube + Helm)
- Phase V: Cloud-native deployment (Kafka, Dapr, DigitalOcean DOKS)

Each phase MUST:
- Preserve all functionality from previous phases
- Add new capabilities incrementally
- Include migration path for existing data/features

**Rationale**: Progressive enhancement ensures continuous delivery of value while maintaining system stability.

## Key Standards

### Code Style

- **Python**: PEP 8 compliant, type hints required, docstrings for all public functions
- **TypeScript/JavaScript**: ESLint + Prettier configured, strict mode enabled
- **General**: Meaningful variable names, no magic numbers, max function length 50 lines

### Testing

- Unit tests required for all business logic
- Integration tests required for API endpoints and data persistence
- Contract tests required for external service integrations
- Minimum coverage target: 80% for core modules

### Documentation

- README.md required at project root with setup instructions
- API documentation auto-generated from code annotations
- Architecture decisions recorded in ADRs (`history/adr/`)
- Prompt history recorded in PHRs (`history/prompts/`)

### Architecture

- Separation of concerns: Domain logic isolated from I/O
- Single Responsibility: One purpose per module/class
- Dependency injection for testability
- Configuration externalized (environment variables)

### Security

- No secrets in code or version control
- Input validation on all external data
- Authentication required for non-public endpoints
- HTTPS required for production deployments

## Constraints

1. **No Manual Coding**: All code MUST be generated from specifications via AI assistants
2. **Constitution Authority**: Constitution violations are always CRITICAL severity and block delivery
3. **Measurable Requirements**: All requirements MUST be measurable and testable; no vague terms ("robust", "fast", "scalable") without quantification
4. **Documentation Chain**: No implementation without spec → plan → tasks chain complete
5. **Phase Boundaries**: Features MUST NOT skip phases or break backward compatibility

## Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| Schedule Adherence | All 5 phases delivered by milestone dates |
| Documentation Complete | Every feature has spec → plan → tasks → implementation chain |
| Constitution Compliance | Zero CRITICAL violations in final delivery |
| Reusable Intelligence | ≥3 Skills and ≥1 Subagent extracted and documented |
| Test Coverage | ≥80% coverage on core modules |
| Phase Compatibility | All Phase N features work with Phase N-1 functionality |

## Governance

### Amendment Procedure

1. Propose change via `/sp.constitution` command with specific updates
2. Document rationale for change
3. Update version according to semantic versioning rules
4. Propagate changes to dependent templates and commands
5. Record in Sync Impact Report

### Versioning Policy

- **MAJOR** (X.0.0): Backward incompatible principle removals or redefinitions
- **MINOR** (0.X.0): New principle/section added or materially expanded
- **PATCH** (0.0.X): Clarifications, wording, typo fixes

### Compliance Review

- All specifications MUST pass Constitution Check before planning
- All plans MUST re-verify compliance after design phase
- All implementations MUST trace to approved specifications
- Complexity beyond constitution limits MUST be justified in writing

### Authority

This Constitution supersedes all other project practices. In case of conflict:
1. Constitution principles take precedence
2. Escalate to constitution amendment if principle is blocking valid work
3. Document exception with full rationale if temporary deviation required

**Version**: 1.0.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-07
