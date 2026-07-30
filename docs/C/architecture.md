# Domain C: AIML - Architecture Document

## 1. Directory Structure & Pipeline Layout
The AIML directory is structured for clean modularity, allowing fast model prototyping, feature engineering, offline training, and real-time inference execution.

```
aiml/
├── config/
│   └── model_config.yaml     # Hyperparameters, paths, feature lists
├── data/
│   ├── raw/                  # Baseline smart meter datasets
│   └── processed/            # Scaled & tensorized features
├── generators/
│   ├── synthetic_theft.py    # Theft scenario data injector
│   └── graph_builder.py      # NetworkX to PyTorch Geometric graph converter
├── models/
│   ├── lstm_autoencoder.py   # Temporal LSTM PyTorch module
│   ├── gnn_loss_detector.py  # GraphSAGE PyTorch Geometric module
│   └── risk_fusion.py        # Weighted ensemble & thresholding logic
├── explainability/
│   └── shap_explainer.py     # SHAP TreeExplainer & feature attribution
├── pipeline/
│   ├── train_lstm.py         # LSTM Autoencoder training script
│   ├── train_gnn.py          # GNN training script
│   └── inference_engine.py   # Unified inference wrapper for Backend integration
├── weights/                  # Exported PyTorch state dicts (.pt / .onnx)
└── tests/                    # Unit tests for model forward passes & SHAP outputs
```

---

## 2. Model Pipeline & Data Flow Architecture

```
Raw Smart Meter Telemetry (24h) ──► Feature Scaler (MinMax) ──► LSTM Autoencoder ──► Temporal Anomaly Score
                                                                                               │
Physical Grid Topology Data     ──► Graph Adjacency Matrix ──► PyTorch Geometric GNN ──► Spatial Anomaly Score
                                                                                               │
                                                                                               ▼
                                                                                      Risk Fusion Engine
                                                                                               │
                                                                                               ▼
                                                                                     SHAP Explainer Module
                                                                                               │
                                                                                               ▼
                                                                                     InferenceResult JSON
```

---

## 3. Detailed Neural Network Architectures

### 3.1 PyTorch LSTM Autoencoder (`models/lstm_autoencoder.py`)
```python
import torch
import torch.nn as nn

class LSTMEncoder(nn.Module):
    def __init__(self, input_dim=5, hidden_dim=64, latent_dim=16):
        super().__init__()
        self.lstm1 = nn.LSTM(input_dim, hidden_dim, batch_first=True)
        self.lstm2 = nn.LSTM(hidden_dim, latent_dim, batch_first=True)

    def forward(self, x):
        x, _ = self.lstm1(x)
        x, (h_n, _) = self.lstm2(x)
        return h_n[-1] # Latent vector representation

class LSTMDecoder(nn.Module):
    def __init__(self, latent_dim=16, hidden_dim=64, output_dim=5, seq_len=24):
        super().__init__()
        self.seq_len = seq_len
        self.lstm1 = nn.LSTM(latent_dim, hidden_dim, batch_first=True)
        self.lstm2 = nn.LSTM(hidden_dim, output_dim, batch_first=True)

    def forward(self, z):
        z = z.unsqueeze(1).repeat(1, self.seq_len, 1)
        x, _ = self.lstm1(z)
        out, _ = self.lstm2(x)
        return out # Reconstructed 24h sequence

class TemporalAutoencoder(nn.Module):
    def __init__(self, input_dim=5, seq_len=24):
        super().__init__()
        self.encoder = LSTMEncoder(input_dim=input_dim)
        self.decoder = LSTMDecoder(output_dim=input_dim, seq_len=seq_len)

    def forward(self, x):
        z = self.encoder(x)
        reconstructed = self.decoder(z)
        return reconstructed
```

### 3.2 PyTorch Geometric GNN (`models/gnn_loss_detector.py`)
```python
import torch
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv

class GridGraphSAGE(torch.nn.Module):
    def __init__(self, in_channels=4, hidden_channels=32, out_channels=2):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        x = self.conv2(x, edge_index)
        return F.softmax(x, dim=1) # Class 1 = Anomaly / Line Loss
```

---

## 4. SHAP Explainability Architecture (`explainability/shap_explainer.py`)
- Uses `shap.KernelExplainer` or `shap.TreeExplainer` on the fused model outputs.
- Extracts local feature contributions for a flagged meter ID:
  ```python
  def get_shap_explanation(meter_features: np.ndarray, model, feature_names: list) -> list:
      explainer = shap.Explainer(model)
      shap_values = explainer(meter_features)
      
      contributions = []
      for name, val, score in zip(feature_names, meter_features[0], shap_values.values[0]):
          contributions.append({
              "feature_name": name,
              "feature_value": float(val),
              "shap_score": float(score),
              "description": generate_human_readable_desc(name, val, score)
          })
      return sorted(contributions, key=lambda x: abs(x["shap_score"]), reverse=True)
  ```
