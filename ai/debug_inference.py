import numpy as np

from inference.predictor import InferencePredictor


def run():
    predictor = InferencePredictor(model_dir="models")
    features = np.array([50.5, 25.0, 60.0])
    try:
        res = predictor.predict(features)
        print("Success:", res)
    except Exception:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run()
