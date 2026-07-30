import pytest
from fastapi.testclient import TestClient

from api.main import app
from inference.predictor import InferencePredictor

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_predictor():
    # Ensure predictor is initialized before tests
    InferencePredictor(model_dir="models")

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_ready():
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}

def test_predict_risk_normal():
    payload = {
        "gridId": "IND-001",
        "currentLoad": 50.5,
        "temperature": 25.0,
        "humidity": 60.0,
        "timestamp": "2026-07-30T12:00:00Z"
    }
    response = client.post("/predict/risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 1.0
    assert data["riskLevel"] in ["LOW", "MEDIUM", "HIGH"]
    assert "explanation" in data

def test_predict_risk_anomaly():
    payload = {
        "gridId": "IND-002",
        "currentLoad": 15.0,  # Massive drop indicating bypass
        "temperature": 34.1,
        "humidity": 62.0,
        "timestamp": "2026-07-30T12:00:00Z"
    }
    response = client.post("/predict/risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["riskLevel"] == "HIGH"
    assert "explanation" in data
    assert len(data["explanation"]) > 0

def test_predict_load():
    payload = {
        "gridId": "IND-003",
        "currentLoad": 76.2,
        "temperature": 34.1,
        "humidity": 62.0,
        "timestamp": "2026-07-30T12:00:00Z"
    }
    response = client.post("/predict/load", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert data["prediction"] > 0
    assert "explanation" in data
