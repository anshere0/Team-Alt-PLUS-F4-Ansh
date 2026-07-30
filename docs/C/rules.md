# Domain C: AIML - Code Conventions & Domain Rules

## 1. PyTorch & Machine Learning Coding Standards
- **Explicit Tensor Shapes**: Include shape comments after tensor transformations (e.g., `# x shape: (batch_size, seq_len, num_features)`).
- **Evaluation Mode Strictness**: Always wrap inference calls inside `with torch.no_grad():` and call `model.eval()` to avoid memory leaks.
- **Device Agnostic Execution**: Ensure code detects CPU vs. GPU dynamically (`device = torch.device("cuda" if torch.cuda.is_available() else "cpu")`).

## 2. Model Performance & Latency Constraints
- **Inference SLA**: Single-meter prediction must execute in `< 30ms`.
- **Pre-loaded Model Weights**: Never load PyTorch weights from disk on every incoming HTTP request; load once in memory during module initialization.

## 3. Data Preprocessing & Validation
- **No Data Leakage**: Scalers and normalizers MUST be fitted only on training data, never on validation/test evaluation sequences.
- **Nan / Inf Guard**: Always sanitize telemetry inputs with `np.nan_to_num(x, nan=0.0)` before passing to neural network models.

## 4. Explainability & SHAP Output Formatting
- **Standardized SHAP Schema**: Every SHAP explanation output MUST return a list of dictionaries with key fields: `feature_name`, `feature_value`, `shap_score`, and `description`.
