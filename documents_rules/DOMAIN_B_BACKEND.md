# DOMAIN_B_BACKEND.md

# Domain B — Backend Engineering Handbook

> **Project:** GridGuard AI
>
> **Domain:** B (Backend)
>
> **Purpose:** The backend is the central integration layer connecting the frontend, AI/ML services, database, authentication, and infrastructure.

---

## Contents

1. Mission
2. Responsibilities
3. Technology Stack
4. High-Level Architecture
5. Repository Ownership
6. Folder Structure
7. Layered Architecture
8. Request Lifecycle
9. Controllers
10. Services
11. Repositories
12. Middleware
13. Routing Standards
14. Error Handling
15. Validation
16. Authentication
17. Authorization
18. Database (Prisma + PostgreSQL)
19. Redis Caching
20. AI Integration Layer
21. WebSockets
22. Background Jobs
23. Logging & Monitoring
24. Testing
25. Security
26. Performance
27. Deployment
28. Code Review
29. Definition of Done
30. Engineering Commandments

---

# 1. Mission

The backend is responsible for business logic, data persistence, API implementation, authentication, authorization, AI orchestration, and real-time communication.

It must remain independent from frontend implementation details while exposing stable, documented APIs.

---

# 2. Responsibilities

The backend team owns:

- REST APIs
- WebSocket server
- Authentication
- Authorization
- Business logic
- Prisma ORM
- PostgreSQL
- Redis
- AI service integration
- Validation
- Logging
- Monitoring

The backend **does not** own:

- UI
- AI model implementation
- Infrastructure configuration

---

# 3. Recommended Technology Stack

| Layer | Technology |
|--------|------------|
| Runtime | Node.js |
| Framework | NestJS (preferred) or Express |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Validation | Zod / class-validator |
| Auth | JWT |
| Docs | OpenAPI (Swagger) |
| Testing | Jest |
| Realtime | Socket.IO or ws |

---

# 4. High-Level Architecture

```text
Frontend
    ↓
REST API / WebSocket
    ↓
Controllers
    ↓
Services
    ↓
Repositories
    ↓
PostgreSQL

            ↘
             AI Service

            ↘
             Redis
```

---

# 5. Repository Ownership

Own only backend folders:

```text
backend/
├── src/
├── prisma/
├── tests/
└── docs/
```

Never edit frontend, AI model code, or infrastructure without coordination.

---

# 6. Folder Structure

```text
src/
├── modules/
├── controllers/
├── services/
├── repositories/
├── middleware/
├── guards/
├── websocket/
├── queues/
├── config/
├── utils/
├── types/
└── common/
```

---

# 7. Layered Architecture

```
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Database
```

Business logic belongs only in services.

---

# 8. Request Lifecycle

1. Request arrives
2. Middleware executes
3. Authentication
4. Authorization
5. Validation
6. Controller
7. Service
8. Repository
9. Database / AI
10. Standard response

---

# 9. Controller Rules

Controllers should:

- Parse requests
- Call services
- Return responses

Controllers should **not** contain business logic.

---

# 10. Service Rules

Services should:

- Implement business logic
- Coordinate repositories
- Call AI services
- Publish events
- Handle transactions

---

# 11. Repository Rules

Repositories should:

- Contain database queries only
- Return typed objects
- Never contain business rules

---

# 12. Middleware

Use middleware for:

- Logging
- Request IDs
- CORS
- Rate limiting
- Compression

---

# 13. Routing Standards

Example:

```
GET    /api/v1/grid/status
POST   /api/v1/predictions/load
GET    /api/v1/alerts
PATCH  /api/v1/alerts/:id
```

---

# 14. Error Handling

Use a single global exception handler.

Return the standard API error contract defined in `04_API_CONTRACT_RULES.md`.

---

# 15. Validation

Validate every request before reaching business logic.

Reject malformed payloads with HTTP 422.

---

# 16. Authentication

JWT Bearer tokens.

Protect every non-public endpoint.

---

# 17. Authorization

Use role-based authorization.

Example roles:

- Operator
- Admin
- Analyst

---

# 18. Database

Use Prisma with PostgreSQL.

Never execute raw SQL unless necessary.

Every schema change must be represented by a migration.

---

# 19. Redis

Use Redis for:

- Cache
- Session data (if required)
- Rate limiting
- Background queues

Never cache highly dynamic prediction results unless explicitly designed.

---

# 20. AI Integration

The frontend must never call AI services directly.

Flow:

```
Frontend
 ↓
Backend
 ↓
AI Service
 ↓
Backend
 ↓
Frontend
```

---

# 21. WebSockets

Use WebSockets for:

- Live grid status
- Alerts
- System events

---

# 22. Background Jobs

Queue long-running AI inference and report generation.

Return HTTP 202 with a job ID for asynchronous operations.

---

# 23. Logging

Structured logs should include:

- Request ID
- Endpoint
- Status
- Duration
- User ID (when available)

---

# 24. Testing

Minimum coverage:

- Unit tests
- Integration tests
- Contract tests

Critical API flows must be tested before merge.

---

# 25. Security

Follow OWASP best practices:

- Validate inputs
- Sanitize outputs
- Principle of least privilege
- Secure secrets
- Rate limiting

---

# 26. Performance

Targets:

- Standard API: <2s
- AI orchestration: <10s
- Health endpoint: <200ms

---

# 27. Deployment

Backend should be deployable through Docker with environment-specific configuration.

Never commit secrets.

---

# 28. Code Review

Verify:

- Architecture
- Security
- API contract compliance
- Tests
- Documentation

---

# 29. Definition of Done

A backend task is complete only if:

- API implemented
- Validation added
- Tests pass
- Documentation updated
- Logging present
- API contract respected

---

# 30. Engineering Commandments

1. Keep controllers thin.
2. Put business logic in services.
3. Validate every request.
4. Never expose secrets.
5. Document every endpoint.
6. Preserve API compatibility.
7. Test before merging.
8. Log meaningful events.
9. Review AI-generated code.
10. Leave the codebase cleaner than you found it.
