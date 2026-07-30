from fastapi import FastAPI
from api.routes import router
from inference.predictor import InferencePredictor

app = FastAPI(
    title="GridGuard AI Inference Service",
    description="Domain C: AI/ML Inference Service for GridGuard",
    version="1.0.0",
)

@app.on_event("startup")
async def startup_event():
    # Initialize singleton predictor
    InferencePredictor(model_dir="models")

app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/ready")
async def ready():
    predictor = InferencePredictor()
    if predictor.is_ready:
        return {"status": "ready"}
    return {"status": "not_ready"}, 503

@app.get("/version")
async def version():
    return {"version": app.version}
