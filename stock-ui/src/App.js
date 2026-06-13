import React, { useState } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);

  const fetchPrediction = async () => {
    const res = await fetch(`http://127.0.0.1:8000/predict/${symbol}`);
    const result = await res.json();

    // Fake chart data (you can replace with real API later)
    const chartData = Array.from({ length: 20 }, (_, i) => ({
      day: i,
      price: result.current_price + Math.random() * 50 - 25,
    }));

    setData({ ...result, chart: chartData });
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <div className="navbar">
        <div className="logo">📊 TickrAI</div>

        <input
          type="text"
          placeholder="Search ticker..."
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />

        <button onClick={fetchPrediction}>Search</button>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="card"><p>Tracked</p><h3>14</h3></div>
        <div className="card"><p>Bullish</p><h3>9/14</h3></div>
        <div className="card"><p>Confidence</p><h3>70%</h3></div>
        <div className="card"><p>Top</p><h3>NVDA</h3></div>
      </div>

      {/* MAIN CARD */}
      {data && (
        <div className="main-card">
          <div className="stock-header">
            <h2>{data.symbol}</h2>
            <span className={data.trend === "Up" ? "green" : "red"}>
              {data.trend}
            </span>
          </div>

          <h1>${data.current_price}</h1>

          {/* REAL GRAPH */}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.chart}>
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="insight">
            Insight: AI predicts {data.trend} trend with{" "}
            {(data.predicted_return * 100).toFixed(2)}% return.
          </p>
        </div>
      )}

      {/* BOTTOM */}
      <div className="bottom">
        <div className="list">
          <h3>Top Gainers</h3>
          <div className="item">NVDA +3.4%</div>
          <div className="item">AMD +2.7%</div>
          <div className="item">NFLX +2.1%</div>
          <div className="item">AAPL +1.8%</div>
        </div>

        <div className="list">
          <h3>Top Losers</h3>
          <div className="item red">DIS -3.2%</div>
          <div className="item red">BA -2.9%</div>
          <div className="item red">TSLA -2.6%</div>
          <div className="item red">XOM -1.9%</div>
        </div>
      </div>
    </div>
  );
}

export default App;