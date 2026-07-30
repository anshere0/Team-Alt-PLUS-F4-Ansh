# GridGuard Integration Guide

This document is designed for the **Integration Lead** to understand how the three distinct pillars of the GridGuard project—Frontend, Backend, and AI/ML—communicate and connect with one another.

## 🏗️ System Architecture Overview

GridGuard uses a decoupled architecture where the Backend acts as the central Nervous System, coordinating real-time data flow to the Frontend and orchestrating intelligence via the AI/ML module.

```text
[ Frontend (Next.js) ] <==== (HTTP/REST & WebSockets) ====> [ Backend (FastAPI) ]
                                                                     ||
                                                            (Function Calling API)
                                                                     ||
                                                              [ AI / ML Model ]
```

---

## 1. Backend ↔ Frontend Integration

The Frontend connects to the Backend using two primary protocols:

### A. REST API (State & Auth)
- **Base URL:** `http://localhost:8000/api/v1`
- **Authentication:** The Frontend must first hit `POST /api/v1/auth/login` to receive a JWT Token.
- **Standard Envelope:** All REST responses from the backend follow a strict JSON envelope to make frontend parsing predictable:
  ```json
  {
    "success": true,
    "message": "Data retrieved",
    "data": { ... }
  }
  ```

### B. WebSockets (Real-time Telemetry)
- **URL:** `ws://localhost:8000/api/v1/ws/stream?token=<JWT_TOKEN>`
- **Behavior:** The Backend runs a continuous simulation engine. It pushes live grid telemetry (voltage, current, power) and instant anomaly alerts to the Frontend every 5 seconds. The Frontend should use this stream to animate the dashboard charts and trigger notification toasts without needing to poll the API.

---

## 2. Backend ↔ AI/ML Integration

The AI/ML model is not a passive chatbot; it is integrated as an **Agentic Copilot** that has direct read-access to the GridGuard database.

### How it Works (Function Calling)
1. **The Prompt:** The Frontend sends a user message to `POST /api/v1/ai/chat` (e.g., "What is the status of the grid?").
2. **The Tools:** The Backend wraps this prompt and sends it to the AI/ML model (currently using OpenAI's API format), along with a schema of available **Tools** (Python functions).
3. **The Execution:** If the AI determines it needs live data to answer the question, it pauses its generation and requests the Backend to execute a specific tool (e.g., `get_dashboard_summary`).
4. **The Resolution:** The Backend executes the SQL query against Supabase, returns the raw JSON data to the AI, and the AI uses that data to formulate a natural language response back to the Frontend.

### Changing the ML Model
If the AI/ML team builds a custom model (instead of using OpenAI), the integration guy must update the base URL and API Key inside `backend/app/services/ai_service.py` and `backend/.env.backend`. The custom ML model **must support OpenAI-compatible Function Calling (Tool Calling)** for the agentic features to work.

---

## 3. Integration Checklist (For the Integrator)

To spin up the entire stack locally and verify the connections:

1. **Database:** Ensure the Supabase PostgreSQL database is active and the `DATABASE_URL` is configured in `backend/.env.backend`.
2. **Backend:** 
   - Navigate to the `backend` folder.
   - Run `uvicorn app.main:app --reload`.
   - Ensure the server starts on port `8000`.
3. **AI/ML:**
   - Ensure a valid API Key with billing credits is placed in `backend/.env.backend` under `OPENAI_API_KEY`.
4. **Frontend:**
   - Create a `.env.local` in the frontend directory.
   - Add `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` and `NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws`.
   - Start the frontend server (`npm run dev`).
5. **End-to-End Test:** 
   - Open the frontend.
   - Log in.
   - Wait 5 seconds to see if live data populates the dashboard via WebSockets.
   - Ask the AI Chatbot a question about the grid to verify the AI-Backend loop.
