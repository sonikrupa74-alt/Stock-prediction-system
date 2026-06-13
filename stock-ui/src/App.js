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
    <div className="app">
      {/* Navbar */}
      <div className="navbar">
        <h2>📊 TickrAI</h2>
        <input
          type="text"
          placeholder="Search ticker (AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <button onClick={fetchPrediction}>Search</button>
      </div>

      {/* Stats Cards */}
      {data && (
        <>
          <div className="stats">
            <div className="stat-card">
              <p>Current Price</p>
              <h3>${data.current_price}</h3>
            </div>

            <div className="stat-card">
              <p>Predicted Price</p>
              <h3>${data.predicted_price}</h3>
            </div>

            <div className="stat-card">
              <p>Return</p>
              <h3>{(data.predicted_return * 100).toFixed(2)}%</h3>
            </div>

            <div
              className={`stat-card ${
                data.trend === "Up" ? "green" : "red"
              }`}
            >
              <p>Trend</p>
              <h3>{data.trend}</h3>
            </div>
          </div>

          {/* Main Card */}
          <div className="main-card">
            <h2>{data.symbol}</h2>
            <p className="trend">
              Forecast:{" "}
              <span className={data.trend === "Up" ? "green" : "red"}>
                {data.trend}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;