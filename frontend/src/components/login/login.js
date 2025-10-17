import React, { useState } from "react";
import "./login.css";

function Login() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="login-container"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href="#login"
        className="login-link"
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
      >
        <i className="bi bi-person-circle"></i> Login
      </a>

      <div className={`login-submenu ${open ? "open" : ""}`}>
        <form className="login-form">
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
