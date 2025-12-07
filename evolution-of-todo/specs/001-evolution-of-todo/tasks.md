# Tasks: Evolution of Todo – 5-Phase AI-Native Todo System

**Input**: Design documents from `/specs/001-evolution-of-todo/`
**Prerequisites**: plan.md, spec.md
**Feature Branch**: `001-evolution-of-todo`

**Organization**: Tasks organized by the 5 project phases (I-V), with each phase containing foundation → build → integration → verification sub-phases.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions
- Duration: 15-30 minutes per task

---

# PHASE I: Console Todo  

**Goal**: Deliver working console-based todo manager with in-memory storage  
**User Story**: US1 - Console Todo Management (Priority: P1)  
**Success Criteria**: SC-001, SC-002  
**Functional Requirements**: FR-001 through FR-007

## Phase I - Foundation

- [X] P1.T001 Create Phase I project structure in `phase-i-console/` with `src/` and `tests/` directories
- [X] P1.T002 [P] Initialize Python project with `pyproject.toml` and configure pytest in `phase-i-console/`
- [X] P1.T003 [P] Create `phase-i-console/README.md` with setup instructions and project overview

## Phase I - Domain Model

- [X] P1.T004 [US1] Implement Task domain model in `phase-i-console/src/models/task.py` with id, description, is_completed, created_at attributes
- [X] P1.T005 [P] [US1] Write unit tests for Task model in `phase-i-console/tests/unit/test_task.py` validating attribute assignment and validation

## Phase I - Repository Layer

- [X] P1.T006 [US1] Define TaskRepository abstract interface in `phase-i-console/src/repositories/task_repository.py` with add, get, get_all, update, delete methods
- [X] P1.T007 [US1] Implement InMemoryTaskRepository in `phase-i-console/src/repositories/in_memory_repo.py` using Python list for storage
- [X] P1.T008 [P] [US1] Write unit tests for InMemoryTaskRepository in `phase-i-console/tests/unit/test_repository.py` covering all CRUD operations

## Phase I - Service Layer

- [X] P1.T009 [US1] Implement TaskService in `phase-i-console/src/services/task_service.py` with create_task, get_task, get_all_tasks, update_task, delete_task, mark_complete methods
- [X] P1.T010 [US1] Add input validation in TaskService for empty descriptions and invalid task IDs
- [X] P1.T011 [P] [US1] Write unit tests for TaskService in `phase-i-console/tests/unit/test_service.py` covering all business logic

## Phase I - CLI Interface

- [X] P1.T012 [US1] Implement CLI menu loop in `phase-i-console/src/cli/main.py` with command parsing and menu display
- [X] P1.T013 [US1] Add "add task" command handler in `phase-i-console/src/cli/main.py` that prompts for description and creates task
- [X] P1.T014 [US1] Add "list tasks" command handler in `phase-i-console/src/cli/main.py` that displays all tasks with ID, description, completion status
- [X] P1.T015 [US1] Add "complete task" command handler in `phase-i-console/src/cli/main.py` that marks task complete by ID
- [X] P1.T016 [US1] Add "update task" command handler in `phase-i-console/src/cli/main.py` that updates task description by ID
- [X] P1.T017 [US1] Add "delete task" command handler in `phase-i-console/src/cli/main.py` that deletes task by ID
- [X] P1.T018 [US1] Add "exit" command handler in `phase-i-console/src/cli/main.py` that gracefully exits the application

## Phase I - Testing & Verification

- [X] P1.T019 [P] [US1] Create manual test script `phase-i-console/tests/manual/test_console.sh` with all acceptance scenarios from spec
- [X] P1.T020 [US1] Run manual test script and verify all acceptance scenarios pass (SC-001 validation)
- [X] P1.T021 [US1] Verify immediate consistency by running operations and checking in-memory state (SC-002 validation)
- [X] P1.T022 [US1] Run pytest and verify unit test coverage ≥80% for core modules

## Phase I - Documentation

- [X] P1.T023 [P] [US1] Update `phase-i-console/README.md` with usage examples and command reference
- [X] P1.T024 [US1] Add docstrings to all public functions following PEP 8 standards

---

## ✅ CHECKPOINT: Phase I Complete

**Completion Criteria**:
- ✓ All tasks P1.T001 through P1.T024 completed
- ✓ All functional requirements FR-001 through FR-007 satisfied
- ✓ Success criteria SC-001 and SC-002 validated
- ✓ Unit test coverage ≥80%
- ✓ Manual test script passes all acceptance scenarios

**Agent Report Format**:
```
Phase I Completion Report:
✓ Task domain model implemented (P1.T004)
✓ In-memory repository working (P1.T007)
✓ Service layer complete (P1.T009)
✓ CLI interface functional (P1.T012-P1.T018)
✓ All unit tests passing (P1.T022)
✓ Manual test script validates all flows (P1.T020)
✓ Documentation complete (P1.T023)

Ready for human review. Please:
1. Review code quality and test coverage
2. Run manual test script to verify functionality
3. Approve → commit → proceed to Phase II
```

