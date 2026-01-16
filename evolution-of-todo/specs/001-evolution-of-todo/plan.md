# Implementation Plan: Evolution of Todo – 5-Phase AI-Native Todo System

**Branch**: `001-evolution-of-todo` | **Date**: 2025-12-07 | **Spec**: [specs/001-evolution-of-todo/spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-evolution-of-todo/spec.md`

## Summary

Build a Todo system that evolves across five phases from a simple Python console app into a full-stack, AI-powered, cloud-native, event-driven system. The project demonstrates end-to-end Spec-Driven Development (SPEC-KIT-PLUS) where specifications, plans, and tasks drive all implementation via AI coding assistants. Each phase builds incrementally on the previous one, preserving functionality while adding new capabilities.

**Technical Approach**: Progressive enhancement architecture with clear phase boundaries, stable domain model contracts, and containerized deployment strategy.

## Technical Context

**Language/Version**: 
- Phase I: Python 3.11+
- Phase II: TypeScript 5.x (Next.js), Python 3.11+ (FastAPI)
- Phase III: TypeScript 5.x, Python 3.11+
- Phase IV-V: Same as Phase II-III (containerized)

**Primary Dependencies**:
- Phase I: Python standard library (in-memory)
- Phase II: Next.js 14+, FastAPI 0.104+, SQLModel 0.0.14+, Neon PostgreSQL
- Phase III: OpenAI Agents SDK, Official MCP SDK, OpenAI ChatKit
- Phase IV: Docker, Minikube, Helm 3.x, kubectl-ai, kagent
- Phase V: DigitalOcean DOKS, Kafka, Dapr 1.12+

**Storage**:
- Phase I: In-memory (Python list/dict)
- Phase II-V: Neon PostgreSQL (serverless, persistent)

**Testing**:
- Phase I: pytest, manual CLI scripts
- Phase II: pytest (backend), Jest/Vitest (frontend), Playwright (E2E)
- Phase III: pytest (MCP server), conversational test flows
- Phase IV-V: Kubernetes health checks, smoke tests, E2E flows

**Target Platform**:
- Phase I: Local console (Windows/macOS/Linux)
- Phase II: Web browser (Chrome/Firefox/Safari/Edge)
- Phase III: Web browser + AI agent runtime
- Phase IV: Local Kubernetes (Minikube)
- Phase V: Cloud Kubernetes (DigitalOcean DOKS)

**Project Type**: Multi-phase evolution (console → web → AI → cloud-native)

**Performance Goals**:
- Phase I: <100ms per CLI command
- Phase II: <200ms API response (p95), <10s search/filter with 50+ tasks
- Phase III: <2s chatbot response time (p95)
- Phase IV-V: <5min deployment time, <1s health check response

**Constraints**:
- Single-user mode (no multi-tenancy)
- No internet-scale traffic requirements
- All code generated from specs (no manual coding)
- Phase boundaries must preserve backward compatibility

**Scale/Scope**:
- Phase I: 1 user, in-memory, session-based
- Phase II: 1 user, persistent storage, 50+ tasks
- Phase III: 1 user, natural language interaction, 10+ test scenarios
- Phase IV: Local cluster, 3+ services, health monitoring
- Phase V: Cloud cluster, event streaming, audit logging

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase 0 Check (Pre-Research)

✅ **Spec-Driven Development**: Specification complete with all 5 phases defined  
✅ **Atomic Reasoning**: Success criteria are measurable and testable  
✅ **Reusable Intelligence**: Patterns will be extracted (though not as Claude skills)  
✅ **Progressive Enhancement**: Clear phase boundaries with backward compatibility  
✅ **Documentation Chain**: Spec → Plan → Tasks chain defined  
✅ **Measurable Requirements**: All success criteria include quantifiable metrics

**Status**: PASS - All constitution principles satisfied

### Post-Design Check (After Phase 1)

*To be re-evaluated after data model and contracts are generated*

## Project Structure

### Documentation (this feature)

```text
specs/001-evolution-of-todo/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── api/
│   │   ├── openapi.yaml # Phase II API contract
│   │   └── mcp-tools.json # Phase III MCP server tools schema
│   └── events/
│       └── task-events.json # Phase V event schemas
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Phase I: Console Todo
phase-i-console/
├── src/
│   ├── models/
│   │   └── task.py          # Task domain model
│   ├── repositories/
│   │   └── in_memory_repo.py # In-memory task storage
│   ├── services/
│   │   └── task_service.py  # Business logic
│   └── cli/
│       └── main.py           # CLI entry point and menu loop
└── tests/
    ├── unit/
    │   ├── test_task.py
    │   ├── test_repository.py
    │   └── test_service.py
    └── manual/
        └── test_console.sh   # Manual test script

# Phase II: Web Application
backend/
├── src/
│   ├── models/
│   │   └── task.py          # SQLModel task model (extends Phase I)
│   ├── repositories/
│   │   └── task_repository.py # Database repository
│   ├── services/
│   │   └── task_service.py  # Business logic (extends Phase I)
│   ├── api/
│   │   ├── routers/
│   │   │   └── tasks.py     # FastAPI task endpoints
│   │   └── schemas/
│   │       └── task.py       # Pydantic request/response models
│   └── db/
│       ├── database.py       # Database connection
│       └── migrations/       # Alembic migrations
└── tests/
    ├── unit/
    ├── integration/
    │   └── test_api.py
    └── contract/

frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # Main todo list page
│   │   ├── tasks/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx  # Task detail/edit page
│   │   │   └── new/
│   │   │       └── page.tsx  # Create task page
│   │   └── api/              # Next.js API routes (if needed)
│   ├── components/
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskForm.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterControls.tsx
│   │   └── SortControls.tsx
│   ├── services/
│   │   └── api.ts            # API client
│   └── types/
│       └── task.ts           # TypeScript task types
└── tests/
    ├── unit/
    └── e2e/
        └── todo-flows.spec.ts

# Phase III: AI Chatbot
backend/
├── src/
│   ├── mcp_server/          # NEW: MCP server for todo operations
│   │   ├── server.py          # MCP server implementation
│   │   ├── tools/
│   │   │   ├── create_task.py
│   │   │   ├── read_tasks.py
│   │   │   ├── update_task.py
│   │   │   ├── delete_task.py
│   │   │   ├── complete_task.py
│   │   │   └── reschedule_task.py
│   │   └── resources/        # MCP resources (if needed)
│   └── agents/
│       └── todo_agent.py      # OpenAI Agents SDK integration
└── tests/
    └── mcp/
        └── test_tools.py

frontend/
├── src/
│   ├── app/
│   │   └── chat/
│   │       └── page.tsx      # NEW: Chatbot UI page
│   └── components/
│       ├── ChatInterface.tsx # NEW: Chat UI component
│       └── VoiceInput.tsx    # NEW: Voice command support
└── tests/
    └── e2e/
        └── chatbot-flows.spec.ts

# Phase IV: Local Kubernetes Deployment
deployment/
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── mcp-server.Dockerfile
├── helm/
│   └── evolution-of-todo/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── deployment.yaml
│           ├── service.yaml
│           ├── ingress.yaml
│           ├── configmap.yaml
│           └── secret.yaml
└── scripts/
    ├── deploy-local.sh       # Single-command deployment
    └── health-check.sh

# Phase V: Cloud Event-Driven Deployment
deployment/
├── helm/
│   └── evolution-of-todo/
│       ├── values-cloud.yaml # Cloud-specific overrides
│       └── templates/
│           ├── kafka/
│           │   └── kafka-deployment.yaml
│           ├── dapr/
│           │   └── dapr-components.yaml
│           └── event-consumer/
│               └── audit-logger.yaml
└── scripts/
    ├── deploy-cloud.sh
    └── verify-events.sh
```

**Structure Decision**: Multi-phase monorepo with clear separation between console (Phase I), web application (Phase II-III), and deployment artifacts (Phase IV-V). Each phase builds on previous code while maintaining backward compatibility.

## Complexity Tracking

> **No violations detected** - All complexity is justified by progressive enhancement requirements and phase boundaries.

---

# 1. ARCHITECTURE OVERVIEW

## 1.1 Overall Architecture

The Evolution of Todo system follows a **progressive enhancement architecture** where each phase adds layers without breaking previous functionality:

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase V: Cloud Event-Driven Deployment                         │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Event Stream (Kafka) → Audit Logger / Analytics           │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Dapr Sidecars (Pub/Sub, Service Mesh)                      │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Phase IV: Containerized Services (Kubernetes)             │ │
│ │ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│ │ │ Frontend │  │  Backend │  │   DB     │  │  Chatbot │   │ │
│ │ │ (Next.js)│  │ (FastAPI)│  │ (Neon)   │  │  (MCP)   │   │ │
│ │ └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Phase III: AI Chatbot Layer                               │ │
│ │ ┌──────────────┐  ┌──────────────┐                        │ │
│ │ │ Chat UI      │  │ MCP Server   │                        │ │
│ │ │ (ChatKit)    │  │ (Todo Tools) │                        │ │
│ │ └──────────────┘  └──────────────┘                        │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Phase II: Web Application Layer                            │ │
│ │ ┌──────────┐  ┌──────────┐  ┌──────────┐                │ │
│ │ │ Frontend │  │  Backend │  │   DB     │                │ │
│ │ │ (Next.js)│  │ (FastAPI)│  │ (Neon)   │                │ │
│ │ └──────────┘  └──────────┘  └──────────┘                │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Phase I: Console Application (Foundation)                 │ │
│ │ ┌──────────────────────────────────────────────────────┐ │ │
│ │ │ Domain Model (Task) + Repository + Service + CLI      │ │ │
│ │ └──────────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 1.2 Component Responsibilities

### Phase I: Console Todo Manager
- **Domain Model**: Task entity with core attributes (id, description, is_completed)
- **Repository**: In-memory storage abstraction
- **Service**: Business logic for CRUD operations
- **CLI**: User interface (menu-driven command loop)

### Phase II: Web Application
- **Frontend (Next.js)**:
  - UI components (TaskList, TaskItem, TaskForm)
  - Search, filter, sort controls
  - API client for backend communication
- **Backend (FastAPI)**:
  - REST API endpoints for task operations
  - Database repository (extends Phase I repository pattern)
  - Business logic service (extends Phase I service)
- **Database (Neon PostgreSQL)**:
  - Persistent storage for tasks
  - Schema: tasks table with all Phase II attributes

### Phase III: AI Chatbot
- **Chat UI (Next.js)**:
  - ChatInterface component with ChatKit integration
  - Voice input support (speech-to-text)
- **MCP Server (Python)**:
  - Custom MCP server exposing todo operations as tools
  - Tools: create_task, read_tasks, update_task, delete_task, complete_task, reschedule_task
- **Agent (OpenAI Agents SDK)**:
  - Natural language interpretation
  - Tool calling orchestration
  - Confirmation handling for destructive actions

### Phase IV: Local Kubernetes Deployment
- **Containerization**:
  - Docker images for frontend, backend, MCP server
  - Multi-stage builds for optimization
- **Orchestration (Helm + Minikube)**:
  - Kubernetes Deployments, Services, Ingress
  - ConfigMaps for configuration
  - Secrets for sensitive data
  - Health check endpoints
- **AIOps Tools**:
  - kubectl-ai for cluster management
  - kagent for automated operations

### Phase V: Cloud Event-Driven Deployment
- **Event Streaming (Kafka)**:
  - Topics: task.created, task.updated, task.completed, task.deleted
  - Event producers in backend service
- **Service Mesh (Dapr)**:
  - Pub/Sub component for event distribution
  - Service-to-service communication
  - Sidecar pattern for all services
- **Event Consumers**:
  - Audit logger (records all lifecycle events)
  - Analytics processor (optional, for metrics)
- **Cloud Infrastructure (DigitalOcean DOKS)**:
  - Managed Kubernetes cluster
  - Load balancers, ingress controllers
  - Persistent volumes for Kafka

## 1.3 Feature Parity Evolution

| Feature | Phase I | Phase II | Phase III | Phase IV | Phase V |
|--------|---------|----------|-----------|----------|---------|
| Create Task | ✅ CLI | ✅ Web UI | ✅ Web + Chat + Voice | ✅ All | ✅ All |
| Read Tasks | ✅ CLI | ✅ Web UI | ✅ Web + Chat + Voice | ✅ All | ✅ All |
| Update Task | ✅ CLI | ✅ Web UI | ✅ Web + Chat + Voice | ✅ All | ✅ All |
| Delete Task | ✅ CLI | ✅ Web UI | ✅ Web + Chat + Voice | ✅ All | ✅ All |
| Mark Complete | ✅ CLI | ✅ Web UI | ✅ Web + Chat + Voice | ✅ All | ✅ All |
| Priority | ❌ | ✅ | ✅ | ✅ | ✅ |
| Tags | ❌ | ✅ | ✅ | ✅ | ✅ |
| Due Date | ❌ | ✅ | ✅ | ✅ | ✅ |
| Search/Filter | ❌ | ✅ | ✅ | ✅ | ✅ |
| Sort | ❌ | ✅ | ✅ | ✅ | ✅ |
| Persistence | ❌ | ✅ | ✅ | ✅ | ✅ |
| Natural Language | ❌ | ❌ | ✅ | ✅ | ✅ |
| Voice Commands | ❌ | ❌ | ✅ | ✅ | ✅ |
| Containerized | ❌ | ❌ | ❌ | ✅ | ✅ |
| Health Checks | ❌ | ❌ | ❌ | ✅ | ✅ |
| Event Streaming | ❌ | ❌ | ❌ | ❌ | ✅ |
| Cloud Deployment | ❌ | ❌ | ❌ | ❌ | ✅ |

---

# 2. IMPLEMENTATION PHASES AND MILESTONES

## Phase I: Console Todo (Target: Dec 7, 2025)

### Goals and Scope
- **Goal**: Deliver a working console-based todo manager with in-memory storage
- **Scope**: Core CRUD operations (create, read, update, delete, mark complete)
- **Exit Criteria**: 
  - All FR-001 through FR-007 satisfied
  - SC-001 and SC-002 met (reliable operations, immediate consistency)
  - Unit tests passing, manual test script validates all flows

### Main Deliverables
1. **Code**:
   - `phase-i-console/src/models/task.py` - Task domain model
   - `phase-i-console/src/repositories/in_memory_repo.py` - In-memory repository
   - `phase-i-console/src/services/task_service.py` - Business logic
   - `phase-i-console/src/cli/main.py` - CLI interface
2. **Tests**:
   - Unit tests for all components
   - Manual test script (`tests/manual/test_console.sh`)
3. **Documentation**:
   - README with setup and usage instructions
   - Code docstrings following PEP 8

### Entry Criteria
- Python 3.11+ installed
- SPEC-KIT-PLUS methodology understood
- Specification approved

### Exit Criteria
- ✅ All functional requirements (FR-001 to FR-007) implemented
- ✅ Success criteria (SC-001, SC-002) validated
- ✅ Unit test coverage ≥80%
- ✅ Manual test script passes all acceptance scenarios

## Phase II: Web Todo with Persistence (Target: Dec 14, 2025)

### Goals and Scope
- **Goal**: Evolve console app into full-stack web application with persistent storage
- **Scope**: 
  - All Phase I features preserved
  - Add priorities, tags, due dates
  - Add search, filter, sort capabilities
  - Web UI with Next.js
  - REST API with FastAPI
  - Neon PostgreSQL database
- **Exit Criteria**:
  - All FR-101 through FR-109 satisfied
  - SC-101, SC-102, SC-103 met
  - Data persists across restarts
  - Search/filter/sort works with 50+ tasks

### Main Deliverables
1. **Backend Code**:
   - FastAPI application with task endpoints
   - SQLModel task model (extends Phase I model)
   - Database repository (extends Phase I repository pattern)
   - Alembic migrations
2. **Frontend Code**:
   - Next.js application
   - Task list, create, edit pages
   - Search, filter, sort components
   - API client
3. **Database**:
   - Neon PostgreSQL connection configured
   - Schema with tasks table
4. **Tests**:
   - API integration tests
   - Frontend unit tests
   - E2E tests for key flows
5. **Documentation**:
   - API documentation (OpenAPI)
   - Setup guide for local development

### Entry Criteria
- Phase I complete and validated
- Next.js, FastAPI, Neon accounts set up
- Database connection credentials available

### Exit Criteria
- ✅ All functional requirements (FR-101 to FR-109) implemented
- ✅ Success criteria (SC-101, SC-102, SC-103) validated
- ✅ Integration tests passing
- ✅ E2E tests for web flows passing
- ✅ Data persistence verified across restarts

## Phase III: AI Todo Chatbot (Target: Dec 21, 2025)

### Goals and Scope
- **Goal**: Add natural language chatbot interface for todo management
- **Scope**:
  - All Phase II features preserved
  - Chat UI integrated into Next.js app
  - MCP server with todo tools
  - OpenAI Agents SDK integration
  - Voice command support (speech-to-text)
  - Confirmation flows for destructive actions
- **Exit Criteria**:
  - All FR-201 through FR-206 satisfied
  - SC-201, SC-202, SC-203 met
  - 90%+ accuracy on natural language commands
  - Voice commands work equivalently to text

### Main Deliverables
1. **MCP Server**:
   - Custom MCP server implementation
   - Tools: create_task, read_tasks, update_task, delete_task, complete_task, reschedule_task
   - Tool schemas and validation
2. **Chat UI**:
   - ChatInterface component with ChatKit
   - VoiceInput component
   - Integration with MCP server
3. **Agent Integration**:
   - OpenAI Agents SDK setup
   - Tool calling orchestration
   - Confirmation handling
4. **Tests**:
   - MCP tool tests
   - Conversational flow tests
   - Voice command tests
5. **Documentation**:
   - MCP server API documentation
   - Chatbot usage guide

### Entry Criteria
- Phase II complete and validated
- OpenAI API key available
- MCP SDK installed and configured

### Exit Criteria
- ✅ All functional requirements (FR-201 to FR-206) implemented
- ✅ Success criteria (SC-201, SC-202, SC-203) validated
- ✅ Conversational test flows passing
- ✅ Voice commands working
- ✅ 90%+ accuracy on test interactions

## Phase IV: Local Cloud-Native Deployment (Target: Jan 4, 2026)

### Goals and Scope
- **Goal**: Containerize and deploy full system to local Kubernetes cluster
- **Scope**:
  - All Phase III features preserved
  - Docker images for all services
  - Helm charts for Kubernetes deployment
  - Health check endpoints
  - Single-command deployment workflow
  - AIOps tooling integration
- **Exit Criteria**:
  - All FR-301 through FR-304 satisfied
  - SC-301, SC-302, SC-303 met
  - All services start within 5 minutes
  - Health checks functional
  - 3 end-to-end flows succeed

### Main Deliverables
1. **Docker Images**:
   - Backend Dockerfile
   - Frontend Dockerfile
   - MCP server Dockerfile
2. **Helm Charts**:
   - Chart structure with values.yaml
   - Deployment, Service, Ingress templates
   - ConfigMap and Secret templates
3. **Deployment Scripts**:
   - Single-command deployment script
   - Health check verification script
4. **Documentation**:
   - Deployment guide
   - Minikube setup instructions
   - Troubleshooting guide
5. **Tests**:
   - Deployment smoke tests
   - Health check validation
   - E2E flows against cluster

### Entry Criteria
- Phase III complete and validated
- Docker and Minikube installed
- Helm 3.x installed
- kubectl-ai and kagent available

### Exit Criteria
- ✅ All functional requirements (FR-301 to FR-304) implemented
- ✅ Success criteria (SC-301, SC-302, SC-303) validated
- ✅ Deployment script works end-to-end
- ✅ All services healthy
- ✅ 3 representative flows succeed

## Phase V: Cloud Event-Driven Deployment (Target: Jan 18, 2026)

### Goals and Scope
- **Goal**: Deploy to cloud Kubernetes with event-driven architecture
- **Scope**:
  - All Phase IV features preserved
  - DigitalOcean DOKS cluster
  - Kafka event streaming
  - Dapr service mesh
  - Event consumers (audit logger)
  - Cloud-specific configuration
- **Exit Criteria**:
  - All FR-401 through FR-404 satisfied
  - SC-401, SC-402, SC-403 met
  - System accessible over internet
  - Events published and consumed
  - 3 end-to-end flows succeed

### Main Deliverables
1. **Event Infrastructure**:
   - Kafka deployment and configuration
   - Event schemas (task.created, task.updated, task.completed, task.deleted)
   - Event producers in backend
2. **Dapr Integration**:
   - Dapr components configuration
   - Pub/Sub setup
   - Sidecar configuration
3. **Event Consumers**:
   - Audit logger service
   - Event processing logic
4. **Cloud Deployment**:
   - DOKS cluster provisioning
   - Cloud-specific Helm values
   - Ingress and load balancer configuration
5. **Documentation**:
   - Cloud deployment guide
   - Event schema documentation
   - Monitoring setup

### Entry Criteria
- Phase IV complete and validated
- DigitalOcean account with DOKS access
- Kafka and Dapr knowledge/experience

### Exit Criteria
- ✅ All functional requirements (FR-401 to FR-404) implemented
- ✅ Success criteria (SC-401, SC-402, SC-403) validated
- ✅ System accessible via public URL
- ✅ Events published to Kafka
- ✅ Audit logger consuming events
- ✅ 3 representative flows succeed

---

# 3. COMPONENT BREAKDOWN

## 3.1 Domain Layer (Phase I+)

### Task Entity
- **Responsibility**: Core domain model representing a todo item
- **First Appears**: Phase I
- **Evolution**:
  - Phase I: id, description, is_completed, created_at
  - Phase II: Adds priority, tags, due_date, updated_at
  - Phase III-V: No changes (stable contract)
- **Location**: `phase-i-console/src/models/task.py` (Phase I), `backend/src/models/task.py` (Phase II+)

### Task Repository (Interface)
- **Responsibility**: Abstract storage interface
- **First Appears**: Phase I
- **Implementations**:
  - Phase I: `InMemoryTaskRepository` (in-memory list)
  - Phase II+: `DatabaseTaskRepository` (Neon PostgreSQL)
- **Location**: `phase-i-console/src/repositories/` (Phase I), `backend/src/repositories/` (Phase II+)

### Task Service
- **Responsibility**: Business logic for task operations
- **First Appears**: Phase I
- **Evolution**:
  - Phase I: Basic CRUD operations
  - Phase II: Adds search, filter, sort logic
  - Phase III: No changes (used by MCP tools)
  - Phase IV-V: Adds event publishing hooks
- **Location**: `phase-i-console/src/services/task_service.py` (Phase I), `backend/src/services/task_service.py` (Phase II+)

## 3.2 API Layer (Phase II+)

### REST API Endpoints
- **Responsibility**: HTTP interface for task operations
- **First Appears**: Phase II
- **Endpoints**:
  - `GET /api/tasks` - List tasks (with search/filter/sort)
  - `POST /api/tasks` - Create task
  - `GET /api/tasks/{id}` - Get task by ID
  - `PUT /api/tasks/{id}` - Update task
  - `DELETE /api/tasks/{id}` - Delete task
  - `PATCH /api/tasks/{id}/complete` - Mark complete
- **Location**: `backend/src/api/routers/tasks.py`

### API Schemas
- **Responsibility**: Request/response validation
- **First Appears**: Phase II
- **Schemas**: TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
- **Location**: `backend/src/api/schemas/task.py`

## 3.3 Frontend Layer (Phase II+)

### Task List Component
- **Responsibility**: Display list of tasks
- **First Appears**: Phase II
- **Evolution**: Adds search/filter/sort UI in Phase II
- **Location**: `frontend/src/components/TaskList.tsx`

### Task Form Component
- **Responsibility**: Create/edit task form
- **First Appears**: Phase II
- **Evolution**: Adds priority, tags, due date fields in Phase II
- **Location**: `frontend/src/components/TaskForm.tsx`

### Chat Interface Component
- **Responsibility**: Chatbot UI
- **First Appears**: Phase III
- **Features**: Text chat, voice input, message history
- **Location**: `frontend/src/components/ChatInterface.tsx`

## 3.4 AI/Agent Layer (Phase III+)

### MCP Server
- **Responsibility**: Expose todo operations as MCP tools
- **First Appears**: Phase III
- **Tools**:
  - `create_task` - Create new task
  - `read_tasks` - List/search tasks
  - `update_task` - Update task
  - `delete_task` - Delete task
  - `complete_task` - Mark task complete
  - `reschedule_task` - Update due date
- **Location**: `backend/src/mcp_server/`

### Agent Orchestrator
- **Responsibility**: Natural language interpretation and tool calling
- **First Appears**: Phase III
- **Features**: Intent recognition, tool selection, confirmation handling
- **Location**: `backend/src/agents/todo_agent.py`

## 3.5 Infrastructure Layer (Phase IV+)

### Docker Images
- **Responsibility**: Containerized application images
- **First Appears**: Phase IV
- **Images**: backend, frontend, mcp-server
- **Location**: `deployment/docker/`

### Helm Charts
- **Responsibility**: Kubernetes deployment configuration
- **First Appears**: Phase IV
- **Evolution**:
  - Phase IV: Basic K8s resources
  - Phase V: Adds Kafka, Dapr components
- **Location**: `deployment/helm/evolution-of-todo/`

### Health Check Endpoints
- **Responsibility**: Service health monitoring
- **First Appears**: Phase IV
- **Endpoints**: `/health`, `/ready` per service
- **Location**: Each service's API router

## 3.6 Event Layer (Phase V)

### Event Producers
- **Responsibility**: Publish lifecycle events to Kafka
- **First Appears**: Phase V
- **Events**: task.created, task.updated, task.completed, task.deleted
- **Location**: `backend/src/services/task_service.py` (hooks)

### Event Consumers
- **Responsibility**: Process events from Kafka
- **First Appears**: Phase V
- **Consumers**: Audit logger, analytics processor (optional)
- **Location**: `backend/src/consumers/`

## 3.7 Cross-Cutting Concerns

### Configuration Management
- **Phase I**: Environment variables (minimal)
- **Phase II**: Environment variables for DB connection
- **Phase III**: Environment variables for OpenAI API key
- **Phase IV**: ConfigMaps and Secrets in Kubernetes
- **Phase V**: Cloud-specific configuration

### Logging
- **Phase I**: Console logging
- **Phase II+**: Structured logging (JSON format)
- **Phase IV+**: Centralized logging (optional, via sidecar)

### Testing Strategy
- **Phase I**: Unit tests + manual scripts
- **Phase II**: Unit + integration + E2E tests
- **Phase III**: Unit + conversational flow tests
- **Phase IV**: Deployment smoke tests + health checks
- **Phase V**: Cloud E2E tests + event validation

### Authentication/Authorization
- **All Phases**: Single-user mode (no auth required per spec)

---

# 4. DEPENDENCIES AND SEQUENCING

## 4.1 Dependency Graph

```
Phase I (Console)
  └─> Domain Model (Task)
      └─> Repository Interface
          └─> Service Layer
              └─> CLI Interface

Phase II (Web)
  ├─> Phase I Domain Model (extends)
  ├─> Phase I Repository Pattern (implements DB version)
  ├─> Phase I Service Layer (extends)
  ├─> Database Schema (new)
  ├─> REST API (new)
  └─> Frontend UI (new)

Phase III (Chatbot)
  ├─> Phase II Backend API (reuses)
  ├─> Phase II Database (reuses)
  ├─> MCP Server (new)
  └─> Chat UI (new)

Phase IV (Local K8s)
  ├─> Phase III All Components (containerizes)
  ├─> Docker Images (new)
  └─> Helm Charts (new)

Phase V (Cloud Events)
  ├─> Phase IV Deployment (extends)
  ├─> Kafka (new)
  ├─> Dapr (new)
  └─> Event Consumers (new)
```

## 4.2 Critical Dependencies

### Phase I → Phase II
- **Domain Model Stability**: Task model must be stable before Phase II database schema
- **Repository Pattern**: Interface must be defined to allow DB implementation
- **Mitigation**: Freeze Task model attributes in Phase I spec; use adapter pattern if needed

### Phase II → Phase III
- **API Stability**: REST API must be stable before MCP tools call it
- **Database Schema**: Must be finalized before MCP server queries
- **Mitigation**: Version API contracts; use API client abstraction in MCP server

### Phase III → Phase IV
- **Service Boundaries**: Clear separation needed for containerization
- **Configuration**: Externalize all config for K8s ConfigMaps
- **Mitigation**: Design for 12-factor app principles from Phase II

### Phase IV → Phase V
- **Deployment Patterns**: Helm chart structure must support cloud extensions
- **Service Mesh Readiness**: Services must be Dapr-compatible
- **Mitigation**: Use Dapr-compatible patterns from Phase IV

## 4.3 Cross-Phase Data Continuity

### Task Data Model Evolution
- **Phase I → Phase II**: In-memory model must map cleanly to database schema
- **Migration Strategy**: Phase II starts fresh (no data migration needed per spec - single user, new system)
- **Backward Compatibility**: Phase II API must support all Phase I operations

### API Contract Stability
- **Phase II → Phase III**: REST API must remain stable for MCP tools
- **Versioning Strategy**: Use URL versioning (`/api/v1/tasks`) from Phase II
- **Breaking Changes**: Not allowed without phase boundary

## 4.4 Risk Mitigation

| Risk | Phase | Mitigation |
|------|-------|------------|
| Domain model changes break Phase II | I→II | Freeze model in Phase I spec; use adapter if needed |
| API changes break MCP tools | II→III | Version API from Phase II; abstract in MCP client |
| Containerization breaks functionality | III→IV | Test locally first; use Docker Compose for validation |
| Cloud deployment fails | IV→V | Validate on DOKS staging cluster first |
| Event schema changes | V | Version event schemas; use schema registry |

---

# 5. DESIGN DECISIONS NEEDING ADRs

## 5.1 ADR-001: Domain Model Design (Phase I)

**Decision Topic**: Task entity structure and repository pattern

**Alternatives**:
- A. Simple data class with direct attribute access
- B. Rich domain model with behavior methods
- C. Anemic domain model with service layer

**Recommended**: Option B (Rich domain model) - Encapsulates business rules, enables testability, supports future extensions

**Long-term Impact**: Foundation for all phases; changes here require cascading updates

**Status**: Needs ADR before Phase I implementation

## 5.2 ADR-002: API Architecture Style (Phase II)

**Decision Topic**: REST API design and versioning strategy

**Alternatives**:
- A. RESTful with URL versioning (`/api/v1/tasks`)
- B. RESTful with header versioning
- C. GraphQL API

**Recommended**: Option A (URL versioning) - Simple, explicit, tool-friendly for MCP integration

**Long-term Impact**: Affects all API consumers (frontend, MCP tools, future integrations)

**Status**: Needs ADR before Phase II implementation

## 5.3 ADR-003: Database Schema Design (Phase II)

**Decision Topic**: Task table structure and relationship modeling

**Alternatives**:
- A. Single table with JSON column for tags
- B. Normalized: tasks table + task_tags junction table
- C. Denormalized: tags as comma-separated string

**Recommended**: Option B (Normalized) - Supports efficient filtering, scalable, follows relational best practices

**Long-term Impact**: Affects query performance, search/filter implementation, future tag features

**Status**: Needs ADR before Phase II database design

## 5.4 ADR-004: MCP Server Architecture (Phase III)

**Decision Topic**: MCP server implementation pattern and tool design

**Alternatives**:
- A. Single MCP server with all tools
- B. Multiple MCP servers (one per domain)
- C. MCP server as thin wrapper over REST API

**Recommended**: Option C (Thin wrapper) - Reuses existing API, simpler maintenance, consistent behavior

**Long-term Impact**: Affects chatbot reliability, tool extensibility, API coupling

**Status**: Needs ADR before Phase III MCP implementation

## 5.5 ADR-005: Containerization Strategy (Phase IV)

**Decision Topic**: Docker image structure and multi-stage build approach

**Alternatives**:
- A. Single monolithic image
- B. Separate images per service (frontend, backend, MCP)
- C. Base image + service-specific layers

**Recommended**: Option B (Separate images) - Independent scaling, clear boundaries, follows microservices principles

**Long-term Impact**: Affects deployment speed, resource usage, update cadence

**Status**: Needs ADR before Phase IV Dockerfile creation

## 5.6 ADR-006: Event Schema Design (Phase V)

**Decision Topic**: Kafka event schema format and versioning

**Alternatives**:
- A. JSON schema with version in payload
- B. Avro schema with schema registry
- C. Protobuf schema

**Recommended**: Option A (JSON with version) - Simple, human-readable, sufficient for single-user system

**Long-term Impact**: Affects event consumer compatibility, schema evolution, debugging

**Status**: Needs ADR before Phase V event implementation

## 5.7 ADR-007: Deployment Orchestration (Phase IV)

**Decision Topic**: Helm chart structure and values organization

**Alternatives**:
- A. Single values.yaml for all environments
- B. Environment-specific values files (values-dev.yaml, values-prod.yaml)
- C. Helmfile for multi-environment management

**Recommended**: Option B (Environment-specific) - Clear separation, easy overrides, standard practice

**Long-term Impact**: Affects deployment workflow, configuration management, CI/CD integration

**Status**: Needs ADR before Phase IV Helm chart creation

---

# 6. TESTING AND VALIDATION STRATEGY

## 6.1 Phase I Testing

### Unit Tests
- **Scope**: Domain model, repository, service layer
- **Tools**: pytest
- **Coverage Target**: ≥80%
- **Test Files**:
  - `tests/unit/test_task.py` - Task model validation
  - `tests/unit/test_repository.py` - Repository operations
  - `tests/unit/test_service.py` - Business logic

### Manual Testing
- **Scope**: CLI user flows
- **Tool**: Shell script
- **Script**: `tests/manual/test_console.sh`
- **Validates**: All acceptance scenarios from User Story 1

### Success Criteria Validation
- **SC-001**: Manual test script runs all CRUD operations without crashes
- **SC-002**: Verify immediate consistency in test script assertions

## 6.2 Phase II Testing

### Backend Tests
- **Unit Tests**: Service layer, repository (pytest)
- **Integration Tests**: API endpoints (FastAPI TestClient)
- **Coverage Target**: ≥80% for core modules
- **Test Files**:
  - `backend/tests/unit/test_service.py`
  - `backend/tests/integration/test_api.py`

### Frontend Tests
- **Unit Tests**: Components (Jest/Vitest)
- **E2E Tests**: User flows (Playwright)
- **Coverage Target**: ≥70% for components
- **Test Files**:
  - `frontend/tests/unit/`
  - `frontend/tests/e2e/todo-flows.spec.ts`

### Database Tests
- **Integration Tests**: Repository with real Neon connection
- **Migration Tests**: Alembic migration validation

### Success Criteria Validation
- **SC-101**: E2E test for all Phase I actions + new attributes
- **SC-102**: Performance test with 50+ tasks, verify <10s search/filter
- **SC-103**: Integration test for data persistence across restarts

## 6.3 Phase III Testing

### MCP Server Tests
- **Unit Tests**: Individual tool functions (pytest)
- **Integration Tests**: MCP server with mock agent (pytest)
- **Test Files**: `backend/tests/mcp/test_tools.py`

### Conversational Flow Tests
- **Scope**: End-to-end chatbot interactions
- **Tool**: Custom test framework or pytest with mock LLM
- **Test Scenarios**: 10+ representative commands from SC-201
- **Validation**: Verify correct task modifications in database

### Voice Command Tests
- **Scope**: Speech-to-text integration
- **Tool**: Mock speech recognition API
- **Validation**: Voice input produces same results as text

### Success Criteria Validation
- **SC-201**: Conversational flow tests cover all CRUD + reschedule operations
- **SC-202**: Run 20 test interactions, verify ≥18 (90%) succeed
- **SC-203**: Test confirmation prompts for delete and ambiguous commands

## 6.4 Phase IV Testing

### Deployment Smoke Tests
- **Scope**: Verify all services start and are healthy
- **Tool**: Kubernetes health check endpoints
- **Script**: `deployment/scripts/health-check.sh`
- **Validates**: SC-303 (health checks indicate status)

### End-to-End Flow Tests
- **Scope**: 3 representative flows (create, update, delete)
- **Tool**: Playwright or curl scripts
- **Flows**:
  1. Create task via web UI → verify in API → verify in database
  2. Update task via chatbot → verify in web UI
  3. Delete task → verify removal across interfaces

### Success Criteria Validation
- **SC-301**: Deployment script completes in <5 minutes
- **SC-302**: All 3 E2E flows succeed
- **SC-303**: Health check script validates all services

## 6.5 Phase V Testing

### Cloud Deployment Tests
- **Scope**: Verify system accessible and functional
- **Tool**: HTTP requests to public URL
- **Validates**: SC-401 (system reachable)

### Event Streaming Tests
- **Scope**: Verify events published and consumed
- **Tool**: Kafka consumer scripts
- **Validates**: SC-403 (events emitted and recorded)

### End-to-End Cloud Tests
- **Scope**: Same 3 flows as Phase IV, against cloud deployment
- **Tool**: Playwright with cloud URL
- **Validates**: SC-402 (flows succeed in cloud)

### Success Criteria Validation
- **SC-401**: HTTP request to public URL returns 200
- **SC-402**: All 3 E2E flows succeed against cloud
- **SC-403**: Event consumer receives and logs all lifecycle events

## 6.6 Test Coverage Accumulation

| Phase | Unit Tests | Integration Tests | E2E Tests | Manual Tests |
|-------|------------|-------------------|-----------|--------------|
| I | ✅ Domain, Repo, Service | ❌ | ❌ | ✅ CLI flows |
| II | ✅ + API, Components | ✅ API, DB | ✅ Web flows | ❌ |
| III | ✅ + MCP tools | ✅ MCP server | ✅ Chat flows | ❌ |
| IV | ✅ (same) | ✅ (same) | ✅ + K8s flows | ✅ Health checks |
| V | ✅ (same) | ✅ + Events | ✅ + Cloud flows | ✅ Event validation |

**Strategy**: Tests accumulate; each phase adds new test types while preserving previous coverage.

---

# 7. ALIGNMENT WITH SPEC-DRIVEN WORKFLOW

## 7.1 PLAN.md Structure

This plan follows the template structure with the following sections:

1. **Summary** - High-level overview
2. **Technical Context** - Technology choices and constraints
3. **Constitution Check** - Compliance validation
4. **Project Structure** - Code and documentation layout
5. **Architecture Overview** - System design across phases
6. **Implementation Phases** - Detailed phase breakdown
7. **Component Breakdown** - Individual component responsibilities
8. **Dependencies and Sequencing** - Critical path analysis
9. **Design Decisions (ADRs)** - Architectural choices needing documentation
10. **Testing Strategy** - Validation approach per phase

## 7.2 Connection to TASKS.md

The `/sp.tasks` command will decompose this plan into 15-30 minute atomic tasks:

### Phase I Tasks (Example)
- Task 1: "Implement Task domain model with id, description, is_completed" (20 min)
- Task 2: "Implement InMemoryTaskRepository with add, get, update, delete" (25 min)
- Task 3: "Implement TaskService with business logic" (30 min)
- Task 4: "Implement CLI menu loop with command parsing" (25 min)
- Task 5: "Write unit tests for Task model" (15 min)
- ... (continues for all components)

### Phase II Tasks (Example)
- Task 1: "Create FastAPI project structure" (20 min)
- Task 2: "Implement SQLModel Task model (extends Phase I)" (25 min)
- Task 3: "Create Alembic migration for tasks table" (20 min)
- Task 4: "Implement DatabaseTaskRepository" (30 min)
- ... (continues for API, frontend, tests)

Each task will:
- Reference specific functional requirements (FR-XXX)
- Include acceptance criteria from spec
- Be traceable to success criteria (SC-XXX)
- Have estimated duration (15-30 min)

## 7.3 Requirement Coverage

### Functional Requirements Coverage

| Requirement | Phase | Component | Task Reference |
|-------------|-------|-----------|----------------|
| FR-001 to FR-007 | I | Domain, Repo, Service, CLI | Phase I tasks 1-10 |
| FR-101 to FR-109 | II | Backend API, Frontend UI, DB | Phase II tasks 1-25 |
| FR-201 to FR-206 | III | MCP Server, Chat UI, Agent | Phase III tasks 1-15 |
| FR-301 to FR-304 | IV | Docker, Helm, K8s config | Phase IV tasks 1-12 |
| FR-401 to FR-404 | V | Kafka, Dapr, Cloud deploy | Phase V tasks 1-10 |
| FR-501 to FR-503 | All | Documentation | Per-phase doc tasks |

### Success Criteria Coverage

| Success Criterion | Phase | Validation Method | Test Location |
|-------------------|-------|-------------------|---------------|
| SC-001, SC-002 | I | Manual test script | `tests/manual/test_console.sh` |
| SC-101, SC-102, SC-103 | II | E2E tests, performance tests | `frontend/tests/e2e/` |
| SC-201, SC-202, SC-203 | III | Conversational flow tests | `backend/tests/mcp/` |
| SC-301, SC-302, SC-303 | IV | Deployment smoke tests, E2E | `deployment/scripts/` |
| SC-401, SC-402, SC-403 | V | Cloud E2E, event validation | `deployment/scripts/` |
| SC-501, SC-502 | All | Documentation review | Per-phase checklist |
| SC-601 | All | Developer onboarding test | `quickstart.md` validation |

**Status**: ✅ All requirements and success criteria are covered by this plan

---

# SUMMARY AND NEXT STEPS

## Plan Completeness

✅ **Architecture Overview**: Complete - covers all 5 phases with component responsibilities  
✅ **Implementation Phases**: Complete - goals, deliverables, entry/exit criteria for all phases  
✅ **Component Breakdown**: Complete - all major components identified with evolution paths  
✅ **Dependencies**: Complete - dependency graph and risk mitigation strategies defined  
✅ **ADRs**: Complete - 7 critical decisions identified for documentation  
✅ **Testing Strategy**: Complete - testing approach defined for all phases with coverage targets  
✅ **Spec-Driven Alignment**: Complete - plan structure and task decomposition approach defined  

## Remaining Open Questions

### Before Phase 0 (Research)
1. **Python Version**: Confirm Python 3.11+ availability and compatibility
2. **Neon Database**: Verify Neon PostgreSQL connection requirements and limits
3. **OpenAI API**: Confirm API key access and rate limits for Agents SDK

### Before Phase 1 (Design)
1. **Task ID Format**: UUID vs integer (affects database schema)
2. **Tag Storage**: Confirm normalized vs JSON approach (ADR-003)
3. **API Response Format**: Standardize error response structure

### Before Phase 2 (Tasks)
1. **Task Granularity**: Validate 15-30 minute estimates for each phase
2. **Parallel Work**: Identify tasks that can run in parallel within phases

## Recommended Next Steps

1. **Generate Research Document** (`research.md`):
   - Resolve all "NEEDS CLARIFICATION" items from Technical Context
   - Research best practices for each technology choice
   - Document decisions with rationale

2. **Generate Data Model** (`data-model.md`):
   - Define Task entity with all attributes
   - Define Event entity for Phase V
   - Specify validation rules and constraints

3. **Generate API Contracts** (`contracts/`):
   - OpenAPI specification for Phase II REST API
   - MCP tools schema for Phase III
   - Event schemas for Phase V

4. **Generate Quickstart Guide** (`quickstart.md`):
   - Setup instructions for each phase
   - Development workflow
   - Testing instructions

5. **Create ADRs** (using `/sp.adr`):
   - Document all 7 architectural decisions identified
   - Capture alternatives and rationale

6. **Generate Tasks** (using `/sp.tasks`):
   - Decompose plan into 15-30 minute atomic tasks
   - Link tasks to functional requirements
   - Assign success criteria validation

## Readiness Assessment

**Specification Coverage**: ✅ Complete  
**Plan Completeness**: ✅ Complete  
**Constitution Compliance**: ✅ Passed  
**Risk Identification**: ✅ Complete  
**Test Strategy**: ✅ Defined  

**Status**: **READY FOR PHASE 0 (RESEARCH)** → **PHASE 1 (DESIGN)** → **PHASE 2 (TASKS)**

---

**Plan Generated**: 2025-12-07  
**Next Command**: `/sp.tasks` (after research.md, data-model.md, contracts/, and quickstart.md are generated)
