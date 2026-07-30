import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import joblib
from typing import Tuple

class FeaturePreprocessor:
    def __init__(self, scaler_path: str = None):
        self.scaler = MinMaxScaler()
        self.scaler_path = scaler_path
        self.feature_names = ["currentLoad", "temperature", "humidity"]

    def extract_features(self, load: float, temp: float, humidity: float) -> np.ndarray:
        """Extracts features from the JSON request."""
        features = np.array([load, temp, humidity])
        return np.nan_to_num(features, nan=0.0, posinf=0.0, neginf=0.0)

    def fit_transform_df(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        X = []
        y = []
        
        for _, row in df.iterrows():
            features = self.extract_features(row["currentLoad"], row["temperature"], row["humidity"])
            X.append(features)
            y.append(row["is_anomaly"])
            
        X = np.array(X)
        y = np.array(y)
        
        X_scaled = self.scaler.fit_transform(X)
        
        if self.scaler_path:
            joblib.dump(self.scaler, self.scaler_path)
            
        return X_scaled, y
        
    def transform_single(self, load: float, temp: float, humidity: float) -> np.ndarray:
        if not hasattr(self.scaler, "scale_"):
            if self.scaler_path:
                self.scaler = joblib.load(self.scaler_path)
            else:
                raise ValueError("Scaler is not fitted yet.")
                
        features = self.extract_features(load, temp, humidity)
        features_scaled = self.scaler.transform(features.reshape(1, -1))
        return features_scaled[0]
