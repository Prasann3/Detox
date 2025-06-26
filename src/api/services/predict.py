import os
import pickle
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Paths relative to project root
MODEL_PATH = os.path.join(os.getcwd(), "model", "toxicity_model.h5")
TOKENIZER_PATH = os.path.join(os.getcwd(), "model", "tokenizer.pkl")
print(TOKENIZER_PATH)
if not os.path.exists(TOKENIZER_PATH) or not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("Tokenizer or Model file not found. Please ensure both are present.")

# Load artifacts (Tokenizer and RNN model) at startup

with open(TOKENIZER_PATH, "rb") as f:
    tokenizer = pickle.load(f)

model = load_model(MODEL_PATH)

def get_prediction(comment: str) -> dict:
    """
    Runs the tokenizer and model on the input comment
    and returns a dict of label: probability.
    """
    labels = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']
    try:
        seq = tokenizer.texts_to_sequences([comment])
        padded = pad_sequences(seq, maxlen=300)
        preds = model.predict(padded)[0]
        return {label: float(f"{prob:.3f}") for label, prob in zip(labels, preds)}
    except Exception as e:
        return {"error": "Model prediction failed", "details": str(e)}
