import React, { useState, useEffect, useRef } from "react";
import "./login.css";

function Login() {
  const [open, setOpen] = useState(false);
  const [fixed, setFixed] = useState(false);
  const containerRef = useRef(null);

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
      >
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Usuário" className="login-input" />
          <input type="password" placeholder="Senha" className="login-input" />
          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>
        <p className="cadastre-text">
          Não tem uma conta?{" "}
          <a href="/cadastro" className="cadastre-link">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
