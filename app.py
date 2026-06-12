from fastapi import FastAPI
import pickle
import pandas as pd
import requests
import os
from dotenv import load_dotenv

app = FastAPI()

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

        # Features
        df['MA10'] = df['Close'].rolling(10).mean()
        df['MA50'] = df['Close'].rolling(50).mean()
        df['Return'] = df['Close'].pct_change()
        df = df.dropna()

        last = df.iloc[-1]

        # Input
        input_data = [[
            last['Open'], last['High'], last['Low'], last['Close'],
            last['Volume'], last['MA10'], last['MA50'], last['Return']
        ]]

        # Apply scaler ✅
        input_data = scaler.transform(input_data)

        # Prediction
        pred = model.predict(input_data)[0]

        return {
            "symbol": symbol.upper(),
            "price": float(last['Close']),
            "predicted": float(pred),
            "trend": "Up" if pred > last['Close'] else "Down"
        }

    except Exception as e:
        return {"error": str(e)}