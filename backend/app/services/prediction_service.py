import logging
import numpy as np
from sklearn.ensemble import IsolationForest
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.schemas.predict import (
    PredictionResponse,
    PredictLoadRequest,
    PredictRiskRequest,
)

logger = logging.getLogger(__name__)

class PredictionService:
    def __init__(self):
        # Initialize an IsolationForest model for anomaly detection.
        # In a real enterprise system, this model would be trained offline and loaded via joblib/pickle.
        self.anomaly_model = IsolationForest(
            n_estimators=100, 
            contamination=0.05, 
            random_state=42
        )
        
        # Fit with some baseline nominal data (Voltage ~230, Current ~10, PF ~0.95)
        # to establish the "normal" manifold.
        baseline_data = np.array([
            [230 + np.random.normal(0, 5), 10 + np.random.normal(0, 2), 0.95 + np.random.normal(0, 0.02)]
            for _ in range(500)
        ])
        self.anomaly_model.fit(baseline_data)

    async def predict_risk(self, request: PredictRiskRequest, db: AsyncSession) -> PredictionResponse:
        # Extract features for prediction
        # Assume request payload has these fields, or we use defaults if missing
        voltage = getattr(request, 'voltage_v', 230.0)
        current = getattr(request, 'current_a', 10.0)
        power_factor = getattr(request, 'power_factor', 0.95)

        features = np.array([[voltage, current, power_factor]])
        
        # Predict: 1 for normal, -1 for anomaly
        prediction = self.anomaly_model.predict(features)[0]
        # Score: negative is anomaly, positive is normal. We normalize it to a 0-1 risk score.
        score = self.anomaly_model.decision_function(features)[0]
        
        # Map decision score to risk (0.0 to 1.0)
        # A lower score means a higher anomaly risk.
        risk_score = min(max(0.5 - (score * 5), 0.0), 1.0)
        confidence = min(max(abs(score) * 2, 0.5), 0.99)
        
        if risk_score > 0.8:
            risk_level = "CRITICAL"
            explanation = "Severe anomaly detected (e.g., massive voltage drop or current spike indicating bypass)."
        elif risk_score > 0.5:
            risk_level = "HIGH"
            explanation = "Significant deviation from expected power factor."
        elif risk_score > 0.3:
            risk_level = "MEDIUM"
            explanation = "Minor fluctuation detected."
        else:
            risk_level = "LOW"
            explanation = "Telemetry falls within nominal operating manifold."

        pred_response = PredictionResponse(
            prediction=risk_score,
            confidence=confidence,
            riskLevel=risk_level,
            modelVersion="isolation-forest-v1",
            explanation=[explanation]
        )
            
        # Log to repository
        from app.repositories.prediction_repo import prediction_repo, PredictionCreate
        await prediction_repo.create(db, obj_in=PredictionCreate(
            meter_id=request.gridId,
            timestamp=request.timestamp,
            risk_score=pred_response.prediction,
            confidence=pred_response.confidence,
            anomaly_type=pred_response.riskLevel,
            financial_loss_estimate=1000 * pred_response.prediction
        ))
        
        return pred_response

    async def predict_load(self, request: PredictLoadRequest, db: AsyncSession) -> PredictionResponse:
        # For Phase 5, we use a simple heuristic for load prediction based on time of day
        # In the future, this would be a Time-Series forecasting model (e.g. ARIMA, Prophet, or LSTM).
        hour = request.timestamp.hour
        base_load = 50.0 # kW
        if 8 <= hour <= 18:
            base_load += 100.0 # Peak hours
        
        predicted_load = base_load + np.random.normal(0, 10)
        
        pred_response = PredictionResponse(
            prediction=predicted_load,
            confidence=0.85,
            riskLevel="LOW",
            modelVersion="heuristic-v1",
            explanation=["Load predicted using temporal hour-of-day heuristic."]
        )
            
        from app.repositories.prediction_repo import prediction_repo, PredictionCreate
        await prediction_repo.create(db, obj_in=PredictionCreate(
            meter_id=request.gridId,
            timestamp=request.timestamp,
            predicted_load_kw=pred_response.prediction,
            confidence=pred_response.confidence
        ))
        return pred_response

prediction_service = PredictionService()
