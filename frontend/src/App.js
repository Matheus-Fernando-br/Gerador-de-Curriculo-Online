import React, { useState } from "react";
import "./App.css";

/*
  App.jsx - Versão revisada:
  - formata telefone enquanto digita
  - CNH em MAIÚSCULAS (alfanumérico)
  - apenas nome e cidade capitalizam (função saferCapitalize)
  - conhecimentos não forçam uppercase
  - cursos/formações: se status === "Cursando", campo 'fim' some com animação
  - experiencias: status mudou para checkbox 'trabalhoAtual' (boolean). se marcado esconde 'fim'
  - labels adicionadas para todos os inputs
*/

function App() {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    data_nascimento: "",
    cidade: "",
    objetivo: "",
    formacoes: [],
    conhecimentos: [],
    cursos: [],
    experiencias: [],
    idiomas: [],
    cnh: "",
  });
  const [loading, setLoading] = useState(false);

  // saferCapitalize: primeira letra maiúscula de cada palavra, mantendo acentos e não reiniciando com chars especiais.
  const saferCapitalize = (text) => {
    if (!text) return "";
    return text
      .split(" ")
      .map((w) => {
        if (!w) return "";
        const first = w[0].toUpperCase();
        const rest = w.slice(1).toLowerCase();
        return first + rest;
      })
      .join(" ");
  };

  // formata telefone enquanto digita: recebe só números e devolve (DD) 9XXXX-XXXX
  const formatPhone = (onlyDigits) => {
    // onlyDigits expected like "31987654321" (11 digits) or shorter while typing
    const d = onlyDigits.replace(/\D/g, "");
    let out = d;
    if (d.length <= 2) {
      out = "(" + d;
    } else if (d.length <= 6) {
      out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    } else if (d.length <= 10) {
      // format without final digit yet
      out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(d.length - 4)}`;
    } else {
      // prefer 11-digit format
      out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
    }
    return out;
  };

  // onChange global para inputs simples
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "telefone") {
      // manter apenas dígitos internamente e formatar visualmente
      const digits = val.replace(/\D/g, "").slice(0, 11); // DDD + 9 + 8digits => 11
      val = formatPhone(digits);
    }

    if (name === "email") {
      val = val.toLowerCase();
    }

    if (name === "cnh") {
      // aceitar apenas alfanuméricos e converter para maiúsculas
      val = val.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
    }

    // Apenas nome e cidade recebem capitalização automática
    if (name === "nome" || name === "cidade") {
      val = saferCapitalize(val);
    }

    setForm((prev) => ({ ...prev, [name]: val }));
  };

  // Manipulação para arrays dinâmicos (formacoes, cursos, experiencias, etc.)
  const handleArrayChange = (index, field, subField, value) => {
    const updated = [...form[field]];
    updated[index] = { ...updated[index], [subField]: value };
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const addItem = (field, itemTemplate) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], itemTemplate] }));
  };

  const removeItem = (field, index) => {
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validações básicas no front
    if (!form.nome || !form.email || !form.telefone || !form.objetivo) {
      alert("Preencha os campos obrigatórios!");
      return;
    }
    if (!form.email.includes("@")) {
      alert("E-mail inválido!");
      return;
    }

    setLoading(true);
    try {
      // enviar JSON como já está (os campos month -> "YYYY-MM", date -> "YYYY-MM-DD")
      const res = await fetch("https://gerador-de-curriculo-online-production.up.railway.app/generate_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Erro no servidor:", errText);
        throw new Error(`Erro ao gerar PDF: ${errText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = (form.nome || "curriculo").replace(/\s+/g, "_");
      link.href = url;
      link.download = `curriculo_${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <section className="form-section">
        <h1>GERADOR DE CURRÍCULO ONLINE</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-grid">
            <label className="field-label">
              Nome *
              <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Digite seu nome completo"/>
            </label>

            <label className="field-label">
              Telefone *
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="Apenas números"
                required
              />
            </label>

            <label className="field-label">
              Email *
              <input name="email" value={form.email} onChange={handleChange} type="email" required placeholder="nome@exemplo.com" />
            </label>

            <label className="field-label">
              Cidade
              <input name="cidade" value={form.cidade} onChange={handleChange} placeholder="Informe sua cidade"/>
            </label>

            <label className="field-label">
              Data de nascimento
              <input name="data_nascimento" value={form.data_nascimento} onChange={handleChange} type="date" />
            </label>

            <label className="field-label">
              CNH
              <input name="cnh" value={form.cnh} onChange={handleChange} placeholder="Informe sua categoria" />
            </label>
          </div>

          <label className="field-label">
            Objetivo Profissional *
            <textarea name="objetivo" value={form.objetivo} onChange={handleChange} rows={4} required  placeholder="Digite aqui o seus objetivos e metas"/>
          </label>

          {/* Formação Acadêmica */}
          <div className="dynamic-field">
            <div className="section-title">Formação Acadêmica</div>
            {form.formacoes.map((item, i) => {
              const status = item.status || "";
              return (
                <div key={i} className={`multi-input ${Array.isArray(item.atribuicoes) ? "" : "stack"}`}>
                  <input
                    placeholder="Curso"
                    value={item.curso}
                    onChange={(e) => handleArrayChange(i, "formacoes", "curso", saferCapitalize(e.target.value))}
                  />
                  <input
                    placeholder="Escola"
                    value={item.escola}
                    onChange={(e) => handleArrayChange(i, "formacoes", "escola", saferCapitalize(e.target.value))}
                  />
                  <select
                    value={status}
                    onChange={(e) => handleArrayChange(i, "formacoes", "status", e.target.value)}
                  >
                    <option value="">Status</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cursando">Cursando</option>
                    <option value="Trancado">Trancado</option>
                  </select>

                  <input
                    type="month"
                    value={item.inicio}
                    onChange={(e) => handleArrayChange(i, "formacoes", "inicio", e.target.value)}
                  />

                  {/* campo fim: escondido se status === "Cursando" */}
                  <div className={`hide-animate ${status === "Cursando" ? "hidden" : ""}`}>
                    <input
                      type="month"
                      value={item.fim}
                      onChange={(e) => handleArrayChange(i, "formacoes", "fim", e.target.value)}
                    />
                  </div>

                  <button type="button" className="remove-btn" onClick={() => removeItem("formacoes", i)}>
                    Remover
                  </button>
                  <hr className="divider"/>
                </div>
              );
            })}
            <button
              type="button"
              className="add-btn"
              onClick={() => addItem("formacoes", { curso: "", escola: "", status: "", inicio: "", fim: "" })}
            >
              + Adicionar formação
            </button>
          </div>

          {/* Conhecimentos */}
          <div className="dynamic-field">
            <div className="section-title">Conhecimentos</div>
            {form.conhecimentos.map((item, i) => (
              <div key={i} className="multi-input stack">
                <input
                  placeholder="Descrição do conhecimento"
                  value={item.descricao}
                  onChange={(e) => handleArrayChange(i, "conhecimentos", "descricao", e.target.value)}
                />
                <button type="button" className="remove-btn" onClick={() => removeItem("conhecimentos", i)}>
                  Remover
                </button>
                <hr className="divider"/>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={() => addItem("conhecimentos", { descricao: "" })}>
              + Adicionar conhecimento
            </button>
          </div>

          {/* Cursos */}
          <div className="dynamic-field">
            <div className="section-title">Cursos de Qualificação</div>
            {form.cursos.map((item, i) => {
              const status = item.status || "";
              return (
                <div key={i} className="multi-input">
                  <input
                    placeholder="Nome do Curso"
                    value={item.curso}
                    onChange={(e) => handleArrayChange(i, "cursos", "curso", saferCapitalize(e.target.value))}
                  />
                  <input
                    placeholder="Instituição"
                    value={item.instituicao}
                    onChange={(e) => handleArrayChange(i, "cursos", "instituicao", saferCapitalize(e.target.value))}
                  />
                  <select
                    value={status}
                    onChange={(e) => handleArrayChange(i, "cursos", "status", e.target.value)}
                  >
                    <option value="">Status</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cursando">Cursando</option>
                  </select>

                  <input
                    type="month"
                    value={item.inicio}
                    onChange={(e) => handleArrayChange(i, "cursos", "inicio", e.target.value)}
                  />

                  <div className={`hide-animate ${status === "Cursando" ? "hidden" : ""}`}>
                    <input
                      type="month"
                      value={item.fim}
                      onChange={(e) => handleArrayChange(i, "cursos", "fim", e.target.value)}
                    />
                  </div>

                  <button type="button" className="remove-btn" onClick={() => removeItem("cursos", i)}>
                    Remover
                  </button>
                  <hr className="divider"/>
                </div>
              );
            })}
            <button
              type="button"
              className="add-btn"
              onClick={() => addItem("cursos", { curso: "", instituicao: "", inicio: "", fim: "", status: "" })}
            >
              + Adicionar curso
            </button>
          </div>

          {/* Experiências */}
          <div className="dynamic-field">
            <div className="section-title">Experiência Profissional</div>
            {form.experiencias.map((item, i) => {
              const atual = !!item.trabalhoAtual;
              return (
                <div key={i} className="multi-input">
                  <input
                    placeholder="Empresa"
                    value={item.empresa}
                    onChange={(e) => handleArrayChange(i, "experiencias", "empresa", saferCapitalize(e.target.value))}
                  />
                  <input
                    placeholder="Cargo"
                    value={item.cargo}
                    onChange={(e) => handleArrayChange(i, "experiencias", "cargo", saferCapitalize(e.target.value))}
                  />

                  <button type="button" className="remove-btn" onClick={() => removeItem("experiencias", i)}>
                    Remover
                  </button>


                  <input
                    type="month"
                    value={item.inicio}
                    onChange={(e) => handleArrayChange(i, "experiencias", "inicio", e.target.value)}
                  />

                  <div className={`hide-animate ${atual ? "hidden" : ""}`}>
                    <input
                      type="month"
                      value={item.fim}
                      onChange={(e) => handleArrayChange(i, "experiencias", "fim", e.target.value)}
                    />
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "2vw", marginTop: "0.7rem" }}>
                    <input
                      type="checkbox"
                      checked={atual}
                      onChange={(e) => handleArrayChange(i, "experiencias", "trabalhoAtual", e.target.checked)}
                    />
                    Trabalho atual
                  </label>
                  
                  <div className="multi-input stack" style={{ marginTop: "0.5rem" }}>
                    <label className="field-label">Atribuições</label>

                    {(item.atribuicoes || []).map((atr, j) => (
                      <div key={j} className="atribuicao-item">
                        <input
                          placeholder={`Atribuição ${j + 1}`}
                          value={atr}
                          onChange={(e) => {
                            const exp = [...form.experiencias];
                            exp[i].atribuicoes[j] = e.target.value; // não capitalizamos atribuições
                            setForm((prev) => ({ ...prev, experiencias: exp }));
                          }}
                        />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => {
                            const exp = [...form.experiencias];
                            exp[i].atribuicoes.splice(j, 1);
                            setForm((prev) => ({ ...prev, experiencias: exp }));
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                      <button
                        type="button"
                        className="add-btn"
                        onClick={() => {
                          const exp = [...form.experiencias];
                          exp[i].atribuicoes = [...(exp[i].atribuicoes || []), ""];
                          setForm((prev) => ({ ...prev, experiencias: exp }));
                        }}
                      >
                        + Adicionar atribuição
                      </button>

                  </div>

                  <hr className="divider"/>
                </div>
              );
            })}
            <button
              type="button"
              className="add-btn"
              onClick={() =>
                addItem("experiencias", { empresa: "", cargo: "", trabalhoAtual: false, inicio: "", fim: "", atribuicoes: [] })
              }
            >
              + Adicionar experiência
            </button>
          </div>

          {/* Idiomas */}
         <div className="dynamic-field">
          <div className="section-title">Idiomas</div>
          {form.idiomas.map((item, i) => (
            <div key={i} className="multi-input">

              {/* 🔽 Select de idiomas (ordenado alfabeticamente) */}
              <select
                value={item.idioma}
                onChange={(e) => handleArrayChange(i, "idiomas", "idioma", e.target.value)}
              >
                <option value="">Selecione o idioma</option>
                <option value="Alemão">Alemão</option>
                <option value="Árabe">Árabe</option>
                <option value="Chinês (Mandarim)">Chinês (Mandarim)</option>
                <option value="Coreano">Coreano</option>
                <option value="Dinamarquês">Dinamarquês</option>
                <option value="Espanhol">Espanhol</option>
                <option value="Finlandês">Finlandês</option>
                <option value="Francês">Francês</option>
                <option value="Grego">Grego</option>
                <option value="Hebraico">Hebraico</option>
                <option value="Hindi">Hindi</option>
                <option value="Holandês">Holandês</option>
                <option value="Húngaro">Húngaro</option>
                <option value="Inglês">Inglês</option>
                <option value="Italiano">Italiano</option>
                <option value="Japonês">Japonês</option>
                <option value="Norueguês">Norueguês</option>
                <option value="Polonês">Polonês</option>
                <option value="Português">Português</option>
                <option value="Romeno">Romeno</option>
                <option value="Russo">Russo</option>
                <option value="Sueco">Sueco</option>
                <option value="Tailandês">Tailandês</option>
                <option value="Tcheco">Tcheco</option>
                <option value="Turco">Turco</option>
                <option value="Ucraniano">Ucraniano</option>
              </select>

              {/* 🔽 Select de nível */}
              <select
                value={item.nivel}
                onChange={(e) => handleArrayChange(i, "idiomas", "nivel", e.target.value)}
              >
                <option value="">Nível</option>
                <option value="Básico">Básico</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
                <option value="Fluente">Fluente</option>
                <option value="Nativo">Nativo</option>
              </select>

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeItem("idiomas", i)}
              >
                Remover
              </button>

              <hr className="divider" />
            </div>
          ))}

          <button
            type="button"
            className="add-btn"
            onClick={() => addItem("idiomas", { idioma: "", nivel: "" })}
          >
            + Adicionar idioma
          </button>
          </div>



          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Gerando..." : "Gerar PDF"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default App;
