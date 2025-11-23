import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import { postJSON } from "../api";

/*

 registration -> POST /api/register

 fields: name, age, gender, heightCm, weightKg

*/

export default function Register({ setUser }) {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",

    age: "",

    gender: "male",

    heightCm: "",

    weightKg: "",
  });

  const [loading, setLoading] = useState(false);

  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();

    setMsg("");

    setLoading(true);

    try {
      const data = await postJSON("/register", {
        name: form.name,

        age: Number(form.age),

        gender: form.gender,

        heightCm: Number(form.heightCm),

        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      });

      setUser(data.user);

      localStorage.setItem("user", JSON.stringify(data.user));

      setMsg("Registered successfully");

      setTimeout(() => nav("/dashboard"), 600);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-wrap">
      <div className="container">
        <div className="title">
          <h1>Device-Aware BMI Studio</h1>

          <p>Register or sign in — we'll store your height for quick BMI checks.</p>
        </div>

        <div className="card">
          <h2>User Profile Registration</h2>

          <p className="helper">All fields except Weight are required for accurate BMI calculation.</p>

          <hr style={{ border: "none", borderBottom: "1px solid #e6e9ef", margin: "16px 0" }} />

          <form className="page-form" onSubmit={submit}>
            <div className="form-grid">
              {/* Name (Full Width) */}

              <div className="field field-full">
                <label htmlFor="name">Full Name</label>

                <input id="name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g., John Doe" />
              </div>

              {/* Age */}

              <div className="field">
                <label htmlFor="age">Age</label>

                <input id="age" type="number" min="1" required value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} placeholder="e.g., 35" />
              </div>

              {/* Gender */}

              <div className="field">
                <label htmlFor="gender">Gender</label>

                <select id="gender" required value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                  <option value="male">Male</option>

                  <option value="female">Female</option>

                  <option value="other">Other</option>
                </select>
              </div>

              {/* Height */}

              <div className="field">
                <label htmlFor="height">Height (cm)</label>

                <input id="height" required type="number" min="50" max="250" step="0.1" value={form.heightCm} onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))} placeholder="e.g., 175.5" />
              </div>

              {/* Weight (Optional) */}

              <div className="field">
                <label htmlFor="weight">Weight (kg) — optional</label>

                <input id="weight" type="number" min="10" max="300" step="0.1" value={form.weightKg} onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))} placeholder="e.g., 72.0" />
              </div>
            </div>

            <span className="helper" style={{ marginTop: "16px" }}>
              If you have a weight reading now, enter it — otherwise Dashboard will fetch it from your scale.
            </span>

            <div className="button-row">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Profile & Continue"}
              </button>
            </div>

            {msg && <div className={`helper ${msg.includes("success") ? "success" : "error"}`}>{msg}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