**Human Action Required**: Review, approve, commit Phase I before proceeding to Phase II

---

# PHASE II: Web Todo with Persistence  

**Goal**: Evolve console app into full-stack web application with persistent storage  
**User Story**: US2 - Web-Based Todo with Persistence (Priority: P2)  
**Success Criteria**: SC-101, SC-102, SC-103  
**Functional Requirements**: FR-101 through FR-109  
**Dependencies**: Phase I complete (domain model stable)

## Phase II - Foundation

- [ ] P2.T001 Create backend project structure in `backend/` with `src/`, `tests/`, and `alembic/` directories
- [ ] P2.T002 [P] Create frontend project structure in `frontend/` with Next.js App Router setup
- [ ] P2.T003 [P] Initialize FastAPI project in `backend/` with dependencies (FastAPI, SQLModel, Alembic, Neon client)
- [ ] P2.T004 [P] Initialize Next.js project in `frontend/` with TypeScript and required dependencies

## Phase II - Database Setup

- [ ] P2.T005 Configure Neon PostgreSQL connection in `backend/src/db/database.py` with connection pooling
- [ ] P2.T006 [US2] Create SQLModel Task model in `backend/src/models/task.py` extending Phase I model with priority, tags, due_date, updated_at
- [ ] P2.T007 [US2] Create Alembic migration for tasks table in `backend/alembic/versions/` with all Phase II attributes
- [ ] P2.T008 [US2] Create task_tags junction table migration in `backend/alembic/versions/` for normalized tag storage
- [ ] P2.T009 [US2] Run migrations and verify database schema creation

## Phase II - Backend Repository & Service

- [ ] P2.T010 [US2] Implement DatabaseTaskRepository in `backend/src/repositories/task_repository.py` implementing Phase I repository interface
- [ ] P2.T011 [US2] Add search functionality to DatabaseTaskRepository supporting description and tag search
- [ ] P2.T012 [US2] Add filter functionality to DatabaseTaskRepository supporting priority, tag, due_date, completion status
- [ ] P2.T013 [US2] Add sort functionality to DatabaseTaskRepository supporting due_date, priority, creation_date
- [ ] P2.T014 [US2] Implement TaskService in `backend/src/services/task_service.py` extending Phase I service with search/filter/sort logic
- [ ] P2.T015 [P] [US2] Write unit tests for DatabaseTaskRepository in `backend/tests/unit/test_repository.py`
- [ ] P2.T016 [P] [US2] Write unit tests for TaskService in `backend/tests/unit/test_service.py`

## Phase II - Backend API

- [ ] P2.T017 [US2] Create Pydantic schemas in `backend/src/api/schemas/task.py` (TaskCreate, TaskUpdate, TaskResponse, TaskListResponse)
- [ ] P2.T018 [US2] Implement GET /api/v1/tasks endpoint in `backend/src/api/routers/tasks.py` with search/filter/sort query parameters
- [ ] P2.T019 [US2] Implement POST /api/v1/tasks endpoint in `backend/src/api/routers/tasks.py` for creating tasks
- [ ] P2.T020 [US2] Implement GET /api/v1/tasks/{id} endpoint in `backend/src/api/routers/tasks.py` for retrieving single task
- [ ] P2.T021 [US2] Implement PUT /api/v1/tasks/{id} endpoint in `backend/src/api/routers/tasks.py` for updating tasks
- [ ] P2.T022 [US2] Implement DELETE /api/v1/tasks/{id} endpoint in `backend/src/api/routers/tasks.py` for deleting tasks
- [ ] P2.T023 [US2] Implement PATCH /api/v1/tasks/{id}/complete endpoint in `backend/src/api/routers/tasks.py` for marking tasks complete
- [ ] P2.T024 [US2] Add error handling and validation to all API endpoints
- [ ] P2.T025 [P] [US2] Write integration tests for all API endpoints in `backend/tests/integration/test_api.py`

## Phase II - Frontend Types & API Client

- [ ] P2.T026 [P] [US2] Create TypeScript Task type in `frontend/src/types/task.ts` matching backend schema
- [ ] P2.T027 [P] [US2] Implement API client in `frontend/src/services/api.ts` with methods for all CRUD operations

## Phase II - Frontend Components

