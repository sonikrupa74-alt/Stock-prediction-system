import React, { useState } from "react";
import "./App.css";

function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);

  const fetchPrediction = async () => {
    const res = await fetch(`http://127.0.0.1:8000/predict/${symbol}`);
    const result = await res.json();
    setData(result);
  };

  return (
    <div className="container">
      <h1 className="title">📈 Stock Predictor</h1>

      <div className="card">
        <input
          type="text"
          placeholder="Enter Stock (AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="input"
        />

        <button onClick={fetchPrediction} className="button">
          Predict
        </button>

        {data && (
          <div className="result">
            <h2>{data.symbol}</h2>

            <div className="grid">
              <div className="box">
                <p>Current</p>
                <h3>${data.current_price}</h3>
              </div>

              <div className="box">
                <p>Predicted</p>
                <h3>${data.predicted_price}</h3>
              </div>

              <div className="box">
                <p>Return</p>
                <h3>{(data.predicted_return * 100).toFixed(2)}%</h3>
              </div>

              <div className={`box ${data.trend === "Up" ? "up" : "down"}`}>
                <p>Trend</p>
                <h3>{data.trend}</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;