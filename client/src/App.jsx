// src/App.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      {/* later you can add more routes here, like /login, /admin, etc. */}
    </Routes>
  );
}
