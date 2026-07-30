# Domain D: Integration & DevOps - Memory & Context Management Plan

## 1. Multi-Agent & Vibe Coding Coordination Strategy

When 4 developers (or Antigravity AI agents) are coding simultaneously in parallel workspace sessions:

### 1.1 Centralized Contract Lock (`contracts/`)
- All cross-domain schemas (TypeScript interfaces, Pydantic models, JSON payloads) are mirrored in a shared `contracts/` directory in the repository root.
- No developer or AI agent is permitted to alter a contract in `contracts/` without notifying the rest of the team.

### 1.2 Git Branching & Merge Protocol
- `main`: Locked production branch. Only DevOps (Dev 4) merges PRs into `main`.
- `dev`: Integration testing branch.
- Feature Branches:
  - `feature/domain-a-frontend`
  - `feature/domain-b-backend`
  - `feature/domain-c-aiml`
  - `feature/domain-d-devops`

### 1.3 Emergency Rollback Protocol
- If a last-minute integration bug occurs during Hour 22:
  1. `git stash` or revert recent commit on `main`.
  2. Enable Mock Mode on Frontend (`VITE_USE_MOCK=true`).
  3. Spin up standalone local Docker container containing static API JSON mock responses.
