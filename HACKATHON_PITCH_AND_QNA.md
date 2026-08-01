# GridGuard AI - Hackathon Preparation Guide

This document breaks down the main features of your project, how they work under the hood, the complete tech stack, and a curated list of questions the judges are most likely to ask you during your hackathon presentation.

---

## 🚀 Main Features & Technicalities

### 1. Real-Time Executive Dashboard
- **What it does**: Provides grid operators with a high-level view of the electrical grid's health, displaying live metrics like AT&C (Aggregate Technical & Commercial) Loss, Revenue Recovered, and AI Confidence Scores.
- **How it works**: The frontend fetches initial baseline data via standard REST API calls and manages the data globally. The UI is designed to be highly responsive and updates dynamically as new alerts come in.
- **Tech Stack**: **Next.js (React)**, **Tailwind CSS** (for styling), **Zustand** (for lightweight global state management), and **React Query** (for data fetching and caching).

### 2. Live Grid Telemetry & Anomaly Alerts
- **What it does**: Streams live events and alerts to the dashboard the exact moment a power theft or grid anomaly is detected.
- **How it works**: A persistent, bidirectional connection is established between the browser and the server. The backend runs an asynchronous background task (simulator) that pushes JSON payloads (e.g., `NEW_ALERT`) directly to the client. The frontend intercepts these messages and triggers toast notifications and map updates.
- **Tech Stack**: **FastAPI WebSockets** (Backend), **React Hooks (`useWebSocket.ts`)** with automatic exponential backoff reconnection logic (Frontend).

### 3. AI-Powered Theft Detection Engine
- **What it does**: Analyzes smart meter consumption against transformer output to identify discrepancies that indicate power theft (e.g., meter bypassing, direct hooking).
- **How it works**: The backend aggregates energy data across the grid hierarchy (Substation -> Feeder -> Transformer -> Meter). If the energy leaving a transformer is significantly higher than the sum of the meters connected to it, the AI flags a high risk score. It categorizes anomalies into specific types like `PARTIAL_BYPASS` or `METER_FREEZE`.
- **Tech Stack**: **Python**, **FastAPI**, **XGBoost/Scikit-learn** (implied AI models).

### 4. Interactive GIS & Grid Topology Mapping
- **What it does**: Visualizes the physical layout of the electrical grid on an interactive node-based map, highlighting exact locations of suspected power theft.
- **How it works**: The frontend maps hierarchical JSON data into spatial nodes. When an alert fires, the specific node (e.g., `MTR-A1-01-3`) instantly pulses red on the map, allowing operators to dispatch physical inspection crews precisely.
- **Tech Stack**: **React Flow** (for node/edge diagrams), **Leaflet/React-Leaflet** (for geographical mapping).

### 5. High-Performance Asynchronous Backend
- **What it does**: Handles thousands of simultaneous data points from smart meters without blocking or crashing.
- **How it works**: Unlike traditional synchronous servers, the backend uses Python's `asyncio` to handle database queries and websocket streams concurrently. It connects to a remote cloud database for persistence.
- **Tech Stack**: **FastAPI**, **SQLAlchemy (Async)**, **PostgreSQL (Neon DB)**.

---

## 🎯 Top 10 Likely Hackathon Questions & How to Answer Them

Here are the questions judges are most likely to throw at you, along with the technical angles you should take to impress them.

**1. What specific problem does your project solve?**
* **Answer Strategy**: Explain "AT&C Losses" (Aggregate Technical and Commercial losses). Power companies lose millions to non-technical losses (theft). Your software pinpoints *exactly* where theft happens in real-time, saving immense amounts of money and preventing grid overloads.

**2. Why did you choose FastAPI over Node.js (Express) or Django?**
* **Answer Strategy**: Emphasize **speed and AI integration**. FastAPI is natively asynchronous (great for WebSockets) and written in Python, which allowed you to seamlessly integrate your data processing and AI/ML models without needing a separate microservice.

**3. How does your AI/Anomaly Detection actually work?**
* **Answer Strategy**: Explain the hierarchy equation: Energy at Transformer = Sum of Energy at Smart Meters + Expected Technical Loss. If the discrepancy exceeds the technical loss threshold, your algorithm flags it as Commercial Loss (Theft) and calculates a risk score based on historical patterns.

**4. How do you handle real-time data? What if the connection drops?**
* **Answer Strategy**: Highlight your `useWebSocket.ts` implementation. Mention that you aren't just using WebSockets, but you implemented an **exponential backoff reconnection algorithm** to ensure the dashboard automatically and gracefully recovers if the network drops.

