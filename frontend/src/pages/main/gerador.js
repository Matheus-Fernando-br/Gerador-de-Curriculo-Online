import React, { useState } from "react";
import "./gerador.css";
import "../../App.css";
import "./pdf.css"; // arquivo que você disse que está na mesma pasta do "Curriculo impresso"
import Login from "../../components/login/login";
import html2pdf from "html2pdf.js";

function Gerador() {
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cnhVisible, setCnhVisible] = useState(false); // controla se o campo CNH aparece como dynamic-field

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const togglePreview = () => setPreviewOpen((s) => !s);

  // saferCapitalize: primeira letra maiúscula de cada palavra
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

  // formata telefone enquanto digita
  const formatPhone = (onlyDigits) => {
    const d = onlyDigits.replace(/\D/g, "");
    let out = d;
    if (d.length <= 2) {
      out = "(" + d;
    } else if (d.length <= 6) {
      out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    } else if (d.length <= 10) {
      out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(
        d.length - 4
      )}`;
    } else {
      out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
    }
    return out;
  };

  // onChange global
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "telefone") {
      const digits = val.replace(/\D/g, "").slice(0, 11);
      val = formatPhone(digits);
    }

    if (name === "email") {
      val = val.toLowerCase();
    }

    if (name === "cnh") {
      val = val.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
    }

    if (name === "nome" || name === "cidade") {
      val = saferCapitalize(val);
    }

    setForm((prev) => ({ ...prev, [name]: val }));
  };

  // arrays dinâmicos
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

  // Calcula idade em anos a partir de data_nascimento (YYYY-MM-DD)
  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Gera PDF usando html2pdf (100% frontend)
  const gerarPDF = async () => {
    // validação mínima
    if (!form.nome || !form.email || !form.telefone || !form.objetivo) {
      alert("Preencha os campos obrigatórios: Nome, Email, Telefone, Objetivo.");
      return;
    }

    setLoading(true);
    try {
      const elemento = document.getElementById("preview-curriculo");
      // garante que o preview exista e esteja atualizado
      if (!elemento) throw new Error("Elemento do currículo não encontrado.");

      const opt = {
        margin: [10, 10, 10, 10], // mm top/right/bottom/left
        filename: `curriculo_${(form.nome || "usuario").replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Força abrir preview temporariamente para renderizar corretamente caso esteja fechado
      const wasPreviewOpen = previewOpen;
      if (!wasPreviewOpen) {
        setPreviewOpen(true);
        // small pause para o DOM pintar (suficiente na maioria dos cenários)
        await new Promise((r) => setTimeout(r, 120));
      }

      html2pdf().set(opt).from(elemento).save();

      // restaura preview para estado anterior
      if (!wasPreviewOpen) setPreviewOpen(false);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Erro ao gerar PDF. Veja o console para detalhes.");
    } finally {
      setLoading(false);
    }
  };

  // handleSubmit apenas chama gerarPDF (já frontend)
  const handleSubmit = (e) => {
    e && e.preventDefault();
    gerarPDF();
  };

  // Função utilitária para formatar período (month inputs YYYY-MM)
  const formatPeriodo = (inicio, fim, status) => {
    if (!inicio && !fim) return "";
    const fmt = (m) => {
      if (!m) return "";
      const [y, mm] = m.split("-");
      return `${mm}/${y}`;
    };
    if (status === "Cursando") return `${fmt(inicio)} - Atual`;
    return `${fmt(inicio)} - ${fmt(fim)}`;
  };

  return (
    <div className="app-container gerador-container">
      <nav className="top-navbar">
        <div className="left-section">
          <a href="#top">
            <img src="/logo.png" alt="Logo" className="logo" />
          </a>
        </div>
        <div className={`right-section ${menuOpen ? "open" : ""}`}>
          <a href="/" onClick={() => setMenuOpen(false)}>
            Voltar para a página inicial
          </a>
          <Login />
        </div>

        {/* BOTÃO HAMBÚRGUER */}
        <div className="menu-toggle" onClick={toggleMenu}>
          <i className={`bi ${menuOpen ? "bi-x" : "bi-list"}`}></i>
        </div>
      </nav>

      <div className="form-section" id="form-section">
        <h1 style={{ textAlign: "center" }}>GERADOR DE CURRÍCULO ONLINE</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-grid">
            <div className="form-row">
              <label className="field-label">
                Nome
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="Digite seu nome completo"
                />
              </label>
            </div>

            <label className="field-label">
              Telefone
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="Apenas números"
                required
              />
            </label>

            <label className="field-label">
              Email
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                required
                placeholder="nome@exemplo.com"
              />
            </label>

            <label className="field-label">
              Cidade
              <input
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                placeholder="Informe sua cidade"
              />
            </label>

            <label className="field-label">
              Data de nascimento
              <input
                name="data_nascimento"
                value={form.data_nascimento}
                onChange={handleChange}
                type="date"
              />
            </label>

            {/* CNH agora só aparece quando o usuário clicar em adicionar (movei para baixo após idiomas) */}
            <div className="form-row">
              <label className="field-label">
                Objetivo Profissional
                <textarea
                  name="objetivo"
                  value={form.objetivo}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="Digite aqui o seus objetivos e metas"
                />
              </label>
            </div>
          </div>

          {/* Formação Acadêmica */}
          <div className="dynamic-field">
            <div className="section-title">Formação Acadêmica</div>
            {form.formacoes.map((item, i) => {
              const status = item.status || "";
              return (
                <div
                  key={i}
                  className={`multi-input ${Array.isArray(item.atribuicoes) ? "" : "stack"}`}
                >
                  <label className="field-label">
                    Nome da Formação
                    <input
                      placeholder="Engenharia, Medicina..."
                      value={item.curso}
                      onChange={(e) =>
                        handleArrayChange(i, "formacoes", "curso", saferCapitalize(e.target.value))
                      }
                    />
                  </label>
                  <label className="field-label">
                    Nome da Instituição
                    <input
                      placeholder="Informe o nome da instituição"
                      value={item.escola}
                      onChange={(e) =>
                        handleArrayChange(i, "formacoes", "escola", saferCapitalize(e.target.value))
                      }
                    />
                  </label>
                  <label className="field-label">
                    Status da Formação
                    <select
                      value={status}
                      onChange={(e) => handleArrayChange(i, "formacoes", "status", e.target.value)}
                    >
                      <option value="">Status</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cursando">Cursando</option>
                      <option value="Trancado">Trancado</option>
                    </select>
                  </label>

                  <label className="field-label">
                    Data de Início
                    <input
                      type="month"
                      value={item.inicio}
                      onChange={(e) => handleArrayChange(i, "formacoes", "inicio", e.target.value)}
                    />
                  </label>

                  <div className={`hide-animate ${status === "Cursando" ? "hidden" : ""}`}>
                    <label className="field-label">
                      Data de Término
                      <input
                        type="month"
                        value={item.fim}
                        onChange={(e) => handleArrayChange(i, "formacoes", "fim", e.target.value)}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeItem("formacoes", i)}
                  >
                    Remover Formação
                  </button>
                  <hr className="divider" />
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
                <label className="field-label">Descrição do Conhecimento</label>
                <input
                  placeholder="Informe um conhecimento (ex: Pacote Office, Python, etc.)"
                  value={item.descricao}
                  onChange={(e) => handleArrayChange(i, "conhecimentos", "descricao", e.target.value)}
                />
                <button type="button" className="remove-btn" onClick={() => removeItem("conhecimentos", i)}>
                  Remover conhecimento
                </button>
                <hr className="divider" />
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
                  <label className="field-label">
                    Nome do Curso
                    <input
                      placeholder="Informe o nome do curso"
                      value={item.curso}
                      onChange={(e) => handleArrayChange(i, "cursos", "curso", saferCapitalize(e.target.value))}
                    />
                  </label>
                  <label className="field-label">
                    Nome da Instituição
                    <input
                      placeholder="Informe o nome da instituição"
                      value={item.instituicao}
                      onChange={(e) =>
                        handleArrayChange(i, "cursos", "instituicao", saferCapitalize(e.target.value))
                      }
                    />
                  </label>
                  <label className="field-label">
                    Status do Curso
                    <select value={status} onChange={(e) => handleArrayChange(i, "cursos", "status", e.target.value)}>
                      <option value="">Status</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cursando">Cursando</option>
                    </select>
                  </label>

                  <label className="field-label">
                    Data de Início
                    <input
                      type="month"
                      value={item.inicio}
                      onChange={(e) => handleArrayChange(i, "cursos", "inicio", e.target.value)}
                    />
                  </label>

                  <div className={`hide-animate ${status === "Cursando" ? "hidden" : ""}`}>
                    <label className="field-label">
                      Data de Término
                      <input
                        type="month"
                        value={item.fim}
                        onChange={(e) => handleArrayChange(i, "cursos", "fim", e.target.value)}
                      />
                    </label>
                  </div>

                  <button type="button" className="remove-btn" onClick={() => removeItem("cursos", i)}>
                    Remover curso
                  </button>
                  <hr className="divider" />
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
                  <label className="field-label">
                    Nome da Empresa
                    <input
                      placeholder="Informe o nome da empresa"
                      value={item.empresa}
                      onChange={(e) =>
                        handleArrayChange(i, "experiencias", "empresa", saferCapitalize(e.target.value))
                      }
                    />
                  </label>
                  <label className="field-label">
                    Cargo
                    <input
                      placeholder="Informe o nome do cargo"
                      value={item.cargo}
                      onChange={(e) => handleArrayChange(i, "experiencias", "cargo", saferCapitalize(e.target.value))}
                    />
                  </label>

                  <button type="button" className="remove-btn" onClick={() => removeItem("experiencias", i)}>
                    Remover experiência
                  </button>

                  <label className="field-label">
                    Data de Início
                    <input
                      type="month"
                      value={item.inicio}
                      onChange={(e) => handleArrayChange(i, "experiencias", "inicio", e.target.value)}
                    />
                  </label>

                  <div className={`hide-animate ${atual ? "hidden" : ""}`}>
                    <label className="field-label">
                      Data de Término
                      <input
                        type="month"
                        value={item.fim}
                        onChange={(e) => handleArrayChange(i, "experiencias", "fim", e.target.value)}
                      />
                    </label>
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginLeft: "2vw",
                      marginTop: "2.7rem",
                      justifyContent: "center",
                    }}
                  >
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
                            exp[i].atribuicoes[j] = e.target.value;
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

                  <hr className="divider" />
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
                <label className="field-label">
                  Idioma
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
                </label>

                <label className="field-label">
                  Nível
                  <select value={item.nivel} onChange={(e) => handleArrayChange(i, "idiomas", "nivel", e.target.value)}>
                    <option value="">Nível</option>
                    <option value="Básico">Básico</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                    <option value="Fluente">Fluente</option>
                    <option value="Nativo">Nativo</option>
                  </select>
                </label>

                <button type="button" className="remove-btn" onClick={() => removeItem("idiomas", i)}>
                  Remover idioma
                </button>

                <hr className="divider" />
              </div>
            ))}

            <button type="button" className="add-btn" onClick={() => addItem("idiomas", { idioma: "", nivel: "" })}>
              + Adicionar idioma
            </button>
          </div>

          {/* CNH: botão para adicionar (aparece como dynamic-field abaixo de idiomas) */}
         <div className="dynamic-field form-row">
          <div className="section-title">CNH</div>

          {!cnhVisible ? (
            <button
              type="button"
              className="add-btn"
              onClick={() => setCnhVisible(true)}
            >
              + Adicionar CNH
            </button>
          ) : (
            <div className="multi-input stack" style={{ width: "100%" }}>
              <label className="field-label">Categoria da CNH</label>

              <input
                name="cnh"
                value={form.cnh}
                onChange={handleChange}
                placeholder="Informe sua categoria"
                style={{ width: "100%" }}
              />

              <button
                type="button"
                className="remove-btn"
                onClick={() => {
                  setForm((p) => ({ ...p, cnh: "" }));
                  setCnhVisible(false);
                }}
              >
                Remover CNH
              </button>
            </div>
          )}
        </div>

                {/* Caixa do botão Preview (borda branca) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "2px solid #fff",
            padding: "8px 12px",
            borderRadius: "8px",
            width: "fit-content",
            margin: "10px auto 20px auto",
            cursor: "pointer",
            background: "transparent",
          }}
          onClick={togglePreview}
        >
          <i className="bi bi-eye" style={{ fontSize: "18px", color: "#fff" }} />
          <span style={{ color: "#fff", fontWeight: 700 }} id="#preview-curriculo">Preview do Currículo</span>
        </div>

          <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: "1.6rem" }}>
            {loading ? "Gerando..." : "Gerar Currículo"}
          </button>
        </form>

        {/* PREVIEW: escondido por padrão; aparece quando previewOpen === true */}
        {/** Este elemento é o que será convertido para PDF (id="preview-curriculo") */}
        <div
          id="preview-curriculo"
          style={{
            display: previewOpen ? "block" : "none",
            width: "210mm",
            minHeight: "297mm",
            padding: "20mm",
            margin: "20px auto",
            background: "#fff",
            color: "#000",
            boxShadow: "0 0 8px rgba(0,0,0,0.1)",
            boxSizing: "border-box",
            fontFamily: "Arial, sans-serif" ,
          }}
        >
          {/* Header centralizado */}
          <div style={{ textAlign: "center", marginBottom: "8px", fontFamily: "Arial, sans-serif" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "18pt",
                fontWeight: 1000,
                fontFamily: "Arial, sans-serif",
              }}
            >
              {form.nome || "NOME COMPLETO"}
            </h1>

            <p
              style={{
                margin: "15px 0 0 0",
                fontSize: "11pt",
                fontFamily: "Arial, sans-serif",
                fontWeight: 400,
                fontStyle: "italic",
                color: "#222",
              }}
            >
              {/* email | telefone | idade | cidade */}
              {form.email ? form.email : "email@exemplo.com"}
              {" | "}
              {form.telefone ? form.telefone : "(00) 00000-0000"}
              {" | "}
              {form.data_nascimento ? `${calculateAge(form.data_nascimento)} anos` : "idade"}
              {" | "}
              {form.cidade ? form.cidade : "Cidade"}
            </p>
          </div>

          <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #bebebeff" }} />

          {/* Objetivo */}
          <section style={{ marginBottom: "10px", fontFamily: "Arial, sans-serif" }}>
            <div style={{ fontSize: "14pt", fontWeight: 800, fontFamily: "Arial, sans-serif", marginTop: "5px"}}>Objetivo</div>
            <div style={{ fontSize: "12pt", marginTop: "6px", marginLeft:"6px", whiteSpace: "pre-wrap" }}>
              {form.objetivo || "-"}
            </div>
          </section>

          {/* Formação */}
          <section style={{ marginBottom: "20px", fontFamily: "Arial, sans-serif" }}>

            <div style={{ fontSize: "14pt", fontWeight: 800, marginBottom: "10px" }}>
              Formação Acadêmica
            </div>

            {form.formacoes.length === 0 && (
              <div style={{ fontSize: "12pt", marginLeft: "6px" }}>-</div>
            )}

            {form.formacoes.map((f, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>

                {/* CURSO (negrito + itálico)  +  ESCOLA (normal) NA MESMA LINHA */}
                <div style={{ fontSize: "12pt", marginBottom: "3px", marginTop:"15px" }}>
                  <span style={{ fontWeight: 600, fontStyle: "italic"}}>• {f.curso}</span>
                  {" - "}
                  <span>{f.escola}</span>
                </div>

                {/* PERÍODO */}
                <div style={{ fontSize: "12pt", marginLeft: "12px" }}>
                  {f.inicio || f.fim ? `${formatPeriodo(f.inicio, f.fim, f.status)}` : ""}
                </div>

              </div>
            ))}

          </section>



          {/* Experiências */}
          <section style={{ marginBottom: "10px", fontFamily: "Arial, sans-serif" }}>
            <div style={{ fontSize: "14pt", fontWeight: 800 }}>Experiência Profissional</div>
            <div style={{ marginTop: "6px" }}>
              {form.experiencias.length === 0 && <div style={{ fontSize: "12pt" }}>-</div>}
              {form.experiencias.map((exp, i) => (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <div style={{ fontSize: "12pt", fontWeight: 600, marginTop:"15px"}}>➢ {exp.cargo} — {exp.empresa}</div>
                  <div style={{ fontSize: "12pt", marginLeft:"23px", marginTop:"6px" }}>{formatPeriodo(exp.inicio, exp.fim, exp.trabalhoAtual ? "Cursando" : "")}</div>
                  {(exp.atribuicoes || []).length > 0 && (
                    <ul style={{ margin: "6px 0 0 35px", fontSize: "12pt" }}>
                      {exp.atribuicoes.map((a, j) => (
                        <li key={j}>{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Cursos e Conhecimentos lado a lado (se quiser) */}
          <section style={{ marginBottom: "10px", fontFamily: "Arial, sans-serif" }}>
            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14pt", fontWeight: 800 }}>Cursos</div>

                {form.cursos.length === 0 && (
                  <div style={{ fontSize: "12pt" }}>-</div>
                )}

                {form.cursos.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      marginTop: "15px",
                      marginLeft: "6px",
                      fontSize: "12pt",
                      marginBottom: "3px"
                    }}
                  >
                    <span style={{ fontWeight: 600, fontStyle: "italic" }}>
                      • {c.curso}
                    </span>
                    {" - "}
                    <span style={{ fontWeight: 400 }}>{c.instituicao}</span>

                    <div style={{ marginTop: "6px", fontSize: "12pt", marginLeft: "18px" }}>
                      {c.inicio || c.fim
                        ? `${formatPeriodo(c.inicio, c.fim, c.status)}`
                        : ""}
                    </div>
                  </div>
                ))}
                
              </div>

              <div style={{ width: "240px" }}>
                <div style={{ fontSize: "14pt", fontWeight: 800 }}>Conhecimentos</div>
                <div style={{ marginTop: "6px", fontSize: "12pt" }}>
                  {form.conhecimentos.length === 0 && <div>-</div>}
                  <ul style={{ marginLeft: "18px" }}>
                    {form.conhecimentos.map((k, i) => (
                      <li key={i}>{k.descricao}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Idiomas e CNH */}
          <section style={{ marginBottom: "10px", fontFamily: "Arial, sans-serif" }}>
            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14pt", fontWeight: 800 }}>Idiomas</div>
                <div style={{ marginTop: "6px", fontSize: "12pt" }}>
                  {form.idiomas.length === 0 && <div>-</div>}
                  <ul style={{ marginLeft: "23px" }}>
                    {form.idiomas.map((l, i) => (
                      <li key={i}>{l.idioma} — {l.nivel}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CNH só aparece no currículo se cnhVisible for true e form.cnh tiver valor */}
              <div style={{ width: "240px" }}>
                {cnhVisible && form.cnh && (
                  <>
                    <div style={{ fontSize: "14pt", fontWeight: 800 }}>CNH</div>
                    <div style={{ marginTop: "6px", fontSize: "12pt" }}>{form.cnh}</div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
        </div>
        </div>
      
  );
}

export default Gerador;
