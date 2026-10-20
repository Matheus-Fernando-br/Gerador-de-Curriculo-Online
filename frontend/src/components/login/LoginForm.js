// src/components/login/LoginForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../auth/auth";

export default function LoginForm({ redirectTo = "/plus", onSuccess }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [lento, setLento] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario || !senha) {
      setErro("Informe usuário e senha.");
      return;
    }
    setErro("");
    setCarregando(true);
    const aviso = setTimeout(() => setLento(true), 4000);
    try {
      await login(usuario, senha);
      onSuccess && onSuccess();
      navigate(redirectTo);
    } catch (err) {
      setErro(err.message);
    } finally {
      clearTimeout(aviso);
      setLento(false);
      setCarregando(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <input
        type="text"
        placeholder="Usuário"
        className="login-input"
        autoComplete="username"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
      />
      <div className="login-password">
        <input
          type={mostrarSenha ? "text" : "password"}
          placeholder="Senha"
          className="login-input"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button
          type="button"
          className="login-eye"
          aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setMostrarSenha((v) => !v)}
        >
          <i className={`bi ${mostrarSenha ? "bi-eye-slash" : "bi-eye"}`} />
        </button>
      </div>

      {erro && (
        <div className="login-error" role="alert">
          <i className="bi bi-exclamation-circle-fill" /> {erro}
        </div>
      )}

      <button type="submit" className="btn-login" disabled={carregando}>
        {carregando ? (
          <>
            <span className="login-spinner" /> Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </button>

      {lento && <p className="login-hint">Acordando o servidor, aguarde alguns segundos…</p>}
    </form>
  );
}
