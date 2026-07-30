# Domain C: AIML - 24-Hour Hackathon Phase Breakdown

## Timeline Overview
Developer 3 is responsible for building the PyTorch LSTM Autoencoder, PyTorch Geometric GNN, Synthetic Theft Generator, SHAP Explainability Engine, and Inference Pipeline.

```
Hours 0-2  : Data Processing, Feature Engineering & Synthetic Theft Injector
Hours 2-6  : PyTorch LSTM Autoencoder Architecture & Baseline Training
Hours 6-10 : PyTorch Geometric GNN & Line Loss Topology Model
Hours 10-14: Risk Fusion Ensemble Engine & Threshold Calibration
Hours 14-17: SHAP Explainability Pipeline & Reasoning Generator
Hours 17-20: Unified `InferenceEngine` Wrapper & Backend Bridge Wireup
Hours 20-22: Hackathon Theft Simulation Scenario Suite
Hours 22-24: Performance Tuning, Unit Testing & Final Model Lock
```

---

## Detailed Hour-by-Hour Phase Plan

### Phase 1: Data Pipeline & Theft Generator (Hours 0 – 2)
- **Hour 0.0 - 1.0**: Build data preprocessor (`data/preprocessor.py`). Create 24-hour sliding window tensor builder and MinMax scaler.
- **Hour 1.0 - 2.0**: Build Synthetic Theft Injector (`generators/synthetic_theft.py`). Implement functions for `PARTIAL_BYPASS`, `METER_FREEZE`, `DIRECT_HOOKING`, and `PHASE_IMBALANCE`.

### Phase 2: Temporal LSTM Autoencoder (Hours 2 – 6)
- **Hour 2.0 - 3.5**: Write PyTorch `TemporalAutoencoder` architecture (`models/lstm_autoencoder.py`) with 2-layer LSTM Encoder and Decoder.
- **Hour 3.5 - 5.0**: Train model on normal baseline telemetry data (50 epochs, Adam optimizer, MSE loss).
- **Hour 5.0 - 6.0**: Calculate reconstruction error distribution. Set anomaly threshold at 95th percentile. Save model weights to `aiml/weights/lstm_autoencoder_v1.pt`.

### Phase 3: Grid Intelligence GNN (Hours 6 – 10)
- **Hour 6.0 - 8.0**: Construct PyTorch Geometric graph builder (`generators/graph_builder.py`). Map Substation -> Feeder -> Transformer -> Meter topology into `x` feature tensors and `edge_index` adjacency matrices.
- **Hour 8.0 - 10.0**: Implement `GridGraphSAGE` PyTorch Geometric model. Train on spatial grid loss dataset. Export state dict to `aiml/weights/gnn_graphsage_v1.pt`.

### Phase 4: Risk Fusion Ensemble (Hours 10 – 14)
- **Hour 10.0 - 12.0**: Build `RiskFusionEngine` (`models/risk_fusion.py`). Implement weighted ensemble algorithm ($0.55 \times \text{LSTM} + 0.45 \times \text{GNN}$).
- **Hour 12.0 - 14.0**: Calibrate risk score probabilities ($0.0$ to $1.0$). Verify precision and recall on synthetic theft evaluation benchmark.

### Phase 5: SHAP Explainability Engine (Hours 14 – 17)
- **Hour 14.0 - 15.5**: Integrate `shap` library (`explainability/shap_explainer.py`). Build `KernelExplainer` / `TreeExplainer` wrapper.
- **Hour 15.5 - 17.0**: Write human-readable AI summary generator that converts top SHAP values into clean natural-language sentences.

### Phase 6: Unified Inference Engine & Backend Bridge (Hours 17 – 20)
- **Hour 17.0 - 18.5**: Build `InferenceEngine` wrapper (`pipeline/inference_engine.py`) exposing clean single-meter and batch graph evaluation methods.
- **Hour 18.5 - 20.0**: Connect `InferenceEngine` to Backend (Domain B) `AIMLBridge` service module. Verify Python module imports and return formats.

### Phase 7: Simulation Scenario Testing (Hours 20 – 22)
- **Hour 20.0 - 21.0**: Test all 4 hackathon theft simulation scenarios. Verify that triggering `PARTIAL_BYPASS` instantly raises meter risk score to > 0.85 and outputs matching SHAP contributions.
- **Hour 21.0 - 22.0**: Benchmarking: Measure latency (< 30ms target) and RAM usage.

### Phase 8: Final Lock & Verification (Hours 22 – 24)
- **Hour 22.0 - 23.0**: Run unit test suite (`pytest aiml/tests/`). Ensure all test cases pass cleanly.
- **Hour 23.0 - 24.0**: Lock ML model weight files and document AI model confidence metrics for presentation deck.
