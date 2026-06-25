from fastapi import FastAPI
import pickle
import pandas as pd
import requests
import os
from dotenv import load_dotenv
#import numpy as np 

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API key
load_dotenv()
API_KEY = os.getenv("API_KEY")

# Load model + scaler
model = pickle.load(open("model.pkl", "rb"))
scaler = pickle.load(open("scaler.pkl", "rb"))

@app.get("/")
def home():
    return {"msg": "API working"}

@app.get("/predict/{symbol}")
def predict(symbol: str):

    try:
        # API call
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={API_KEY}"
        response = requests.get(url)
        data = response.json()

        # Error handling
        if "Time Series (Daily)" not in data:
            return {"error": "Invalid symbol or API limit reached"}

        # Data processing
        df = pd.DataFrame(data["Time Series (Daily)"]).T
        df.columns = ['Open','High','Low','Close','Volume']
        df = df.astype(float)

        # Features (same as training)
        df['MA10'] = df['Close'].rolling(10).mean()
        df['MA50'] = df['Close'].rolling(50).mean()
        df['EMA10'] = df['Close'].ewm(span=10).mean()
        df['Return'] = df['Close'].pct_change()
        df['High_Low_Diff'] = df['High'] - df['Low']

        df = df.dropna()
        last = df.iloc[-1]

        # Input
        input_data = [[
            last['Open'], last['High'], last['Low'], last['Close'],
            last['Volume'], last['MA10'], last['MA50'],
            last['EMA10'], last['Return'], last['High_Low_Diff']
        ]]

        # Scale
        input_data = scaler.transform(input_data)

        # Predict (RETURN %)
        pred = model.predict(input_data)[0]

        # Convert to price 🔥
        current_price = float(last['Close'])
        predicted_price = current_price * (1 + pred)

        return {
            "symbol": symbol.upper(),
            "current_price": current_price,
            "predicted_price": float(predicted_price),
            "predicted_return": float(pred),
            "trend": "Up" if pred > 0 else "Down"
        }

    except Exception as e:
        return {"error": str(e)}
