import random

import numpy as np
import pandas as pd


def generate_normal_telemetry(num_samples: int = 1000) -> pd.DataFrame:
    """Generates synthetic normal telemetry data based on Master Prompt contract."""
    np.random.seed(42)
    random.seed(42)
    
    data = []
    for i in range(num_samples):
        # Base normal values
        temp = np.random.uniform(20.0, 35.0)
        humidity = np.random.uniform(40.0, 80.0)
        
        # Load correlates slightly with temperature and humidity
        load = 50.0 + (temp - 25.0) * 1.5 + (humidity - 50.0) * 0.2 + np.random.normal(0, 5.0)
        
        data.append({
            "gridId": f"IND-{i:03d}",
            "currentLoad": load,
            "temperature": temp,
            "humidity": humidity,
            "is_anomaly": 0,
            "anomaly_type": "NORMAL"
        })
        
    return pd.DataFrame(data)

def inject_anomalies(df: pd.DataFrame, num_samples: int = 200) -> pd.DataFrame:
    """Injects high-risk anomalies (e.g. bypass/theft leading to massive load drop, or spikes)."""
    anomalies = df.sample(n=num_samples, random_state=42).copy()
    
    for idx, row in anomalies.iterrows():
        anomaly_kind = random.choice(["LOAD_DROP", "LOAD_SPIKE"])
        
        if anomaly_kind == "LOAD_DROP":
            # e.g., meter bypass
            anomalies.at[idx, "currentLoad"] = row["currentLoad"] * random.uniform(0.1, 0.3)
            anomalies.at[idx, "anomaly_type"] = "PARTIAL_BYPASS"
        else:
            # e.g., direct hooking / massive unmetered load
            anomalies.at[idx, "currentLoad"] = row["currentLoad"] * random.uniform(1.8, 3.0)
            anomalies.at[idx, "anomaly_type"] = "DIRECT_HOOKING"
            
        anomalies.at[idx, "is_anomaly"] = 1
        
    return pd.concat([df.drop(anomalies.index), anomalies]).reset_index(drop=True)

def create_training_dataset(save_path: str = None) -> pd.DataFrame:
    """Creates a full dataset with normal and anomalous samples."""
    df_normal = generate_normal_telemetry(3000)
    df = inject_anomalies(df_normal, 400)
    
    if save_path:
        df.to_parquet(save_path)
    return df

if __name__ == "__main__":
    df = create_training_dataset()
    print(f"Dataset generated with {len(df)} samples.")
    print(df["anomaly_type"].value_counts())