**5. How scalable is this architecture? What happens if you connect 1 million smart meters?**
* **Answer Strategy**: Explain that FastAPI handles thousands of concurrent requests due to the ASGI architecture. For the database, you chose PostgreSQL (Neon DB), which supports connection pooling. For future scale, you would add a message broker like Apache Kafka to queue the massive influx of IoT meter data.

**6. Where is the data coming from right now?**
* **Answer Strategy**: Be honest that it's simulated for the hackathon. Explain that you built an asynchronous background simulator task in FastAPI that mimics real-world IoT smart meter telemetry, generating realistic JSON payloads for different theft scenarios like "Meter Freezing" or "Direct Hooking".

**7. I see you removed the login screen. How do you secure the backend API?**
* **Answer Strategy**: Explain that while the UI is open for the demo, the backend API is fully secured using **JWT (JSON Web Tokens)** and role-based access control. You implemented a silent authentication mechanism in your Axios interceptors to automatically fetch and inject a Bearer token into all requests.

**8. What was the hardest technical challenge you faced, and how did you overcome it?**
* **Answer Strategy**: Talk about the CORS and WebSocket authentication challenges. Explain how strict security configurations crashed the API when credentials were allowed with wildcard origins, and how you fixed it by explicitly defining allowed origins and securely passing tokens to the WebSocket connection.

**9. Why did you use Zustand instead of Redux for state management?**
* **Answer Strategy**: Zustand provides a much simpler, boilerplate-free global state that is perfect for real-time applications. Redux would have been overkill and slower to iterate with during a fast-paced hackathon.

**10. What is the next feature you would build if you had another week?**
* **Answer Strategy**: (Pick one): Integrating predictive maintenance (predicting when a transformer will blow due to overload), adding a mobile app view for on-site line inspectors, or integrating actual hardware (like an ESP32 microcontroller) to send physical sensor data.

---

## 💼 Advanced & Business-Focused Questions

**11. How is GridGuard AI different from traditional SCADA systems already used by power grids?**
* **Answer Strategy**: SCADA systems are legacy, rule-based, and highly localized. GridGuard AI is a cloud-native, modern platform that uses **Machine Learning** to find hidden patterns that rules miss, and it provides real-time WebSockets to a web dashboard accessible anywhere, rather than being locked to a control room.

**12. What is the business model? How would you monetize this?**
* **Answer Strategy**: It is a **B2B SaaS (Software as a Service)** model targeted at DISCOMs (Distribution Companies) and government energy boards. We would charge a subscription fee based on the number of nodes (smart meters/transformers) monitored, plus a percentage of the revenue recovered from stopped theft.

**13. How do you handle false positives? What if a spike is just a legitimate power surge?**
* **Answer Strategy**: The AI provides a **Confidence Score** (e.g., 92%) rather than making binary decisions. We use a **Human-in-the-Loop** approach: the system flags the anomaly and routes it to the "Inspector Worklist". An operator reviews it and dispatches a crew to verify physically before taking drastic action like cutting power.

**14. Smart meter data can reveal when people are home or on vacation. How do you handle Data Privacy?**
* **Answer Strategy**: The system relies on **Data Anonymization**. We don't need to know the customer's name to detect theft; we only track the `meter_id` and energy consumption. PII (Personally Identifiable Information) is masked, and the AI primarily looks at the aggregate delta at the transformer level.

**15. What happens if a smart meter is physically broken or tampered with so it sends NO data?**
* **Answer Strategy**: The AI is trained to recognize a sudden drop to 0 kWh while the connected transformer still shows load as a specific anomaly type called **"Meter Freeze / Flatline"**. A total loss of signal is treated as a high-severity alert rather than just "zero consumption".

**16. How difficult is it for a traditional, old-school power company to adopt this?**
* **Answer Strategy**: Very easy. It doesn't require ripping out their existing infrastructure. GridGuard sits on top of their existing AMI (Advanced Metering Infrastructure). As long as their meters can export CSVs or hit a REST API, we can ingest their data. 

**17. What if the internet goes down at the substation?**
* **Answer Strategy**: Currently, it relies on cloud connectivity. However, the future roadmap includes **Edge Computing**. We can deploy the lightweight XGBoost model directly onto an edge device (like a Raspberry Pi or industrial IPC) at the substation so it can detect theft locally and sync to the cloud once the connection is restored.
