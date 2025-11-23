import React from "react";

import { useNavigate } from "react-router-dom";

/*

 Note: hero image uses uploaded file path which your environment will map:

 '/mnt/data/Screenshot 2025-11-23 014656.png'

*/

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="page-container">
      <div className="title-block">
        <h1 className="main-title">Device-Aware BMI Studio</h1>

        <p className="main-subtitle">Weighing scale → BMI → Downloadable PDF Report</p>
      </div>

      <div className="hero-card">
        <img src={"/mnt/data/Screenshot 2025-11-23 014656.png"} alt="A smart weighing scale displaying a BMI report" className="hero-img" />

        <div className="hero-content">
          <h2 className="hero-title">Smart BMI with Device Integration</h2>

          <p className="hero-description">Register once, fetch weight from a connected scale, and generate a professional BMI PDF report.</p>

          <div className="button-group">
            <button className="button-primary" onClick={() => nav("/register")}>
              Register User
            </button>

            <button className="button-secondary" onClick={() => nav("/dashboard")}>
              Open Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
