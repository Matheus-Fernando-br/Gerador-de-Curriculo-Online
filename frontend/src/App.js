// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TelaInicial from "./pages/telaInicial/telaInicial";
import Gerador from "./pages/main/gerador";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaInicial />} />
        <Route path="/gerador" element={<Gerador />} />
      </Routes>
    </Router>
  );
}

export default App;
