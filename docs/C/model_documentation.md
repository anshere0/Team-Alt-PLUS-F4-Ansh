# GridGuard AI - Model Documentation

This document provides a technical overview of the machine learning models deployed in Domain C.

## 1. Risk & Anomaly Detection Model (Theft Detection)
**Purpose:** Identify instances of power theft, bypasses, or faulty meters.
**Algorithm:** Random Forest Classifier (Scikit-Learn)

### Data Pipeline
1. **Feature Preprocessing**: Input variables (`currentLoad`, `temperature`, `humidity`) are mapped into a structured numpy array.
2. **Scaling**: A `MinMaxScaler` is applied to normalize the features between `0` and `1`. This prevents temperature (e.g., 35.0) from outweighing load (e.g., 10.0) mathematically.
3. **Training**: The model is trained on a synthetic dataset containing 3,400 normal readings and 600 anomalous readings representing partial bypasses (sudden unnatural drops in load) and direct hooking (massive unnatural spikes).

### Prediction & Explainability
When a prediction is requested:
1. The Random Forest outputs a probability score between `0.0` and `1.0`.
2. A threshold of `0.75` determines the `riskLevel` (Scores > 0.75 are labeled `HIGH`).
3. **SHAP (SHapley Additive exPlanations)**: The `shap.TreeExplainer` inspects the Random Forest's decision tree paths to determine *why* a specific prediction was made. It assigns an attribution score to each feature. If a feature heavily swings the score towards anomaly, SHAP generates a localized text explanation (e.g., *"Current load of 15.0 increases the risk score."*).

---

## 2. Load Forecasting Engine
**Purpose:** Predict the power demand of a specific grid node in the next hour.
**Algorithm:** Random Forest Regressor (Scikit-Learn)

### Data Pipeline
1. **Synthetic Load Generation**: Generates 4,000 historical samples simulating daily power consumption cycles heavily influenced by ambient temperature (e.g., AC usage spikes when temp > 30C).
2. **Training**: The regressor learns the continuous mapping between the current state variables and the expected future `target_load`.
3. **Performance**: Achieves high R-squared metrics (`R2 > 0.98`) due to the clean relationships between temperature and power draw in the synthetic data.

---

## 3. Grid Intelligence (Graph Neural Network) - MVP Stage
**Purpose:** Detect localized line losses and physical topology anomalies (Phase 3).
**Algorithm:** GraphSAGE (PyTorch Geometric)

### Architecture
- **Topology Representation**: Physical entities (Substations, Transformers, Smart Meters) are modeled as nodes in a graph. Physical wiring is modeled as edges connecting the nodes.
- **Message Passing**: The `GridGraphSAGE` architecture utilizes two SAGEConv layers. Instead of looking at a smart meter in isolation, the GNN aggregates features from neighboring meters and transformers.
- **Theft Detection**: By comparing a meter's load to its neighbors on the same transformer, the GNN can identify localized theft (e.g., one meter reading near zero while its 9 neighbors on the same transformer show normal load).
- **Status**: The model has been successfully built and trained (`ai/training/train_gnn.py`) achieving 100% accuracy on synthetic topological data. It is currently available as a `.pt` weight file awaiting integration into a future API endpoint.
