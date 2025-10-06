import React, { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    data_nascimento: "",
    objetivo: "",
    cursos: [""],
    experiencias: [""],
    cnh: "",
    idioma: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Atualiza campos dinâmicos (cursos/experiências)
  const handleArrayChange = (index, field, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const addItem = (field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Monta cursos e experiências como texto com \n
    const dataToSend = {
      ...form,
      cursos: form.cursos.join("\n"),
      experiencias: form.experiencias.join("\n")
    };

    try {
      const res = await fetch("http://localhost:5000/generate_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });

      if (!res.ok) throw new Error("Erro ao gerar PDF");

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
        <h1>GERADOR DE CURRÍCULO ONLINNE</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-grid">
            <label>
              Nome
              <input name="nome" value={form.nome} onChange={handleChange} required />
            </label>
            <label>
              Telefone
              <input name="telefone" value={form.telefone} onChange={handleChange} />
            </label>
            <label>
              Email
              <input name="email" value={form.email} onChange={handleChange} type="email" />
            </label>
            <label>
              Data de nascimento
              <input name="data_nascimento" value={form.data_nascimento} onChange={handleChange} type="date" />
            </label>
          </div>

          <label>
            Objetivo
            <textarea name="objetivo" value={form.objetivo} onChange={handleChange} rows={3} />
          </label>

          <div className="dynamic-field">
            <label>Cursos</label>
            {form.cursos.map((curso, i) => (
              <input
                key={i}
                value={curso}
                placeholder={`Curso ${i + 1}`}
                onChange={(e) => handleArrayChange(i, "cursos", e.target.value)}
              />
            ))}
            <button type="button" className="add-btn" onClick={() => addItem("cursos")}>
              + Adicionar curso
            </button>
          </div>

          <div className="dynamic-field">
            <label>Experiências</label>
            {form.experiencias.map((exp, i) => (
              <input
                key={i}
                value={exp}
                placeholder={`Experiência ${i + 1}`}
                onChange={(e) => handleArrayChange(i, "experiencias", e.target.value)}
              />
            ))}
            <button type="button" className="add-btn" onClick={() => addItem("experiencias")}>
              + Adicionar experiência
            </button>
          </div>

          <div className="input-grid">
            <label>
              CNH
              <input name="cnh" value={form.cnh} onChange={handleChange} />
            </label>
            <label>
              Idiomas
              <input name="idioma" value={form.idioma} onChange={handleChange} />
            </label>
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
