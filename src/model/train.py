import pandas as pd
import numpy as np
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, GRU, Dense, Dropout, Bidirectional, BatchNormalization
from sklearn.model_selection import train_test_split
import pickle

df = pd.read_csv('src\model\Train\Train.csv')


tokenizer = Tokenizer(num_words = 20000 , oov_token = "<OOV>")
tokenizer.fit_on_texts(df['comment_text'])
sequences = tokenizer.texts_to_sequences(df['comment_text'])
padded_sequences = pad_sequences(sequences , maxlen = 300)

model = Sequential([
      Embedding(input_dim = 20000 , output_dim = 128 , input_length = 300) ,
      Bidirectional(LSTM (64 , return_sequences = True)),
      Bidirectional(LSTM(32)),
      Dropout(0.5),
      Dense(6 , activation = 'sigmoid')
])

model.compile(loss = 'binary_crossentropy' , optimizer = 'adam' , metrics = ['accuracy'])
model.build(input_shape = (None , 300))

X_train , X_val , y_train , y_val = train_test_split(padded_sequences , df.iloc[: , 2 : ] , test_size = 0.2)

history = model.fit(X_train , y_train ,epochs = 5 , validation_data = (X_val , y_val) , batch_size = 32)



loss, accuracy = model.evaluate(X_val, y_val)
print(f"Test Accuracy: {accuracy:.4f}")

model.save('toxic_model.h5')

with open('tokenizer.pkl', 'wb') as f:
    pickle.dump(tokenizer, f)