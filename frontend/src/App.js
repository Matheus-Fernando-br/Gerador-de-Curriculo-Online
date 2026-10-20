// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TelaInicial from "./pages/telaInicial/telaInicial";
import Gerador from "./pages/main/gerador";
import Cadastro from "./components/cadastroLogin/cadastroLogin";
import Entrar from "./pages/entrar/entrar";
import Plus from "./pages/plus/plus";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaInicial />} />
        <Route path="/gerador" element={<Gerador />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route
          path="/plus"
          element={
            <ProtectedRoute>
              <Plus />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
