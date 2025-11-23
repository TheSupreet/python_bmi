import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register setUser={setUser} />} />
      <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />} />
    </Routes>
  );
}
