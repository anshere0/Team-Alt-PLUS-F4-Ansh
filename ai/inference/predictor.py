import json
import os
from typing import Any

import joblib
import numpy as np
import shap


class InferencePredictor:
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance._initialize(*args, **kwargs)
        return cls._instance
        
    def _initialize(self, model_dir: str = "models"):
        """Load model, scaler, and metadata once on startup."""
        self.model_path = os.path.join(model_dir, "rf_baseline_v1.pkl")
        self.scaler_path = os.path.join(model_dir, "minmax_scaler.pkl")
        self.metadata_path = os.path.join(model_dir, "model_metadata.json")
        
        try:
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            
            with open(self.metadata_path, "r") as f:
                self.metadata = json.load(f)
                
            self.feature_names = self.metadata.get("features", [])
            self.explainer = shap.TreeExplainer(self.model)
            
            # Load forecaster
            self.forecaster_model_path = os.path.join(model_dir, "rf_forecaster_v1.pkl")
            self.forecaster_scaler_path = os.path.join(model_dir, "forecaster_scaler.pkl")
            self.forecaster_metadata_path = os.path.join(model_dir, "forecaster_metadata.json")
            
            self.forecaster = joblib.load(self.forecaster_model_path)
            self.forecaster_scaler = joblib.load(self.forecaster_scaler_path)
            
            with open(self.forecaster_metadata_path, "r") as f:
                self.forecaster_metadata = json.load(f)
                
            self.forecaster_explainer = shap.TreeExplainer(self.forecaster)
            
            self.is_ready = True
        except Exception as e:
            print(f"Failed to initialize predictor: {e}")
            self.is_ready = False
            
    def _generate_human_readable_desc(self, feature_name: str, value: float, shap_score: float) -> str:
        impact = "increases" if shap_score > 0 else "decreases"
        if feature_name == "currentLoad":
            return f"Current load of {value:.2f} {impact} the risk score."
        if feature_name == "temperature":
            return f"Temperature of {value:.1f}°C {impact} the risk score."
        if feature_name == "humidity":
            return f"Humidity of {value:.1f}% {impact} the risk score."
        return f"{feature_name} value of {value:.2f} {impact} the risk score."

    def predict(self, extracted_features: np.ndarray) -> dict[str, Any]:
        """Runs the model and SHAP explainer on a single sample."""
        if not self.is_ready:
            raise RuntimeError("Model is not loaded.")
            
        # Scale features
        scaled_features = self.scaler.transform(extracted_features.reshape(1, -1))
        
        # Predict probability
        # Index 1 is the probability of anomaly
        probabilities = self.model.predict_proba(scaled_features)[0]
        confidence = float(probabilities[1])
        
        prediction = confidence
        risk_level = "HIGH" if confidence > 0.75 else "MEDIUM" if confidence > 0.4 else "LOW"
        
        # SHAP Explainability
        shap_values = self.explainer.shap_values(scaled_features)
        
        # In shap < 0.40 for classification it returns a list of arrays (one per class)
        # In newer versions it might return a 3D array (n_samples, n_features, n_classes)
        if isinstance(shap_values, list):
            class_1_shap = shap_values[1][0]
        else:
            if shap_values.ndim == 3:
                class_1_shap = shap_values[0, :, 1]
            else:
                class_1_shap = shap_values[0]
                
        explanations = []
        for name, val, score in zip(self.feature_names, extracted_features, class_1_shap):
            if abs(score) > 0.05: # Only include significant factors
                explanations.append({
                    "feature_name": name,
                    "feature_value": float(val),
                    "shap_score": float(score),
                    "description": self._generate_human_readable_desc(name, val, score)
                })
                
        # Sort by impact
        explanations = sorted(explanations, key=lambda x: abs(x["shap_score"]), reverse=True)
        # Extract just descriptions for the API contract
        explanation_strings = [item["description"] for item in explanations[:3]]
        
        if not explanation_strings:
            explanation_strings = ["Normal usage patterns detected."]
            
        return {
            "prediction": prediction,
            "confidence": confidence,
            "riskLevel": risk_level,
            "modelVersion": self.metadata.get("version", "unknown"),
            "explanation": explanation_strings
        }

    def predict_load(self, extracted_features: np.ndarray) -> dict[str, Any]:
        """Runs the load forecaster and SHAP explainer."""
        if not self.is_ready:
            raise RuntimeError("Model is not loaded.")
            
        scaled_features = self.forecaster_scaler.transform(extracted_features.reshape(1, -1))
        
        # Predict load
        prediction = float(self.forecaster.predict(scaled_features)[0])
        
        # SHAP Explainability for forecaster
        shap_values = self.forecaster_explainer.shap_values(scaled_features)
        
        # For regression, shap_values is typically a 2D array (n_samples, n_features)
        if isinstance(shap_values, list):
            load_shap = shap_values[0][0]
        else:
            if shap_values.ndim == 2:
                load_shap = shap_values[0]
            else:
                load_shap = shap_values[0, :, 0] if shap_values.ndim == 3 else shap_values[0]
                
        explanations = []
        for name, val, score in zip(self.feature_names, extracted_features, load_shap):
            if abs(score) > 0.5: # Only include significant factors for load
                impact = "increases" if score > 0 else "decreases"
                explanations.append({
                    "feature_name": name,
                    "feature_value": float(val),
                    "shap_score": float(score),
                    "description": f"{name} of {val:.2f} {impact} the forecasted load."
                })
                
        explanations = sorted(explanations, key=lambda x: abs(x["shap_score"]), reverse=True)
        explanation_strings = [item["description"] for item in explanations[:3]]
        
        if not explanation_strings:
            explanation_strings = ["Load aligns with average baseline."]
            
        # For regression, confidence isn't natively a probability. We'll set a standard high confidence
        # assuming the inputs are within normal ranges.
        return {
            "prediction": prediction,
            "confidence": 0.90, # Default high confidence for forecaster
            "riskLevel": "LOW", # Not applicable for load forecast, but kept for schema consistency
            "modelVersion": self.forecaster_metadata.get("version", "unknown"),
            "explanation": explanation_strings
        }
