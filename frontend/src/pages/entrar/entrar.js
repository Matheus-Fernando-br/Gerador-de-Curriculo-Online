// src/pages/entrar/entrar.js
import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import "../../App.css";
import "../../auth/auth.css";
import "../../components/login/login.css";
import LoginForm from "../../components/login/LoginForm";
import { isLoggedIn, whatsappLink } from "../../auth/auth";

export default function Entrar() {
  const location = useLocation();
  const destino = location.state?.from || "/plus";

  if (isLoggedIn()) return <Navigate to={destino} replace />;

  return (
    <div className="auth-screen">
      <Link to="/" className="auth-back">
        <i className="bi bi-chevron-left" /> Início
      </Link>

      <div className="auth-card-page">
        <div className="auth-badge">
          <i className="bi bi-stars" />
        </div>
        <h1>Entrar na Área Plus</h1>
        <p className="auth-lead">
          Use o usuário e a senha que você recebeu ao assinar o Plano Plus.
        </p>

        <LoginForm redirectTo={destino} />

        <ul className="auth-perks">
          <li><i className="bi bi-type" /> Personalize títulos e seções</li>
          <li><i className="bi bi-palette-fill" /> Formatação profissional</li>
          <li><i className="bi bi-ui-checks" /> Alteração de campos</li>
          <li><i className="bi bi-headset" /> Suporte prioritário</li>
        </ul>

        <p className="cadastre-text">
          Ainda não tem acesso?{" "}
          <a
            href={whatsappLink("Olá! Gostaria de ter o Plano Plus do Gerador de Currículo.")}
            target="_blank"
            rel="noopener noreferrer"
            className="cadastre-link"
          >
            Assine pelo WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
