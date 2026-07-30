# Domain C: AIML - Product Requirements Document (PRD)

## 1. Executive Summary & Machine Learning Vision
Domain C powers the intelligent core of GridGuard. Electricity theft and Non-Technical Losses (NTL) manifest in complex spatial-temporal patterns that basic threshold rules fail to catch. Domain C delivers a **Dual-Engine AI System**:
1. **Temporal AI (LSTM Autoencoder)**: Detects subtle time-series anomalies, meter freezes, partial bypasses, and evening consumption drops at the individual consumer level.
2. **Grid Intelligence AI (Graph Neural Network - PyTorch Geometric / NetworkX)**: Analyzes spatial energy conservation equations across physical grid topology nodes (Substation -> Feeders -> Transformers -> Meters) to detect unmetered line taps and phase imbalances.
3. **Risk Fusion & Explainability (SHAP)**: Combines Temporal + Graph anomaly scores into a unified risk probability index (`0.0` - `1.0`) and extracts exact SHAP feature importance vectors to explain predictions to human inspectors.
4. **Synthetic Theft Generator**: Generates realistic smart meter telemetry anomalies for hackathon testing and live demo simulation.

---

## 2. Key Model Requirements & Technical Specifications

### 2.1 Model 1: Temporal LSTM Autoencoder (Time-Series Anomaly Detection)
- **Input Feature Vector**: 24-hour sliding window of hourly readings per meter:
  - `active_power_kwh`
  - `voltage_v`
  - `current_a`
  - `power_factor`
  - `ambient_temperature_c`
- **Architecture**:
  - Encoder: 2-layer LSTM (Hidden size: 64 -> 32).
  - Bottleneck: 16-dim latent space representation.
  - Decoder: 2-layer LSTM (Hidden size: 32 -> 64) reconstructing original 24-hour sequence.
- **Anomaly Score**: Mean Squared Error (MSE) reconstruction loss between actual input $X$ and reconstructed $\hat{X}$:
  $$\text{Reconstruction Error} = \frac{1}{N} \sum_{i=1}^N (X_i - \hat{X}_i)^2$$
- **Thresholding**: Dynamic threshold set at 95th percentile of normal baseline reconstruction errors.

### 2.2 Model 2: Grid Intelligence GNN (Spatial Topology & Line Loss Detection)
- **Graph Topology Representation**:
  - Vertices $V$: Grid nodes (Substations, Feeders, Transformers, Meters).
  - Edges $E$: Physical power line connections.
- **Node Feature Matrix**:
  - Meter Nodes: Summed 24h consumption, nominal load.
  - Transformer Nodes: Measured secondary output power, connected consumer count.
- **Architecture**: PyTorch Geometric GraphSAGE / GCN layer propagating node embeddings across neighborhood hops:
  $$h_v^{(k)} = \sigma \left( W \cdot \text{MEAN} \left( \{h_v^{(k-1)}\} \cup \{h_u^{(k-1)}, \forall u \in \mathcal{N}(v)\} \right) \right)$$
- **Output**: Unmetered energy loss probability per distribution transformer.

### 2.3 Risk Fusion Engine & SHAP Explainability
- **Ensemble Fusion Formula**:
  $$\text{Final Risk Score} = 0.55 \times \text{LSTM\_Score} + 0.45 \times \text{GNN\_Score}$$
- **SHAP TreeExplainer / KernelExplainer**:
  - Calculates Shapley values for input features: `evening_consumption_drop`, `phase_imbalance_ratio`, `temperature_correlation`, `meter_freeze_variance`.
  - Outputs top 3 features contributing positively or negatively to the anomaly score.

### 2.4 Synthetic Theft Simulation Generator
Generates realistic telemetry distortions on demand:
1. `PARTIAL_BYPASS`: Drops consumption by 50% - 80% during peak hours (18:00 - 22:00) while keeping temperature & voltage constant.
2. `METER_FREEZE`: Locks `active_power_kwh` to a constant flatline value (e.g. `0.12 kWh`) regardless of load shifts.
3. `DIRECT_HOOKING`: Transformer load spikes by +35% while downstream meter readings remain static.
4. `PHASE_IMBALANCE`: Distorts 3-phase current readings across neighboring meters.

---

## 3. SLA & Performance Benchmarks
- **Inference Latency**: `< 30ms` per single meter evaluation; `< 150ms` for full graph batch evaluation (500 meters + 48 transformers).
- **Model Accuracy**: Precision@K >= 92% on synthetic theft test sets.
- **Memory Footprint**: Total PyTorch model weight size `< 50MB` for lightweight deployment in hackathon containers.
