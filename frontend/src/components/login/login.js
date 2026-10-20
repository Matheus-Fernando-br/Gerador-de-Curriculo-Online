import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./login.css";
import LoginForm from "./LoginForm";
import { getUsuario, isLoggedIn, whatsappLink } from "../../auth/auth";

function Login() {
  const [open, setOpen] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [logado, setLogado] = useState(isLoggedIn());
  const containerRef = useRef(null);

  // Atualiza quando o usuário entra ou sai
  useEffect(() => {
    const sync = () => setLogado(isLoggedIn());
    window.addEventListener("auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Fecha se clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setFixed(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helpers para hover que respeitam o estado 'fixed'
  const handleEnter = () => {
    if (!fixed) setOpen(true);
  };
  const handleLeave = () => {
    if (!fixed) setOpen(false);
  };

  // Usuário já logado: atalho direto para a área Plus
  if (logado) {
    return (
      <div className="login-container">
        <Link to="/plus" className="login-link plus">
          <i className="bi bi-stars"></i> Área Plus · {getUsuario()}
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="login-container">
      {/* aplica handlers ao link */}
      <a
        href="#login"
        className={`login-link ${open || fixed ? "open" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          // alterna "fixado"
          if (fixed) {
            setFixed(false);
            setOpen(false);
          } else {
            setFixed(true);
            setOpen(true);
          }
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <i className="bi bi-person-circle"></i> Login
      </a>

      {/* E também aplica handlers no submenu — garante que ao passar do link pra ele continue aberto */}
      <div
        className={`login-submenu ${open ? "open" : ""}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={() => setFixed(true)}
      >
        <div className="login-title">Área Plus</div>
        <div className="login-subtitle">Entre para acessar os recursos premium.</div>
        <LoginForm />
        <p className="cadastre-text">
          Ainda não tem acesso?{" "}
          <a
            href={whatsappLink("Olá! Gostaria de ter o Plano Plus do Gerador de Currículo.")}
            target="_blank"
            rel="noopener noreferrer"
            className="cadastre-link"
          >
            Assine o Plano Plus
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
