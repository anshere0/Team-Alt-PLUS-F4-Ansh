# GridGuard API Documentation (For Frontend)

This document provides a quick-start guide for the frontend team to connect to the GridGuard FastAPI backend.

## 🚀 Getting Started

1. **Base URL:** `http://localhost:8000/api/v1`
2. **Interactive Docs (Swagger UI):** Highly recommended! Visit `http://localhost:8000/docs` while the server is running to see all endpoints, schema definitions, and test them directly in your browser.

## 🔐 Authentication

Most endpoints require a JWT Bearer token. 

### 1. Login
- **URL**: `POST /auth/login`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Body**: 
  - `username`: (e.g. `admin`)
  - `password`: (e.g. `admin123`)
- **Returns**: `{"access_token": "eyJhbG...", "token_type": "bearer"}`

### 2. Usage
For all subsequent requests, include the token in the headers:
```http
Authorization: Bearer eyJhbG...
```

---

## 🔌 Core Endpoints

### Dashboard Summary
- **URL**: `GET /dashboard/summary`
- **Description**: Returns the high-level metrics for the dashboard (total load kW, active critical alerts, grid health index).

### Grid Topology
- **URL**: `GET /grid/substations`
- **URL**: `GET /grid/feeders`
- **URL**: `GET /grid/transformers`
- **URL**: `GET /grid/meters`
- **Description**: Fetches the physical grid assets.

### Alerts
- **URL**: `GET /alerts/`
- **Query Params**: `?status=UNRESOLVED&limit=10`
- **Description**: Fetches recent critical and warning alerts.

### AI Copilot
- **URL**: `POST /ai/chat`
- **Body (JSON)**: `{"message": "What is the status of Transformer TX-01?"}`
- **Returns (JSON)**: `{"reply": "Transformer TX-01 is currently operating normally..."}`

---

## ⚡ Real-Time Telemetry (WebSockets)

To receive live power fluctuations and instant alerts, connect to the WebSocket stream.

- **URL**: `ws://localhost:8000/api/v1/ws/stream?token=<YOUR_JWT_TOKEN>`
- **Behavior**: The server will immediately send a `CONNECTION_ACK` message. Every 5 seconds, the Digital Twin Simulator will broadcast `TELEMETRY_UPDATE` and occasional `NEW_ALERT` JSON packets.

**Expected Message Format:**
```json
{
  "type": "TELEMETRY_UPDATE",
  "data": {
    "meter_id": "...",
    "voltage_v": 231.5,
    "current_a": 42.1,
    "active_power_kwh": 8.7,
    "risk_score": 0.1
  }
}
```
