# Domain D: Integration & DevOps - Architecture Document

## 1. System Topology & Containerization Diagram

```
                             [ Internet / User Browser ]
                                          │
                                          ▼
                             [ NGINX / Cloudflare Reverse Proxy ]
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │ Port 80 / 443                               │ Port 8000 / 443 (WS)
                   ▼                                             ▼
        [ Frontend Container (A) ]                     [ Backend Container (B) ]
        - React 18 + Vite + NGINX                      - FastAPI + Uvicorn ASGI
        - Port 5173 / 80                               - WebSocket Server /ws/alerts
                                                                 │
                                                   ┌─────────────┴─────────────┐
                                                   ▼                           ▼
                                      [ PostgreSQL Database ]     [ AIML Model Engine (C) ]
                                      - Supabase / Postgres 15    - PyTorch Models (.pt)
                                      - Port 5432                 - In-process / gRPC
```

---

## 2. Docker Compose Infrastructure Specification (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  database:
    image: postgres:15-alpine
    container_name: gridguard_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: gridguard_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: gridguard_backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgrespassword@database:5432/gridguard_db
      - SECRET_KEY=gridguard-hackathon-super-secret-key
      - BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:8000"]
    depends_on:
      database:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - ./aiml/weights:/app/aiml_models/weights

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: gridguard_frontend
    ports:
      - "5173:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:8000/api/v1
      - VITE_WS_URL=ws://localhost:8000/ws/alerts
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 3. Reverse Proxy & NGINX Routing Configuration (`nginx.conf`)
```nginx
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy REST API Requests to Backend
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Proxy WebSocket Traffic with Upgrades
    location /ws/ {
        proxy_pass http://backend:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 4. End-to-End Integration Verification Protocol
- **Automated Health Probes**: Script `scripts/health_check.py` queries `/api/v1/health` and verifies:
  1. PostgreSQL database ping responds in `< 10ms`.
  2. WebSocket route accepts handshakes.
  3. Pre-trained AI model weights (`.pt`) are loaded in memory.
