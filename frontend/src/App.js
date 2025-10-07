import React, { useState } from "react";
import "./App.css";

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

  const capitalize = (text) => text.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "telefone") {
      val = val.replace(/\D/g, "");
      if (val.length > 13) return;
    }
    if (name === "email") val = val.toLowerCase();
    if (name === "cnh") {
      val = val.replace(/[^A-Za-z]/g, "").toUpperCase();
      if (val.length > 5) return;
    }
    if (["nome", "cidade", "objetivo"].includes(name)) val = capitalize(val);
    setForm((prev) => ({ ...prev, [name]: val }));
  };

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
            <label>
              Nome *
              <input name="nome" value={form.nome} onChange={handleChange} required />
            </label>
            <label>
              Telefone *
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="DDD9XXXXXXXX"
                required
              />
            </label>
            <label>
              Email *
              <input name="email" value={form.email} onChange={handleChange} type="email" required />
            </label>
            <label>
              Cidade
              <input name="cidade" value={form.cidade} onChange={handleChange} />
            </label>
            <label>
              Data de nascimento
              <input name="data_nascimento" value={form.data_nascimento} onChange={handleChange} type="date" />
            </label>
            <label>
              CNH
              <input name="cnh" value={form.cnh} onChange={handleChange} />
            </label>
          </div>

          <label>
            Objetivo Profissional *
            <textarea name="objetivo" value={form.objetivo} onChange={handleChange} rows={3} required />
          </label>

          {/* Formação Acadêmica */}
          <div className="dynamic-field">
            <label>Formação Acadêmica</label>
            {form.formacoes.map((item, i) => (
              <div key={i} className="multi-input">
                <input
                  placeholder="Curso"
                  value={item.curso}
                  onChange={(e) => handleArrayChange(i, "formacoes", "curso", capitalize(e.target.value))}
                />
                <input
                  placeholder="Escola"
                  value={item.escola}
                  onChange={(e) => handleArrayChange(i, "formacoes", "escola", capitalize(e.target.value))}
                />
                <select
                  value={item.status}
                  onChange={(e) => handleArrayChange(i, "formacoes", "status", e.target.value)}
                >
                  <option value="">Status</option>
                  <option>Concluído</option>
                  <option>Cursando</option>
                  <option>Trancado</option>
                </select>
                <input
                  type="month"
                  value={item.inicio}
                  onChange={(e) => handleArrayChange(i, "formacoes", "inicio", e.target.value)}
                />
                <input
                  type="month"
                  value={item.fim}
                  onChange={(e) => handleArrayChange(i, "formacoes", "fim", e.target.value)}
                />
                <button type="button" className="remove-btn" onClick={() => removeItem("formacoes", i)}>
                  Remover
                </button>
              </div>
            ))}
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
            <label>Conhecimentos</label>
            {form.conhecimentos.map((item, i) => (
              <div key={i} className="multi-input">
                <input
                  placeholder="Descrição do conhecimento"
                  value={item.descricao}
                  onChange={(e) => handleArrayChange(i, "conhecimentos", "descricao", capitalize(e.target.value))}
                />
                <button type="button" className="remove-btn" onClick={() => removeItem("conhecimentos", i)}>
                  Remover
                </button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={() => addItem("conhecimentos", { descricao: "" })}>
              + Adicionar conhecimento
            </button>
          </div>

          {/* Cursos */}
          <div className="dynamic-field">
            <label>Cursos de Qualificação</label>
            {form.cursos.map((item, i) => (
              <div key={i} className="multi-input">
                <input
                  placeholder="Nome do Curso"
                  value={item.curso}
                  onChange={(e) => handleArrayChange(i, "cursos", "curso", capitalize(e.target.value))}
                />
                <input
                  placeholder="Instituição"
                  value={item.instituicao}
                  onChange={(e) => handleArrayChange(i, "cursos", "instituicao", capitalize(e.target.value))}
                />
                <input
                  type="month"
                  value={item.inicio}
                  onChange={(e) => handleArrayChange(i, "cursos", "inicio", e.target.value)}
                />
                <input
                  type="month"
                  value={item.fim}
                  onChange={(e) => handleArrayChange(i, "cursos", "fim", e.target.value)}
                />
                <button type="button" className="remove-btn" onClick={() => removeItem("cursos", i)}>
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-btn"
              onClick={() => addItem("cursos", { curso: "", instituicao: "", inicio: "", fim: "" })}
            >
              + Adicionar curso
            </button>
          </div>

          {/* Experiências */}
          <div className="dynamic-field">
            <label>Experiência Profissional</label>
            {form.experiencias.map((item, i) => (
              <div key={i} className="multi-input">
                <input
                  placeholder="Empresa"
                  value={item.empresa}
                  onChange={(e) => handleArrayChange(i, "experiencias", "empresa", capitalize(e.target.value))}
                />
                <input
                  placeholder="Cargo"
                  value={item.cargo}
                  onChange={(e) => handleArrayChange(i, "experiencias", "cargo", capitalize(e.target.value))}
                />
                <select
                  value={item.status || ""}
                  onChange={(e) => handleArrayChange(i, "experiencias", "status", e.target.value)}
                >
                  <option value="">Status</option>
                  <option>Concluído</option>
                  <option>Cursando</option>
                </select>
                <input
                  type="month"
                  value={item.inicio}
                  onChange={(e) => handleArrayChange(i, "experiencias", "inicio", e.target.value)}
                />
                <input
                  type="month"
                  value={item.fim}
                  onChange={(e) => handleArrayChange(i, "experiencias", "fim", e.target.value)}
                />
                <label>Atribuições</label>
                {(item.atribuicoes || []).map((atr, j) => (
                  <input
                    key={j}
                    placeholder={`Atribuição ${j + 1}`}
                    value={atr}
                    onChange={(e) => {
                      const exp = [...form.experiencias];
                      exp[i].atribuicoes[j] = capitalize(e.target.value);
                      setForm((prev) => ({ ...prev, experiencias: exp }));
                    }}
                  />
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
                <button type="button" className="remove-btn" onClick={() => removeItem("experiencias", i)}>
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-btn"
              onClick={() =>
                addItem("experiencias", { empresa: "", cargo: "", status: "", inicio: "", fim: "", atribuicoes: [] })
              }
            >
              + Adicionar experiência
            </button>
          </div>

          {/* Idiomas */}
          <div className="dynamic-field">
            <label>Idiomas</label>
            {form.idiomas.map((item, i) => (
              <div key={i} className="multi-input">
                <input
                  placeholder="Idioma"
                  value={item.idioma}
                  onChange={(e) => handleArrayChange(i, "idiomas", "idioma", capitalize(e.target.value))}
                />
                <select
                  value={item.nivel}
                  onChange={(e) => handleArrayChange(i, "idiomas", "nivel", e.target.value)}
                >
                  <option value="">Nível</option>
                  <option>Básico</option>
                  <option>Intermediário</option>
                  <option>Avançado</option>
                  <option>Fluente</option>
                </select>
                <button type="button" className="remove-btn" onClick={() => removeItem("idiomas", i)}>
                  Remover
                </button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={() => addItem("idiomas", { idioma: "", nivel: "" })}>
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