- [ ] P2.T028 [US2] Create TaskList component in `frontend/src/components/TaskList.tsx` displaying tasks with all attributes
- [ ] P2.T029 [US2] Create TaskItem component in `frontend/src/components/TaskItem.tsx` for individual task display
- [ ] P2.T030 [US2] Create TaskForm component in `frontend/src/components/TaskForm.tsx` with fields for description, priority, tags, due_date
- [ ] P2.T031 [US2] Create SearchBar component in `frontend/src/components/SearchBar.tsx` for text search
- [ ] P2.T032 [US2] Create FilterControls component in `frontend/src/components/FilterControls.tsx` for priority, tag, due_date, completion filters
- [ ] P2.T033 [US2] Create SortControls component in `frontend/src/components/SortControls.tsx` for sorting by due_date, priority, creation_date
- [ ] P2.T034 [P] [US2] Write unit tests for TaskList component in `frontend/tests/unit/TaskList.test.tsx`
- [ ] P2.T035 [P] [US2] Write unit tests for TaskForm component in `frontend/tests/unit/TaskForm.test.tsx`

## Phase II - Frontend Pages

- [ ] P2.T036 [US2] Create main todo list page in `frontend/src/app/page.tsx` integrating TaskList, SearchBar, FilterControls, SortControls
- [ ] P2.T037 [US2] Create task detail/edit page in `frontend/src/app/tasks/[id]/page.tsx` using TaskForm
- [ ] P2.T038 [US2] Create new task page in `frontend/src/app/tasks/new/page.tsx` using TaskForm
- [ ] P2.T039 [US2] Add navigation between pages and task list updates

## Phase II - Testing & Verification

- [ ] P2.T040 [US2] Create E2E test for creating task with all attributes in `frontend/tests/e2e/todo-flows.spec.ts`
- [ ] P2.T041 [US2] Create E2E test for search/filter/sort operations in `frontend/tests/e2e/todo-flows.spec.ts`
- [ ] P2.T042 [US2] Create E2E test for data persistence across browser sessions in `frontend/tests/e2e/todo-flows.spec.ts`
- [ ] P2.T043 [US2] Run performance test with 50+ tasks and verify search/filter completes in <10 seconds (SC-102 validation)
- [ ] P2.T044 [US2] Verify data persists across application restarts (SC-103 validation)
- [ ] P2.T045 [US2] Run all tests and verify coverage targets met (≥80% backend, ≥70% frontend)

## Phase II - Documentation

- [ ] P2.T046 [P] [US2] Generate OpenAPI documentation from FastAPI endpoints in `backend/docs/openapi.json`
- [ ] P2.T047 [US2] Update project README with Phase II setup instructions and API documentation link

---

## ✅ CHECKPOINT: Phase II Complete

**Completion Criteria**:
- ✓ All tasks P2.T001 through P2.T047 completed
- ✓ All functional requirements FR-101 through FR-109 satisfied
- ✓ Success criteria SC-101, SC-102, SC-103 validated
- ✓ All Phase I features preserved and working via web UI
- ✓ Data persistence verified across restarts
- ✓ Search/filter/sort performance validated

**Agent Report Format**:
```
Phase II Completion Report:
✓ Database schema created and migrated (P2.T009)
✓ Backend API endpoints implemented (P2.T018-P2.T023)
✓ Frontend components and pages complete (P2.T028-P2.T039)
✓ E2E tests passing (P2.T040-P2.T042)
✓ Performance targets met (P2.T043)
✓ Data persistence verified (P2.T044)

Ready for human review. Please:
1. Test web UI functionality
2. Verify data persistence across restarts
3. Review API documentation
4. Approve → commit → proceed to Phase III
```

**Human Action Required**: Review, approve, commit Phase II before proceeding to Phase III

---

# PHASE III: AI Todo Chatbot  

**Goal**: Add natural language chatbot interface for todo management  
**User Story**: US3 - Natural Language Todo Management via Chatbot (Priority: P3)  
**Success Criteria**: SC-201, SC-202, SC-203  
**Functional Requirements**: FR-201 through FR-206  
**Dependencies**: Phase II complete (stable API)

## Phase III - Foundation

- [ ] P3.T001 [P] Create MCP server project structure in `backend/src/mcp_server/` with `tools/` and `resources/` directories
- [ ] P3.T002 [P] Install and configure Official MCP SDK in `backend/` for MCP server implementation
- [ ] P3.T003 [P] Install and configure OpenAI Agents SDK in `backend/` for agent orchestration

## Phase III - MCP Server Tools

- [ ] P3.T004 [US3] Implement create_task tool in `backend/src/mcp_server/tools/create_task.py` calling backend API
- [ ] P3.T005 [US3] Implement read_tasks tool in `backend/src/mcp_server/tools/read_tasks.py` with search/filter support
- [ ] P3.T006 [US3] Implement update_task tool in `backend/src/mcp_server/tools/update_task.py` calling backend API
- [ ] P3.T007 [US3] Implement delete_task tool in `backend/src/mcp_server/tools/delete_task.py` calling backend API
- [ ] P3.T008 [US3] Implement complete_task tool in `backend/src/mcp_server/tools/complete_task.py` calling backend API
- [ ] P3.T009 [US3] Implement reschedule_task tool in `backend/src/mcp_server/tools/reschedule_task.py` updating due_date via API
- [ ] P3.T010 [US3] Create MCP server implementation in `backend/src/mcp_server/server.py` registering all tools
- [ ] P3.T011 [P] [US3] Write unit tests for all MCP tools in `backend/tests/mcp/test_tools.py`

