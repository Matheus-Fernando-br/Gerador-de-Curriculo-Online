import React, { useState } from "react";
import "../../pages/main/gerador.css"; // usa o mesmo estilo do gerador
import "./cadastroLogin.css";

function CadastroLogin() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados enviados:", form);
  };

  return (
    <div className="gerador-container">
      {/* NAV SIMPLES COM VOLTAR */}
      <nav className="top-navbar">
        <div className="left-section">
          <a href="#top">
            <img src="/logo.png" alt="Logo" className="logo"/>
          </a>
        </div>
        <div className="right-section cadastro-login-nav">
          <a href="/gerador">
            Voltar
          </a>
        </div>
      </nav>

      <div className="app-container">
        <section className="form-section">
          <h1>Crie sua conta</h1>

          <form className="formulario" onSubmit={handleSubmit}>
            <div className="field-label">
              Nome completo
              <input
                type="text"
                name="nome"
                placeholder="Digite seu nome completo"
                value={form.nome}
                onChange={handleChange}
              />
            </div>

            <div className="field-label">
              E-mail
              <input
                type="email"
                name="email"
                placeholder="Digite seu e-mail"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="field-label">
              Senha
              <input
                type="password"
                name="senha"
                placeholder="Digite uma senha"
                value={form.senha}
                onChange={handleChange}
              />
            </div>

            <div className="field-label">
              Confirmar senha
              <input
                type="password"
                name="confirmarSenha"
                placeholder="Confirme sua senha"
                value={form.confirmarSenha}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="submit-btn">
              Cadastrar
            </button>
          </form>

          <p className="cadastro-link">
            Já tem uma conta? <a href="/gerador">Faça login</a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default CadastroLogin;
