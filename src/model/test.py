import pandas as pd
import numpy as np
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Bidirectional, BatchNormalization
from sklearn.model_selection import train_test_split
import pickle
import os
from tensorflow.keras.models import load_model

MODEL_PATH = os.path.join(os.getcwd(), "model", "toxicity_model.h5")
TOKENIZER_PATH = os.path.join(os.getcwd(), "model", "tokenizer.pkl")
folder = 'Data'

Train_data_path = os.path.join(os.getcwd() , "model" , "Data" ,'train.csv');
Test_data_path = os.path.join(os.getcwd() , "model", "Data" , "train.csv");
print(TOKENIZER_PATH)
if not os.path.exists(TOKENIZER_PATH) or not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("Tokenizer or Model file not found. Please ensure both are present.")

# Load artifacts (Tokenizer and RNN model) at startup

with open(TOKENIZER_PATH, "rb") as f:
    tokenizer = pickle.load(f)

model = load_model(MODEL_PATH)
df = pd.read_csv("model\Data\Raw.csv");

tokenizer = Tokenizer(num_words = 20000 , oov_token = "<OOV>")
tokenizer.fit_on_texts(df['comment_text'])
sequences = tokenizer.texts_to_sequences(df['comment_text'])
padded_sequences = pad_sequences(sequences , maxlen = 300)
X_train ,  X_test , y_train , y_test = train_test_split(padded_sequences , df.iloc[: , 2 : ] , test_size = 0.2);


loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {accuracy:.4f}")

