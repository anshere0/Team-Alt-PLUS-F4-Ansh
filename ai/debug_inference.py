from inference.predictor import InferencePredictor
import numpy as np

def run():
    predictor = InferencePredictor(model_dir="models")
    features = np.array([50.5, 25.0, 60.0])
    try:
        res = predictor.predict(features)
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run()
