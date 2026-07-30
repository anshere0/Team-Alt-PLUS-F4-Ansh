# Domain C: AIML - Cross Domain Integration Specifications

## 1. Inter-Domain Dependencies & Input/Output Formats
Domain C acts as the intelligence provider:
- **Exposes to Domain B (Backend)**: Standardized Python `InferenceEngine` class and REST/gRPC helper functions for predicting meter risk and generating SHAP explainability cards.
- **Drives Domain A (Frontend)**: Data formats for SHAP waterfall charts (`shap_contributions`), risk score gauges (`risk_score`), and anomaly type pill badges.
- **Packaged by Domain D (DevOps)**: Pre-trained PyTorch weight files (`.pt`), Scikit-Learn scaler pickles (`.pkl`), and Python requirements (`torch`, `torch-geometric`, `shap`, `scikit-learn`).

---

## 2. In-Process Python Interface Schema

Backend (Domain B) invokes Domain C via `pipeline.inference_engine.InferenceEngine`:

```python
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class TelemetryWindowInput:
    meter_id: str
    active_power_kwh: List[float] # 24 hourly floats
    voltage_v: List[float]       # 24 hourly floats
    current_a: List[float]       # 24 hourly floats
    temperature_c: List[float]   # 24 hourly floats
    transformer_id: str

@dataclass
class ShapItem:
    feature_name: str
    feature_value: Any
    shap_score: float
    description: str

@dataclass
class ModelInferenceResult:
    meter_id: str
    risk_score: float             # 0.00 to 1.00
    is_anomaly: bool              # True if risk_score >= 0.75
    anomaly_type: str             # 'NORMAL' | 'PARTIAL_BYPASS' | 'METER_FREEZE' | 'DIRECT_HOOKING' | 'PHASE_IMBALANCE'
    ai_summary: str
    shap_contributions: List[ShapItem]

class InferenceEngine:
    def __init__(self, weights_path: str = "./aiml/weights"):
        # Loads pre-trained PyTorch models & scalers into RAM
        ...

    def predict_single_meter(self, input_data: TelemetryWindowInput) -> ModelInferenceResult:
        """Runs LSTM Autoencoder + GNN + SHAP pipeline for a single meter."""
        ...

    def simulate_scenario(self, scenario: str, meter_id: str) -> ModelInferenceResult:
        """Injects synthetic theft distortion and runs inference immediately."""
        ...
```

---

## 3. Synthetic Data Injector Parameters

When Backend triggers a theft simulation, Domain C's `SyntheticTheftGenerator` transforms clean telemetry reading vectors using the following rules:

1. **`PARTIAL_BYPASS`**:
   - `active_power_kwh[18:22] *= random.uniform(0.15, 0.35)`
   - `voltage_v` and `temperature_c` remain unaltered.
   - Resulting SHAP: High positive attribution for `evening_consumption_drop`.

2. **`METER_FREEZE`**:
   - `active_power_kwh[:] = active_power_kwh[0]` (Zero variance flatline).
   - Resulting SHAP: High positive attribution for `meter_freeze_variance`.

3. **`DIRECT_HOOKING`**:
   - Meter active power remains unchanged.
   - Associated transformer secondary load increases by `+35%`.
   - Resulting SHAP: High positive attribution for `transformer_unmetered_loss_delta`.

---

## 4. Dependencies & Model Weight Artifacts (`aiml/weights/`)
- `lstm_autoencoder_v1.pt` (PyTorch state dict - 4.2 MB)
- `gnn_graphsage_v1.pt` (PyTorch Geometric state dict - 1.8 MB)
- `minmax_scaler.pkl` (Scikit-Learn feature scaler - 12 KB)
- `model_metadata.json` (Versioning, accuracy, precision/recall metrics)