## Phase III - Agent Integration

- [ ] P3.T012 [US3] Implement todo_agent in `backend/src/agents/todo_agent.py` using OpenAI Agents SDK with MCP tool integration
- [ ] P3.T013 [US3] Add confirmation handling in todo_agent for destructive actions (delete, bulk operations)
- [ ] P3.T014 [US3] Add clarification prompts in todo_agent for ambiguous commands
- [ ] P3.T015 [US3] Configure agent to support natural language specification of priorities, tags, and due dates

## Phase III - Frontend Chat UI

- [ ] P3.T016 [P] [US3] Create ChatInterface component in `frontend/src/components/ChatInterface.tsx` with ChatKit integration
- [ ] P3.T017 [US3] Integrate ChatInterface with todo_agent API endpoint
- [ ] P3.T018 [US3] Create VoiceInput component in `frontend/src/components/VoiceInput.tsx` with speech-to-text support
- [ ] P3.T019 [US3] Integrate VoiceInput with ChatInterface so voice commands work like text chat
- [ ] P3.T020 [US3] Create chat page in `frontend/src/app/chat/page.tsx` using ChatInterface component
- [ ] P3.T021 [US3] Add navigation link to chat page from main todo list

## Phase III - Testing & Verification

- [ ] P3.T022 [US3] Create conversational flow test for "Add buy milk as high priority task for tomorrow" in `backend/tests/mcp/test_conversational_flows.py`
- [ ] P3.T023 [US3] Create conversational flow test for "What tasks are due this week?" in `backend/tests/mcp/test_conversational_flows.py`
- [ ] P3.T024 [US3] Create conversational flow test for "Mark grocery shopping as complete" in `backend/tests/mcp/test_conversational_flows.py`
- [ ] P3.T025 [US3] Create conversational flow test for confirmation prompt on "Delete all completed tasks" in `backend/tests/mcp/test_conversational_flows.py`
- [ ] P3.T026 [US3] Create conversational flow test for clarification prompt on ambiguous "Delete the task" in `backend/tests/mcp/test_conversational_flows.py`
- [ ] P3.T027 [US3] Run 20 test interactions and verify ≥18 (90%) succeed (SC-202 validation)
- [ ] P3.T028 [US3] Create E2E test for voice command in `frontend/tests/e2e/chatbot-flows.spec.ts` verifying speech-to-text integration
- [ ] P3.T029 [US3] Verify all CRUD + reschedule operations work via chatbot (SC-201 validation)
- [ ] P3.T030 [US3] Verify confirmation prompts appear for destructive actions (SC-203 validation)

## Phase III - Documentation

- [ ] P3.T031 [P] [US3] Document MCP server tools API in `backend/src/mcp_server/README.md`
- [ ] P3.T032 [US3] Create chatbot usage guide in `docs/chatbot-guide.md` with example commands

---

## ✅ CHECKPOINT: Phase III Complete

**Completion Criteria**:
- ✓ All tasks P3.T001 through P3.T032 completed
- ✓ All functional requirements FR-201 through FR-206 satisfied
- ✓ Success criteria SC-201, SC-202, SC-203 validated
- ✓ 90%+ accuracy on natural language commands
- ✓ Voice commands working equivalently to text
- ✓ All Phase II features preserved

**Agent Report Format**:
```
Phase III Completion Report:
✓ MCP server with all 6 tools implemented (P3.T004-P3.T010)
✓ Agent integration complete (P3.T012-P3.T015)
✓ Chat UI and voice input working (P3.T016-P3.T021)
✓ Conversational flow tests passing (P3.T022-P3.T026)
✓ 90%+ accuracy achieved (P3.T027)
✓ Voice commands validated (P3.T028)

Ready for human review. Please:
1. Test chatbot with natural language commands
2. Test voice input functionality
3. Verify confirmation prompts for destructive actions
4. Approve → commit → proceed to Phase IV
```

**Human Action Required**: Review, approve, commit Phase III before proceeding to Phase IV

---

# PHASE IV: Local Cloud-Native Deployment  

**Goal**: Containerize and deploy full system to local Kubernetes cluster  
**User Story**: US4 - Local Containerized Deployment (Priority: P4)  
**Success Criteria**: SC-301, SC-302, SC-303  
**Functional Requirements**: FR-301 through FR-304  
**Dependencies**: Phase III complete (all services functional)

## Phase IV - Foundation

- [ ] P4.T001 Create deployment project structure in `deployment/` with `docker/`, `helm/`, and `scripts/` directories
- [ ] P4.T002 [P] Verify Docker and Minikube are installed and accessible
- [ ] P4.T003 [P] Verify Helm 3.x is installed and configured

