import os

import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

from datasets.synthetic_theft import create_training_dataset
from preprocessing.preprocessing import FeaturePreprocessor


def train_baseline_model():
    print("Generating synthetic dataset...")
    df = create_training_dataset()
    
    print("Extracting features and scaling...")
    os.makedirs("models", exist_ok=True)
    scaler_path = "models/minmax_scaler.pkl"
    preprocessor = FeaturePreprocessor(scaler_path=scaler_path)
    
    X, y = preprocessor.fit_transform_df(df)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X, y)
    
    # Evaluate
    y_pred = model.predict(X)
    print(f"Accuracy: {accuracy_score(y, y_pred):.4f}")
    print(f"Precision: {precision_score(y, y_pred):.4f}")
    print(f"Recall: {recall_score(y, y_pred):.4f}")
    print(f"F1 Score: {f1_score(y, y_pred):.4f}")
    
    # Save model
    model_path = "models/rf_baseline_v1.pkl"
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    # Save metadata
    import json
    metadata = {
        "version": "v1.0.0",
        "accuracy": accuracy_score(y, y_pred),
        "precision": precision_score(y, y_pred),
        "recall": recall_score(y, y_pred),
        "features": preprocessor.feature_names
    }
    with open("models/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
if __name__ == "__main__":
    train_baseline_model()
