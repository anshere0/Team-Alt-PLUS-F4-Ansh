# GridGuard Backend Working Documentation

This document explains the internal mechanics, architecture, and design decisions of the GridGuard FastAPI Backend. 

## 🏗️ Architecture Stack
- **Framework:** FastAPI (Python 3.12+)
- **Database ORM:** SQLAlchemy 2.0 (Async)
- **Database Engine:** PostgreSQL (Hosted on Supabase) via `asyncpg` driver
- **Migrations:** Alembic
- **Data Validation:** Pydantic V2
- **Authentication:** JWT (JSON Web Tokens) & PassLib (Bcrypt)

## 📂 Directory Structure

The backend follows a domain-driven, layered architecture inside the `app/` folder:
- `api/v1/`: Contains the routing logic and HTTP endpoints (`routers`).
- `core/`: Global configurations, security utilities, database engine setup, and standard JSON response envelopes.
- `db/models/`: SQLAlchemy ORM classes that map directly to PostgreSQL tables.
- `schemas/`: Pydantic models used to validate incoming request bodies and format outgoing JSON responses.
- `services/`: The core business logic. Keeps the API routes clean and testable.

---

## ⚙️ Core Modules & How They Work

### 1. The Database Layer (`app/db/models`)
The grid topology is strictly relational. 
- **Hierarchy:** `Substation` -> `Feeder` -> `Transformer` -> `SmartMeter`.
- **Telemetry & Alerts:** `TelemetryReading` and `Alert` tables are linked to `SmartMeter` and `Transformer` via Foreign Keys.
- We use purely asynchronous database sessions (`AsyncSessionLocal`) to ensure the server never blocks while waiting for database I/O.

### 2. The Simulation Engine (`app/services/simulator.py`)
Since this is a hackathon project and we don't have physical IoT devices, the backend simulates them.
- Hooked into FastAPI's `lifespan` context manager in `main.py`, a background asyncio task `run_simulation()` starts when the server boots.
- Every 5 seconds, it queries the database for smart meters.
- It generates synthetic telemetry (voltage, current, power) and injects it into the DB.
- **Anomalies:** 5% of the time, it forces an anomaly (e.g., UNDER_VOLTAGE or OVER_CURRENT). When this happens, it automatically generates a new `Alert` in the database.

### 3. The WebSocket Manager (`app/services/ws_manager.py`)
To prevent the frontend from polling the database constantly, we push data to them.
- When the frontend connects to `ws://.../stream`, the connection is authenticated via JWT and stored in an active connections list.
- When the Simulation Engine generates new telemetry or a new Alert, it calls `manager.broadcast()`.
- The WebSocket Manager instantly fires that JSON packet to all connected frontend clients.

### 4. The AI Copilot Service (`app/services/ai_service.py`)
This service acts as the bridge between the backend and the ML model (OpenAI).
- It uses the official `AsyncOpenAI` client.
- **Function Calling:** We have defined JSON schemas for tools like `get_dashboard_summary()` and `get_active_alerts()`. These tools are sent to the LLM alongside the user's prompt.
- If the LLM decides it needs real-time grid context to answer a prompt (e.g. "How many critical alerts are there?"), it returns a `tool_call`.
- The `ai_service` intercepts this, executes the corresponding Python function to query our PostgreSQL database, appends the raw data to the conversation history, and sends it *back* to the LLM.
- The LLM then generates a final, highly accurate human-readable response.

### 5. Deployment & Docker (`Dockerfile`)
The backend is containerized for easy cloud deployment (Render, AWS, Railway).
- It uses `python:3.12-slim`.
- Installs `gcc` and `libpq-dev` to compile the `asyncpg` PostgreSQL drivers.
- Exposes port `8000` and boots using `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