## Phase IV - Docker Images

- [ ] P4.T004 [US4] Create backend Dockerfile in `deployment/docker/backend.Dockerfile` with multi-stage build
- [ ] P4.T005 [US4] Create frontend Dockerfile in `deployment/docker/frontend.Dockerfile` with Next.js build optimization
- [ ] P4.T006 [US4] Create MCP server Dockerfile in `deployment/docker/mcp-server.Dockerfile`
- [ ] P4.T007 [US4] Build all Docker images and verify they start successfully
- [ ] P4.T008 [P] [US4] Test Docker images locally with docker-compose before Kubernetes deployment

## Phase IV - Health Check Endpoints

- [ ] P4.T009 [US4] Add /health endpoint to backend API in `backend/src/api/routers/health.py` returning service status
- [ ] P4.T010 [US4] Add /ready endpoint to backend API in `backend/src/api/routers/health.py` returning readiness status
- [ ] P4.T011 [US4] Add /health endpoint to frontend in `frontend/src/app/api/health/route.ts`
- [ ] P4.T012 [US4] Add /health endpoint to MCP server in `backend/src/mcp_server/health.py`

## Phase IV - Helm Charts

- [ ] P4.T013 [US4] Create Helm chart structure in `deployment/helm/evolution-of-todo/` with Chart.yaml
- [ ] P4.T014 [US4] Create values.yaml in `deployment/helm/evolution-of-todo/` with all service configurations
- [ ] P4.T015 [US4] Create backend Deployment template in `deployment/helm/evolution-of-todo/templates/backend-deployment.yaml`
- [ ] P4.T016 [US4] Create frontend Deployment template in `deployment/helm/evolution-of-todo/templates/frontend-deployment.yaml`
- [ ] P4.T017 [US4] Create MCP server Deployment template in `deployment/helm/evolution-of-todo/templates/mcp-server-deployment.yaml`
- [ ] P4.T018 [US4] Create Service templates for all services in `deployment/helm/evolution-of-todo/templates/services.yaml`
- [ ] P4.T019 [US4] Create Ingress template in `deployment/helm/evolution-of-todo/templates/ingress.yaml`
- [ ] P4.T020 [US4] Create ConfigMap template in `deployment/helm/evolution-of-todo/templates/configmap.yaml` for application config
- [ ] P4.T021 [US4] Create Secret template in `deployment/helm/evolution-of-todo/templates/secret.yaml` for sensitive data
- [ ] P4.T022 [US4] Configure health check probes in all Deployment templates

## Phase IV - Deployment Scripts

- [ ] P4.T023 [US4] Create single-command deployment script in `deployment/scripts/deploy-local.sh` that starts Minikube and deploys via Helm
- [ ] P4.T024 [US4] Create health check verification script in `deployment/scripts/health-check.sh` that queries all service health endpoints
- [ ] P4.T025 [US4] Add script to verify all services start within 5 minutes (SC-301 validation)

## Phase IV - Testing & Verification

- [ ] P4.T026 [US4] Run deployment script and verify all services start successfully (SC-301 validation)
- [ ] P4.T027 [US4] Execute E2E flow 1: Create task via web UI → verify in API → verify in database
- [ ] P4.T028 [US4] Execute E2E flow 2: Update task via chatbot → verify in web UI
- [ ] P4.T029 [US4] Execute E2E flow 3: Delete task → verify removal across interfaces
- [ ] P4.T030 [US4] Verify all 3 representative flows succeed (SC-302 validation)
- [ ] P4.T031 [US4] Test health check endpoints and verify they indicate service status correctly (SC-303 validation)
- [ ] P4.T032 [US4] Simulate service failure and verify health checks show unhealthy status (SC-303 validation)

## Phase IV - Documentation

- [ ] P4.T033 [P] [US4] Create deployment guide in `deployment/README.md` with Minikube setup and deployment instructions
- [ ] P4.T034 [US4] Document kubectl-ai and kagent usage for AIOps interactions in `deployment/AIOPS.md`

---

## ✅ CHECKPOINT: Phase IV Complete

**Completion Criteria**:
- ✓ All tasks P4.T001 through P4.T034 completed
- ✓ All functional requirements FR-301 through FR-304 satisfied
- ✓ Success criteria SC-301, SC-302, SC-303 validated
- ✓ All services containerized and running in Minikube
- ✓ Health checks functional
- ✓ 3 end-to-end flows succeed against local cluster

**Agent Report Format**:
```
Phase IV Completion Report:
✓ All Docker images built and tested (P4.T007)
✓ Helm charts created and deployed (P4.T013-P4.T022)
✓ Health check endpoints functional (P4.T009-P4.T012)
✓ Deployment script completes in <5 minutes (P4.T025)
✓ All 3 E2E flows succeed (P4.T030)
✓ Health checks validate service status (P4.T031-P4.T032)

Ready for human review. Please:
1. Review deployment configuration
2. Test health check endpoints
3. Verify all services accessible in Minikube
4. Approve → commit → proceed to Phase V
```

