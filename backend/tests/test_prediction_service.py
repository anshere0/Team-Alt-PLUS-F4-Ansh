import pytest
from app.services.prediction_service import PredictionService

@pytest.mark.asyncio
async def test_prediction_service_anomalous_data():
    """
    Test that the PredictionService correctly identifies mathematically anomalous
    data based on its Isolation Forest model.
    """
    service = PredictionService()
    
    # Simulate a meter drawing an impossible amount of current while voltage drops heavily
    # This represents a classic theft/bypass signature.
    anomalous_reading = {
        "voltage": 180.5, # Huge drop
        "current": 45.2,  # Massive spike
        "power_factor": 0.5,
        "temperature": 75.0,
        "thd": 15.0
    }
    
    prediction = await service.predict_load("test-meter", anomalous_reading)
    
    # The anomaly score should be high (closer to 1.0)
    assert prediction["risk_score"] > 0.70
    assert prediction["is_anomaly"] is True
    assert prediction["anomaly_type"] in ["BYPASS", "TAMPERING"]

@pytest.mark.asyncio
async def test_prediction_service_normal_data():
    """
    Test that the PredictionService does NOT flag perfectly normal telemetry.
    """
    service = PredictionService()
    
    # Simulate a perfectly healthy meter
    normal_reading = {
        "voltage": 230.1,
        "current": 5.2,
        "power_factor": 0.98,
        "temperature": 35.0,
        "thd": 2.1
    }
    
    prediction = await service.predict_load("test-meter", normal_reading)
    
    # The anomaly score should be low
    assert prediction["risk_score"] < 0.50
    assert prediction["is_anomaly"] is False
    assert prediction["anomaly_type"] == "NORMAL"
