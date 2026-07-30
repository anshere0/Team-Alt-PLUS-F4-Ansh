# Domain C: AIML - Memory & Context Management Plan

## 1. Model Memory Optimization & RAM Footprint

### 1.1 Model Weights & Lazy Singleton Loading
- Both `TemporalAutoencoder` and `GridGraphSAGE` models are loaded into RAM once as singleton instances inside `InferenceEngine.__init__()`.
- Model evaluation mode is enforced (`model.eval()`, `torch.no_grad()`) during all REST/WebSocket inference requests to prevent gradient memory accumulation in PyTorch autograd graph.

### 1.2 Graph Adjacency Matrix Cache
- The grid topology graph (500 meters, 48 transformers) is stored in memory as a NetworkX Graph and PyTorch Geometric `edge_index` tensor.
- Re-building the adjacency matrix happens only on explicit grid topology structural updates (`POST /api/v1/topology/update`), avoiding CPU overhead during inference ticks.

### 1.3 Memory Leak Prevention in SHAP
- SHAP background sampling can create large temporary numpy arrays. The explainer caps background baseline samples to `N=50` to maintain lightweight memory consumption (< 200MB RAM).

---

## 2. Antigravity Vibe Coding Context Memory Rules (For Dev 3)

When developing ML scripts with Antigravity AI agents, follow these memory retention rules:

1. **Seed Reproducibility Lock (`config/seed.py`)**:
   - Set random seeds for NumPy, PyTorch, and Python random (`torch.manual_seed(42)`, `np.random.seed(42)`).
   - This ensures synthetic data generation and model outputs are 100% deterministic during live hackathon demos.

2. **Pre-Trained Weight Fallback**:
   - Store lightweight pre-trained PyTorch weights (`.pt` files) directly in `aiml/weights/` so the system can run instant inferences without waiting for hours of model training during the hackathon.

3. **Inference Performance Budget**:
   - Single meter inference MUST complete in `< 30ms`.
   - Never run blocking heavy training loops directly inside FastAPI async request threads.