**Human Action Required**: Review, approve, commit Phase IV before proceeding to Phase V

---

# PHASE V: Cloud Event-Driven Deployment  

**Goal**: Deploy to cloud Kubernetes with event-driven architecture  
**User Story**: US5 - Cloud Event-Driven Deployment (Priority: P5)  
**Success Criteria**: SC-401, SC-402, SC-403  
**Functional Requirements**: FR-401 through FR-404  
**Dependencies**: Phase IV complete (local deployment working)

## Phase V - Foundation

- [ ] P5.T001 [P] Provision DigitalOcean DOKS cluster and verify kubectl access
- [ ] P5.T002 [P] Install and configure Kafka in DOKS cluster or set up managed Kafka service
- [ ] P5.T003 [P] Install and configure Dapr in DOKS cluster with sidecar injection enabled

## Phase V - Event Infrastructure

- [ ] P5.T004 [US5] Define event schemas for task.created, task.updated, task.completed, task.deleted in `deployment/helm/evolution-of-todo/templates/events/task-events.json`
- [ ] P5.T005 [US5] Create Kafka topics for all event types in DOKS cluster
- [ ] P5.T006 [US5] Add event publishing hooks to TaskService in `backend/src/services/task_service.py` for all lifecycle events
- [ ] P5.T007 [US5] Implement event producer client in `backend/src/events/producer.py` publishing to Kafka topics
- [ ] P5.T008 [P] [US5] Write unit tests for event producer in `backend/tests/unit/test_event_producer.py`

## Phase V - Dapr Integration

- [ ] P5.T009 [US5] Create Dapr Pub/Sub component configuration in `deployment/helm/evolution-of-todo/templates/dapr/pubsub.yaml`
- [ ] P5.T010 [US5] Configure Dapr sidecars for all services in Deployment templates
- [ ] P5.T011 [US5] Update event producer to use Dapr Pub/Sub instead of direct Kafka connection

## Phase V - Event Consumers

- [ ] P5.T012 [US5] Create audit logger service in `backend/src/consumers/audit_logger.py` consuming task lifecycle events
- [ ] P5.T013 [US5] Implement audit logger Deployment template in `deployment/helm/evolution-of-todo/templates/event-consumer/audit-logger.yaml`
- [ ] P5.T014 [US5] Configure audit logger to record all events to persistent storage
- [ ] P5.T015 [P] [US5] Write tests for audit logger in `backend/tests/unit/test_audit_logger.py`

## Phase V - Cloud Deployment

- [ ] P5.T016 [US5] Create cloud-specific Helm values in `deployment/helm/evolution-of-todo/values-cloud.yaml` with DOKS configuration
- [ ] P5.T017 [US5] Update Ingress template for cloud load balancer configuration
- [ ] P5.T018 [US5] Configure persistent volumes for Kafka and audit logger in Helm templates
- [ ] P5.T019 [US5] Create cloud deployment script in `deployment/scripts/deploy-cloud.sh` for DOKS deployment
- [ ] P5.T020 [US5] Deploy application to DOKS using Helm with cloud values

## Phase V - Testing & Verification

- [ ] P5.T021 [US5] Verify system accessible via public URL (SC-401 validation)
- [ ] P5.T022 [US5] Execute E2E flow 1 against cloud deployment: Create task → verify event published
- [ ] P5.T023 [US5] Execute E2E flow 2 against cloud deployment: Update task → verify event published
- [ ] P5.T024 [US5] Execute E2E flow 3 against cloud deployment: Delete task → verify event published
- [ ] P5.T025 [US5] Verify all 3 representative flows succeed against cloud (SC-402 validation)
- [ ] P5.T026 [US5] Verify task.created event published when task created (SC-403 validation)
- [ ] P5.T027 [US5] Verify task.completed event recorded in audit log when task marked complete (SC-403 validation)
- [ ] P5.T028 [US5] Verify all four event types (created, updated, completed, deleted) are published and consumed

## Phase V - Documentation

- [ ] P5.T029 [P] [US5] Create cloud deployment guide in `deployment/CLOUD-DEPLOYMENT.md` with DOKS setup instructions
- [ ] P5.T030 [US5] Document event schemas and consumer patterns in `deployment/EVENTS.md`
- [ ] P5.T031 [US5] Update main project README with Phase V completion and cloud deployment links

---

## ✅ CHECKPOINT: Phase V Complete

**Completion Criteria**:
- ✓ All tasks P5.T001 through P5.T031 completed
- ✓ All functional requirements FR-401 through FR-404 satisfied
- ✓ Success criteria SC-401, SC-402, SC-403 validated
- ✓ System accessible over internet
- ✓ Events published and consumed
- ✓ All Phase IV features preserved in cloud

