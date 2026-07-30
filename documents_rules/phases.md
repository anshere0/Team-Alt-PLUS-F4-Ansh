# Domain D: Integration & DevOps - 24-Hour Hackathon Phase Breakdown

## Timeline Overview
Developer 4 is responsible for container setup, environment management, CORS configuration, CI/CD automated test verification, inter-domain connection debugging, and pre-demo reset scripting.

```
Hours 0-2  : Repository Setup, Git Branching & Docker Compose Foundation
Hours 2-6  : Database Containerization & Supabase PostgreSQL Linkage
Hours 6-10 : Backend Container Build & CORS Security Policies
Hours 10-14: NGINX Reverse Proxy & WebSocket Upgrades Setup
Hours 14-17: Continuous Integration Scripting & API Contract Testers
Hours 17-20: Multi-Container Orchestration & Environment Synchronization
Hours 20-22: Automated End-to-End Test Suite Execution
Hours 22-24: Pre-Demo Reset Scripting, Presentation Dry Run & Code Lock
```

---

## Detailed Hour-by-Hour Phase Plan

### Phase 1: Repository & Docker Setup (Hours 0 – 2)
- **Hour 0.0 - 1.0**: Initialize monorepo directory layout (`A/`, `B/`, `C/`, `D/`, `contracts/`). Configure `.gitignore`, `.env.example`, and base `docker-compose.yml`.
- **Hour 1.0 - 2.0**: Setup Git branching rules (`main`, `dev`, `feature/*`). Share `contracts/` definitions across all 4 domain leads.

### Phase 2: Database Containerization (Hours 2 – 6)
- **Hour 2.0 - 4.0**: Spin up PostgreSQL container (`postgres:15-alpine`). Configure persistent data volume and health check probe (`pg_isready`).
- **Hour 4.0 - 6.0**: Verify Alembic migration script execution (`alembic upgrade head`) and seed data script invocation from backend container.

### Phase 3: Backend Build & CORS Configuration (Hours 6 – 10)
- **Hour 6.0 - 8.0**: Write Dockerfile for FastAPI Backend. Optimize layer caching for fast rebuilds.
- **Hour 8.0 - 10.0**: Configure CORS policies (`BACKEND_CORS_ORIGINS`) to permit requests from local Vite server (`http://localhost:5173`) and cloud Vercel domains.

### Phase 4: NGINX & WebSockets (Hours 10 – 14)
- **Hour 10.0 - 12.0**: Configure NGINX reverse proxy (`nginx.conf`) routing `/api/` traffic to FastAPI container and `/` to Vite static build.
- **Hour 12.0 - 14.0**: Add `Upgrade` headers to NGINX for WebSocket route `/ws/alerts` (`proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "Upgrade";`).

### Phase 5: CI Integration Scripting (Hours 14 – 17)
- **Hour 14.0 - 15.5**: Write cross-domain integration test scripts (`scripts/verify_contracts.py`). Verify REST payload shapes match TypeScript interface definitions.
- **Hour 15.5 - 17.0**: Configure GitHub Actions workflow (`.github/workflows/ci.yml`) running automated contract checks on every PR push.

### Phase 6: Multi-Container Orchestration (Hours 17 – 20)
- **Hour 17.0 - 18.5**: Run full `docker-compose up --build`. Test container networking across `frontend`, `backend`, `database`, and `aiml` modules.
- **Hour 18.5 - 20.0**: Deploy preview builds: Frontend to Vercel, Backend to Railway / Render, PostgreSQL to Supabase.

### Phase 7: End-to-End Integration Testing (Hours 20 – 22)
- **Hour 20.0 - 21.0**: Run Playwright end-to-end integration tests verifying that clicking `"Simulate Theft"` on Frontend triggers WebSocket payload and updates graph node color.
- **Hour 21.0 - 22.0**: Perform chaos testing (network drop simulation, container restart verification).

### Phase 8: Demo Preparation & Code Lock (Hours 22 – 24)
- **Hour 22.0 - 23.0**: Write `scripts/reset_demo.sh` to purge test data, re-seed pristine 7-day dataset, and pre-warm AI model weights before judging.
- **Hour 23.0 - 24.0**: Full presentation dry-run with all 4 teammates. Lock all branches.
