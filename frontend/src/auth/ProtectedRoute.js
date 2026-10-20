// src/auth/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { verificarSessao } from "./auth";
import "./auth.css";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [estado, setEstado] = useState("verificando"); // verificando | ok | negado | erro
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setEstado("verificando");
    verificarSessao()
      .then((usuario) => ativo && setEstado(usuario ? "ok" : "negado"))
      .catch(() => ativo && setEstado("erro"));
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  if (estado === "ok") return children;

  if (estado === "negado") {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="auth-screen">
      <div className="auth-status-card">
        {estado === "verificando" ? (
          <>
            <span className="auth-spinner" />
            <h2>Verificando seu acesso…</h2>
            <p>Isso pode levar alguns segundos na primeira vez.</p>
          </>
        ) : (
          <>
            <i className="bi bi-wifi-off auth-status-icon" />
            <h2>Servidor indisponível</h2>
            <p>Não conseguimos confirmar seu login agora.</p>
            <button className="btn btn-primary" onClick={() => setTentativa((t) => t + 1)}>
              <i className="bi bi-arrow-clockwise" /> Tentar novamente
            </button>
          </>
        )}
      </div>
    </div>
  );
}
