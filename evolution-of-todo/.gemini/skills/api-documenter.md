---
name: api-documenter
description: Generates comprehensive API documentation following OpenAPI 3.0 specification. Use when creating new endpoints, modifying endpoint signatures, before API release, or when adding new request/response fields. Validates OpenAPI specs and generates examples.
allowed-tools: Read, Write, Edit, Grep, Run Terminal
---

# API-Documenter

This Skill automatically generates and maintains comprehensive API documentation following OpenAPI 3.0 specification.

## When to Use

- After creating new endpoint
- When modifying endpoint signature
- Before API release
- When adding new request/response fields
- When endpoint signature changes

## Instructions

### Step 1: Analyze API Endpoint
1. Use **Read** to read endpoint code
2. Identify HTTP method, path, and parameters
3. Identify request/response schemas
4. Identify authentication requirements
5. Identify possible error responses

### Step 2: Extract Schema Information
1. Use **Grep** to parse Pydantic models (FastAPI) or TypeScript types
2. Extract field types, validations, and descriptions
3. Identify required vs optional fields
4. Extract default values

### Step 3: Generate OpenAPI Path Definition
1. Use **Write** or **Edit** to create/update OpenAPI spec
2. Add operation (GET, POST, etc.)
3. Add parameters (path, query, header)
4. Add request body schema
5. Add response schemas (200, 400, 404, 500, etc.)
6. Add security requirements

### Step 4: Add Descriptions and Examples
1. Write clear endpoint description
2. Add parameter descriptions
3. Create request body examples
4. Create response examples (success and error)
5. Add tags for grouping

### Step 5: Validate OpenAPI Spec
1. Use **Run Terminal** to run OpenAPI validator
2. Fix any validation errors
3. Ensure spec is complete
4. Test Swagger UI rendering

### Step 6: Update Documentation
1. Update OpenAPI spec file
2. Verify Swagger UI displays correctly
3. Add endpoint to API overview document

## Quality Checks

1. **Completeness:** All endpoints documented
2. **Accuracy:** Documentation matches implementation
3. **Examples:** Every endpoint has request/response examples
4. **Clarity:** Descriptions are clear and concise
5. **Validation:** OpenAPI spec validates without errors

## Example

**Input:**
```python
# app/api/v1/tasks.py
@router.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new task."""
    return await task_service.create_task(task, current_user.id)
```

**Output:**
```yaml
# OpenAPI spec addition
paths:
  /api/v1/tasks:
    post:
      summary: Create a new task
      description: Creates a new task for the authenticated user
      tags:
        - Tasks
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TaskCreate'
            examples:
              basic_task:
                value:
                  title: "Buy groceries"
                  description: "Milk, eggs, bread"
                  priority: "medium"
      responses:
        '201':
          description: Task created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskResponse'
              example:
                id: "550e8400-e29b-41d4-a716-446655440000"
                title: "Buy groceries"
                description: "Milk, eggs, bread"
                priority: "medium"
                completed: false
                created_at: "2025-12-01T10:00:00Z"
        '400':
          description: Invalid request data
        '401':
          description: Unauthorized
```

## Common Pitfalls to Avoid

1. **Outdated Docs:** Documentation doesn't match code
2. **Missing Examples:** No examples for complex requests
3. **Vague Descriptions:** Descriptions don't explain purpose
4. **Missing Error Responses:** Not documenting all possible errors
5. **Incomplete Schemas:** Schemas missing fields or validations
