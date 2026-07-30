import numpy as np
import pandas as pd
import random

def generate_load_forecast_dataset(num_samples: int = 4000) -> pd.DataFrame:
    """Generates synthetic dataset for load forecasting."""
    np.random.seed(123)
    random.seed(123)
    
    data = []
    for i in range(num_samples):
        # Base input values
        temp = np.random.uniform(15.0, 40.0)
        humidity = np.random.uniform(30.0, 90.0)
        current_load = np.random.uniform(40.0, 100.0)
        
        # We want to predict the next hour's load (target_load)
        # It strongly correlates with the current load, plus temperature impacts, plus some random noise
        # E.g. if temp is very high (>30), load tends to increase (AC usage)
        temp_effect = (temp - 25.0) * 0.8
        
        # Next hour load
        target_load = current_load + temp_effect + np.random.normal(0, 2.0)
        
        # Ensure it doesn't go below reasonable bounds
        target_load = max(20.0, min(150.0, target_load))
        
        data.append({
            "gridId": f"IND-{(i % 100) + 1:03d}",
            "currentLoad": current_load,
            "temperature": temp,
            "humidity": humidity,
            "target_load": target_load
        })
        
    return pd.DataFrame(data)

if __name__ == "__main__":
    df = generate_load_forecast_dataset()
    print(f"Load Forecast Dataset generated with {len(df)} samples.")
    print(df.head())
