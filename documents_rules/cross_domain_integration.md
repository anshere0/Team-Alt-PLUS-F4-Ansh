# Domain D: Integration & DevOps - Cross Domain Integration Specifications

## 1. Multi-Domain Integration Verification Matrix

| Source Domain | Target Domain | Integration Point | Data Protocol | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **Domain A (Frontend)** | **Domain B (Backend)** | REST Telemetry & KPIs | HTTP JSON | OpenAPI Swagger schema validation |
| **Domain A (Frontend)** | **Domain B (Backend)** | Live Alert Feed | WebSocket (`/ws/alerts`) | `wscat` / Playwright event listener |
| **Domain B (Backend)** | **Domain C (AIML)** | Model Inference & SHAP | In-Process Python Call | Pytest unit test on `InferenceEngine` |
| **Domain D (DevOps)** | **Domains A, B, C** | Container Orchestration | Docker Compose | `docker-compose up` health check probe |

---

## 2. Environment Variables Master Matrix (`.env.example`)

```env
# ==========================================
# DOMAIN A: FRONTEND CONFIGURATION
# ==========================================
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws/alerts
VITE_USE_MOCK=false
VITE_APP_TITLE="GridGuard AI Command Center"

# ==========================================
# DOMAIN B: BACKEND CONFIGURATION
# ==========================================
PROJECT_NAME="GridGuard Backend"
SECRET_KEY="gridguard-hackathon-jwt-secret-key-change-me"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

POSTGRES_SERVER=database
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgrespassword
POSTGRES_DB=gridguard_db
DATABASE_URL=postgresql+asyncpg://postgres:postgrespassword@database:5432/gridguard_db

BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://localhost:8000", "https://gridguard.vercel.app"]

# ==========================================
# DOMAIN C: AIML CONFIGURATION
# ==========================================
MODEL_WEIGHTS_DIR="./aiml/weights"
ENABLE_REALTIME_INFERENCE=true
SHAP_BACKGROUND_SAMPLES=50

# ==========================================
# DOMAIN D: DEVOPS CONFIGURATION
# ==========================================
ENVIRONMENT=development
PORT_FRONTEND=5173
PORT_BACKEND=8000
PORT_DATABASE=5432
```

---

## 3. Pre-Demo Integration Verification Checklist
Before pitching to hackathon judges, run the following automated script (`bash scripts/verify_integration.sh`):

```bash
#!/bin/bash
echo "=== GRIDGUARD INTEGRATION CHECK ==="
echo "[1/4] Checking PostgreSQL DB..."
nc -z -v -w5 localhost 5432

echo "[2/4] Checking FastAPI Backend Health..."
curl -f http://localhost:8000/api/v1/kpis || exit 1

echo "[3/4] Checking WebSocket Alert Server..."
python3 -c "import websocket; ws = websocket.create_connection('ws://localhost:8000/ws/alerts'); print('WS Connected'); ws.close()"

echo "[4/4] Checking Frontend Build Asset Availability..."
curl -f http://localhost:5173 || exit 1

echo "SUCCESS: ALL 4 DOMAINS INTEGRATED AND READY FOR DEMO!"
```