**Agent Report Format**:
```
Phase V Completion Report:
✓ Kafka and Dapr configured in DOKS (P5.T002-P5.T003)
✓ Event producers implemented (P5.T006-P5.T007)
✓ Event consumers (audit logger) working (P5.T012-P5.T014)
✓ Cloud deployment successful (P5.T020)
✓ System accessible via public URL (P5.T021)
✓ All 3 E2E flows succeed in cloud (P5.T025)
✓ Events published and recorded (P5.T026-P5.T028)

Ready for human review. Please:
1. Test cloud deployment accessibility
2. Verify event streaming functionality
3. Check audit logger output
4. Approve → commit → PROJECT COMPLETE
```

**Human Action Required**: Review, approve, commit Phase V. **PROJECT COMPLETE** ✅

---

# Dependencies & Execution Order

## Phase Dependencies

```
Setup (Phase I Foundation)
  └─> Phase I Domain Model
      └─> Phase I Repository
          └─> Phase I Service
              └─> Phase I CLI
                  └─> Phase I Testing
                      └─> ✅ CHECKPOINT I

Phase II Foundation
  └─> Phase II Database
      └─> Phase II Backend
          └─> Phase II Frontend
              └─> Phase II Testing
                  └─> ✅ CHECKPOINT II

Phase III Foundation
  └─> Phase III MCP Server
      └─> Phase III Agent
          └─> Phase III Frontend Chat
              └─> Phase III Testing
                  └─> ✅ CHECKPOINT III

Phase IV Foundation
  └─> Phase IV Docker
      └─> Phase IV Helm
          └─> Phase IV Deployment
              └─> Phase IV Testing
                  └─> ✅ CHECKPOINT IV

Phase V Foundation
  └─> Phase V Events
      └─> Phase V Dapr
          └─> Phase V Cloud Deploy
              └─> Phase V Testing
                  └─> ✅ CHECKPOINT V (COMPLETE)
```

## Critical Path

**Sequential (Must Complete in Order)**:
- Phase I → Phase II → Phase III → Phase IV → Phase V (phases must complete sequentially)
- Within each phase: Foundation → Build → Integration → Verification

**Parallel Opportunities**:
- Within Phase I: T002, T003, T005, T008, T011, T023 can run in parallel
- Within Phase II: T002-T004, T015-T016, T025-T027, T034-T035, T046 can run in parallel
- Within Phase III: T001-T003, T011, T016, T031 can run in parallel
- Within Phase IV: T002-T003, T008, T033 can run in parallel
- Within Phase V: T001-T003, T008, T015, T029 can run in parallel

## Task Traceability

### Functional Requirements Coverage

| Requirement | Phase | Tasks |
|-------------|-------|-------|
| FR-001 | I | P1.T013 |
| FR-002 | I | P1.T014 |
| FR-003 | I | P1.T015 |
| FR-004 | I | P1.T016 |
| FR-005 | I | P1.T017 |
| FR-006 | I | P1.T007 |
| FR-007 | I | P1.T004 |
| FR-101 | II | P2.T036-P2.T039 |
| FR-102 | II | P2.T005-P2.T009 |
| FR-103 | II | P2.T006, P2.T030 |
| FR-104 | II | P2.T006, P2.T008, P2.T030 |
| FR-105 | II | P2.T006, P2.T030 |
| FR-106 | II | P2.T011, P2.T031 |
| FR-107 | II | P2.T012, P2.T032 |
| FR-108 | II | P2.T013, P2.T033 |
| FR-109 | II | P2.T044 |
| FR-201 | III | P3.T016-P3.T020 |
| FR-202 | III | P3.T004-P3.T009, P3.T012-P3.T015 |
| FR-203 | III | P3.T015 |
| FR-204 | III | P3.T013 |
| FR-205 | III | P3.T014 |
| FR-206 | III | P3.T004-P3.T009 |
| FR-301 | IV | P4.T023 |
| FR-302 | IV | P4.T009-P4.T012 |
| FR-303 | IV | P4.T015-P4.T017 |
| FR-304 | IV | P4.T004-P4.T006 |
| FR-401 | V | P5.T019-P5.T020 |
| FR-402 | V | P5.T006-P5.T007 |
| FR-403 | V | P5.T012-P5.T014 |
| FR-404 | V | P5.T022-P5.T025 |

### Success Criteria Coverage

| Success Criterion | Phase | Validation Tasks |
|-------------------|-------|------------------|
| SC-001 | I | P1.T020 |
| SC-002 | I | P1.T021 |
| SC-101 | II | P2.T040 |
| SC-102 | II | P2.T043 |
| SC-103 | II | P2.T044 |
| SC-201 | III | P3.T029 |
| SC-202 | III | P3.T027 |
| SC-203 | III | P3.T030 |
| SC-301 | IV | P4.T025-P4.T026 |
| SC-302 | IV | P4.T030 |
| SC-303 | IV | P4.T031-P4.T032 |
| SC-401 | V | P5.T021 |
| SC-402 | V | P5.T025 |
| SC-403 | V | P5.T026-P5.T028 |

