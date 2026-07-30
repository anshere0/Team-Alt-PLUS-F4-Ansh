# Domain D: Integration & DevOps - Code Conventions & Domain Rules

## 1. Container & Deployment Rules
- **No Hardcoded Secrets**: Secrets (JWT secret, DB passwords) MUST be loaded from environment variables (`.env`). Never commit secrets to Git.
- **Port Discipline**:
  - Frontend: `5173`
  - Backend API / WebSocket: `8000`
  - PostgreSQL Database: `5432`
- **Docker Layer Optimization**: Use multi-stage Docker builds to keep image sizes small (< 200MB for Frontend, < 500MB for Backend).

## 2. Integration & Contract Protection
- **Contract Freeze**: No domain may break a shared schema in `contracts/` without explicit approval from all 4 domain leads.
- **Automated Health Checks**: Every container MUST define a working `healthcheck` command in `docker-compose.yml`.

## 3. Demo Failure Contingencies
- **Offline Backup Stack**: Always maintain a fully functional offline local Docker Compose environment that requires zero external cloud network connectivity.
- **Pre-Demo Reset Script**: Execute `bash scripts/reset_demo.sh` 5 minutes prior to presentation to guarantee clean database state.
