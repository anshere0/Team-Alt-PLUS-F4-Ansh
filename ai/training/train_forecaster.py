import os
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from datasets.synthetic_load import generate_load_forecast_dataset
from preprocessing.preprocessing import FeaturePreprocessor
import json

def train_forecaster_model():
    print("Generating synthetic load dataset...")
    df = generate_load_forecast_dataset()
    
    print("Extracting features and scaling...")
    os.makedirs("models", exist_ok=True)
    # Re-use the same scaling mechanism but separate scaler if necessary
    # Or just rely on the fact that random forest doesn't strictly need scaling for prediction accuracy
    # But for SHAP and consistency we'll use a new scaler for this task
    scaler_path = "models/forecaster_scaler.pkl"
    preprocessor = FeaturePreprocessor(scaler_path=scaler_path)
    
    # We can just manually extract X, y
    import numpy as np
    X = []
    y = []
    for _, row in df.iterrows():
        features = preprocessor.extract_features(row["currentLoad"], row["temperature"], row["humidity"])
        X.append(features)
        y.append(row["target_load"])
        
    X = np.array(X)
    y = np.array(y)
    
    # Fit scaler
    X_scaled = preprocessor.scaler.fit_transform(X)
    joblib.dump(preprocessor.scaler, scaler_path)
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_scaled, y)
    
    # Evaluate
    y_pred = model.predict(X_scaled)
    mae = mean_absolute_error(y, y_pred)
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    r2 = r2_score(y, y_pred)
    
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R2 Score: {r2:.4f}")
    
    # Save model
    model_path = "models/rf_forecaster_v1.pkl"
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    # Save metadata
    metadata = {
        "version": "v1.0.0",
        "mae": float(mae),
        "rmse": float(rmse),
        "r2": float(r2),
        "features": preprocessor.feature_names
    }
    with open("models/forecaster_metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
if __name__ == "__main__":
    train_forecaster_model()