---

# Implementation Strategy

## MVP First (Phase I Only)

1. Complete Phase I Foundation (P1.T001-P1.T003)
2. Complete Phase I Domain Model (P1.T004-P1.T005)
3. Complete Phase I Repository (P1.T006-P1.T008)
4. Complete Phase I Service (P1.T009-P1.T011)
5. Complete Phase I CLI (P1.T012-P1.T018)
6. Complete Phase I Testing (P1.T019-P1.T022)
7. **STOP at CHECKPOINT I**: Validate Phase I independently
8. Deploy/demo if ready

## Incremental Delivery

1. **Phase I** → Test independently → Deploy/Demo (Console MVP)
2. **Phase II** → Test independently → Deploy/Demo (Web MVP)
3. **Phase III** → Test independently → Deploy/Demo (AI Chatbot MVP)
4. **Phase IV** → Test independently → Deploy/Demo (Containerized MVP)
5. **Phase V** → Test independently → Deploy/Demo (Cloud Event-Driven MVP)

Each phase adds value without breaking previous phases.

## Parallel Team Strategy

With multiple developers:

1. **Phase I**: Single developer (sequential by nature)
2. **Phase II**: 
   - Developer A: Backend (P2.T005-P2.T025)
   - Developer B: Frontend (P2.T026-P2.T039)
   - Developer C: Database setup (P2.T005-P2.T009)
3. **Phase III**:
   - Developer A: MCP Server (P3.T004-P3.T011)
   - Developer B: Agent Integration (P3.T012-P3.T015)
   - Developer C: Frontend Chat UI (P3.T016-P3.T021)
4. **Phase IV**:
   - Developer A: Docker images (P4.T004-P4.T008)
   - Developer B: Helm charts (P4.T013-P4.T022)
   - Developer C: Deployment scripts (P4.T023-P4.T025)
5. **Phase V**:
   - Developer A: Event infrastructure (P5.T004-P5.T008)
   - Developer B: Dapr integration (P5.T009-P5.T011)
   - Developer C: Cloud deployment (P5.T016-P5.T020)

---

# Summary

## Task Count by Phase

| Phase | Task Count | Estimated Hours |
|-------|------------|----------------|
| Phase I | 24 tasks | 6-8 hours |
| Phase II | 47 tasks | 12-15 hours |
| Phase III | 32 tasks | 8-10 hours |
| Phase IV | 34 tasks | 9-11 hours |
| Phase V | 31 tasks | 8-10 hours |
| **Total** | **168 tasks** | **43-54 hours** |

## Checkpoints

✅ **Checkpoint I** (End of Phase I): Console Todo functional and tested  
✅ **Checkpoint II** (End of Phase II): Web Todo with persistence functional and tested  
✅ **Checkpoint III** (End of Phase III): AI Chatbot functional and tested  
✅ **Checkpoint IV** (End of Phase IV): Local K8s deployment functional and tested  
✅ **Checkpoint V** (End of Phase V): Cloud event-driven deployment functional and tested

**Each checkpoint requires human review and approval before proceeding to next phase.**

## Example Tasks Demonstrating Atomic, Testable Style

1. **P1.T004** (20 min): "Implement Task domain model in `phase-i-console/src/models/task.py` with id, description, is_completed, created_at attributes"
   - **Acceptance**: Task class exists with all required attributes, can instantiate with description
   - **Output**: `task.py` file with Task class

2. **P2.T018** (25 min): "Implement GET /api/v1/tasks endpoint in `backend/src/api/routers/tasks.py` with search/filter/sort query parameters"
   - **Acceptance**: Endpoint returns task list, accepts query params, returns filtered/sorted results
   - **Output**: Working API endpoint with integration test passing

3. **P3.T004** (20 min): "Implement create_task tool in `backend/src/mcp_server/tools/create_task.py` calling backend API"
   - **Acceptance**: MCP tool can be called, creates task via API, returns task ID
   - **Output**: Working MCP tool with unit test passing

4. **P4.T023** (30 min): "Create single-command deployment script in `deployment/scripts/deploy-local.sh` that starts Minikube and deploys via Helm"
   - **Acceptance**: Script runs successfully, all services start within 5 minutes
   - **Output**: Working deployment script that completes end-to-end

5. **P5.T006** (25 min): "Add event publishing hooks to TaskService in `backend/src/services/task_service.py` for all lifecycle events"
   - **Acceptance**: All CRUD operations publish events, events contain correct payload
   - **Output**: TaskService with event hooks, unit tests verify event publishing

---

**Tasks Generated**: 2025-12-07  
**Total Tasks**: 168  
**Estimated Total Effort**: 43-54 hours  
**Status**: Ready for implementation starting with Phase I
