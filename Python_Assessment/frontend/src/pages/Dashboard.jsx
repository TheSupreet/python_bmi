import React, { useEffect, useState } from "react";

import { postJSON, downloadReport } from "../api";


export default function Dashboard({ user, setUser }) {
  const [current, setCurrent] = useState(user || JSON.parse(localStorage.getItem("user") || "null"));

  const [heightOverride, setHeightOverride] = useState("");

  const [measurement, setMeasurement] = useState(null);

  const [loading, setLoading] = useState(false);

  const [reportLoading, setReportLoading] = useState(false);

  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (current) setHeightOverride(current.heightCm || "");

    // sync to parent

    if (setUser) setUser(current);
  }, [current]);

  async function handleFetchWeight() {
    if (!current) return setMsg("Register first.");

    setMsg("");

    setLoading(true);

    setMeasurement(null);

    try {
      // asks backend to run exe and read weight, returns { weightKg }

      const deviceRes = await postJSON("/run-exe", { userId: current.id });

      const weightKg = parseFloat(deviceRes.weightKg);

      if (isNaN(weightKg)) throw new Error("Invalid weight from device");

      // now measure and compute bmi in backend (and generate pdf)

      const measurementRes = await postJSON("/measure-bmi", {
        userId: current.id,

        heightCm: heightOverride ? Number(heightOverride) : Number(current.heightCm),

        weightKg,
      });

      // returns measurement including bmi, category

      setMeasurement(measurementRes.measurement);

      // update user state if backend returned updated user

      if (measurementRes.user) {
        setCurrent(measurementRes.user);

        localStorage.setItem("user", JSON.stringify(measurementRes.user));
      }

      setMsg("Measurement successful!");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!current) return setMsg("Register first.");

    if (!measurement) return setMsg("Please fetch weight and calculate BMI first.");

    setReportLoading(true);

    setMsg("");

    try {
      await downloadReport(current.id, `bmi_report_${current.name || "user"}.pdf`);

      setMsg("Report downloaded successfully!");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setReportLoading(false);
    }
  }

  const categoryClass = measurement?.category ? (measurement.category.toLowerCase().includes("normal") ? "success" : measurement.category.toLowerCase().includes("underweight") || measurement.category.toLowerCase().includes("overweight") ? "warning" : "error") : "";

  return (
    <div className="app-wrap">
      <div className="container">
        <div className="title">
          <h1>BMI Dashboard</h1>

          <p>Welcome, **{current?.name || "Guest"}**! Weighing scale → BMI → PDF</p>
        </div>

        <div className="card">
          <h2>Measurement Panel</h2>

          {!current ? (
            <p className="helper">No user loaded. Please register first to continue.</p>
          ) : (
            <>
              {/* Input Field for Height Override */}

              <div className="field-set">
                <div className="field field-full">
                  <label>Height Override (cm)</label>

                  <input type="number" value={heightOverride} onChange={(e) => setHeightOverride(e.target.value)} placeholder={current.heightCm} />

                  <p className="helper">Stored height: **{current.heightCm} cm** (Leave blank to use stored value)</p>
                </div>

                {/* Main Action Button */}

                <div className="button-row" style={{ marginTop: "15px" }}>
                  <button className="btn btn-primary" onClick={handleFetchWeight} disabled={loading}>
                    {loading ? "Fetching weight..." : "1. Fetch Weight & Calculate BMI"}
                  </button>
                </div>
              </div>

              {/* Output/Result Box */}

              <div className="output" style={{ marginTop: "20px" }}>
                <p className="output-title">Latest Measurement Result</p>

                {measurement ? (
                  <>
                    <div className="row">
                      <span className="label">Weight</span>

                      <span className="value">{measurement.weightKg} kg</span>
                    </div>

                    <div className="row">
                      <span className="label">Height Used</span>

                      <span className="value">{measurement.heightCm} cm</span>
                    </div>

                    <div className="row">
                      <span className="label">BMI</span>

                      <span className="value">{measurement.bmi}</span>
                    </div>

                    <div className="row">
                      <span className="label">Category</span>

                      <span className={`value ${categoryClass}`}>{measurement.category}</span>
                    </div>
                  </>
                ) : (
                  <div className="helper">Click "Fetch Weight & Calculate BMI" to see your result.</div>
                )}
              </div>

              {/* Download Button */}

              <div className="button-row" style={{ marginTop: "15px" }}>
                <button className="btn btn-secondary" onClick={handleDownload} disabled={reportLoading || !current || !measurement}>
                  {reportLoading ? "Preparing report..." : "2. Download PDF Report"}
                </button>
              </div>
            </>
          )}

          {/* Global Message Display */}

          {msg && (
            <div className={`helper ${msg.includes("success") ? "success" : "error"}`} style={{ marginTop: "16px" }}>
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
