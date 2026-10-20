// src/pages/plus/plus.js
// Área exclusiva do Plano Plus (rota protegida por login).
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "../../App.css";
import "../main/gerador.css";
import "./plus.css";
import { getUsuario, logout, whatsappLink } from "../../auth/auth";

/* ============================================================
   CONFIGURAÇÕES
============================================================ */
const STORAGE_KEY = "gc_plus_curriculo_v1";

const SECOES_PADRAO = [
  { id: "objetivo", titulo: "Objetivo", visivel: true },
  { id: "formacoes", titulo: "Formação Acadêmica", visivel: true },
  { id: "experiencias", titulo: "Experiência Profissional", visivel: true },
  { id: "cursos", titulo: "Cursos", visivel: true },
  { id: "conhecimentos", titulo: "Conhecimentos", visivel: true },
  { id: "idiomas", titulo: "Idiomas", visivel: true },
  { id: "cnh", titulo: "CNH", visivel: true },
];

const TITULOS_PADRAO = Object.fromEntries(SECOES_PADRAO.map((s) => [s.id, s.titulo]));

const MODELOS = [
  { id: "classico", nome: "Clássico", desc: "Centralizado e sóbrio" },
  { id: "moderno", nome: "Moderno", desc: "Títulos coloridos à esquerda" },
  { id: "executivo", nome: "Executivo", desc: "Cabeçalho em faixa de cor" },
  { id: "minimalista", nome: "Minimalista", desc: "Leve, com muito respiro" },
];

const CORES = ["#1d1d1f", "#0071e3", "#1f6f50", "#8944ab", "#c4003b", "#b25000"];

const FONTES = [
  { id: "Arial, Helvetica, sans-serif", nome: "Arial" },
  { id: "Helvetica, Arial, sans-serif", nome: "Helvetica" },
  { id: "Georgia, 'Times New Roman', serif", nome: "Georgia" },
  { id: "'Times New Roman', Times, serif", nome: "Times" },
  { id: "Verdana, Geneva, sans-serif", nome: "Verdana" },
  { id: "'Trebuchet MS', Arial, sans-serif", nome: "Trebuchet" },
];

const TAMANHOS = { pequeno: 10.5, medio: 11.5, grande: 12.5 };
const ESPACAMENTOS = { compacto: 0.7, normal: 1, amplo: 1.35 };

const IDIOMAS = [
  "Alemão", "Árabe", "Chinês (Mandarim)", "Coreano", "Espanhol", "Francês", "Hindi",
  "Holandês", "Inglês", "Italiano", "Japonês", "Português", "Russo", "Sueco", "Turco",
];
const NIVEIS = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"];

const CONTATOS_SUGERIDOS = ["LinkedIn", "GitHub", "Portfólio", "Site", "Instagram"];

const ESTADO_INICIAL = {
  dados: {
    nome: "",
    cargo: "",
    email: "",
    telefone: "",
    cidade: "",
    data_nascimento: "",
    objetivo: "",
    cnh: "",
  },
  mostrar: { email: true, telefone: true, idade: true, cidade: true },
  contatos: [],
  formacoes: [],
  experiencias: [],
  cursos: [],
  conhecimentos: [],
  idiomas: [],
  secoes: SECOES_PADRAO,
  estilo: {
    modelo: "moderno",
    cor: "#0071e3",
    fonte: FONTES[0].id,
    tamanho: "medio",
    espacamento: "normal",
    alinhamento: "esquerda",
    divisores: true,
  },
};

const ABAS = [
  { id: "conteudo", nome: "Conteúdo", icone: "bi-pencil-square", cor: "blue" },
  { id: "secoes", nome: "Títulos e seções", icone: "bi-type", cor: "purple" },
  { id: "formatacao", nome: "Formatação", icone: "bi-palette-fill", cor: "pink" },
  { id: "campos", nome: "Campos", icone: "bi-ui-checks", cor: "orange" },
  { id: "suporte", nome: "Suporte", icone: "bi-headset", cor: "green" },
];

/* ============================================================
   UTILITÁRIOS
============================================================ */
const capitalizar = (t) =>
  (t || "")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");

const formatarTelefone = (valor) => {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(d.length - 4)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
};

const calcularIdade = (dob) => {
  if (!dob) return "";
  const hoje = new Date();
  const nasc = new Date(dob);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
};

const formatarPeriodo = (inicio, fim, atual) => {
  const fmt = (m) => {
    if (!m) return "";
    const [y, mm] = m.split("-");
    return `${mm}/${y}`;
  };
  if (!inicio && !fim) return "";
  if (atual) return `${fmt(inicio)} - Atual`;
  return [fmt(inicio), fmt(fim)].filter(Boolean).join(" - ");
};

const linhas = (texto) =>
  (texto || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const novoId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const carregar = () => {
  try {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!salvo) return ESTADO_INICIAL;
    return {
      ...ESTADO_INICIAL,
      ...salvo,
      dados: { ...ESTADO_INICIAL.dados, ...salvo.dados },
      mostrar: { ...ESTADO_INICIAL.mostrar, ...salvo.mostrar },
      estilo: { ...ESTADO_INICIAL.estilo, ...salvo.estilo },
    };
  } catch {
    return ESTADO_INICIAL;
  }
};

/* ============================================================
   COMPONENTES PEQUENOS
============================================================ */
function Segmentado({ opcoes, valor, onChange }) {
  return (
    <div className="segmented">
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          className={valor === o.id ? "active" : ""}
          onClick={() => onChange(o.id)}
        >
          {o.icone && <i className={`bi ${o.icone}`} />} {o.nome}
        </button>
      ))}
    </div>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <label className="switch-label">
      <input type="checkbox" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function Dica({ children }) {
  return (
    <div className="plus-tip">
      <i className="bi bi-lightbulb-fill" />
      <span>{children}</span>
    </div>
  );
}

function CardSecao({ icone, cor, titulo, children, acao }) {
  return (
    <div className="dynamic-field">
      <div className="section-title">
        <span className={`section-icon ${cor}`}>
          <i className={`bi ${icone}`} />
        </span>
        {titulo}
        {acao && <span className="section-title-action">{acao}</span>}
      </div>
      {children}
    </div>
  );
}

/* ============================================================
   PREVIEW DO CURRÍCULO PLUS
============================================================ */
function CurriculoPlus({ cv }) {
  const { dados, mostrar, contatos, estilo } = cv;
  const base = TAMANHOS[estilo.tamanho] || 11.5;
  const esp = ESPACAMENTOS[estilo.espacamento] || 1;
  const cor = estilo.cor;
  const centro = estilo.alinhamento === "centro";
  const modelo = estilo.modelo;

  const contatoItens = [
    mostrar.email && dados.email,
    mostrar.telefone && dados.telefone,
    mostrar.idade && dados.data_nascimento && `${calcularIdade(dados.data_nascimento)} anos`,
    mostrar.cidade && dados.cidade,
    ...contatos.filter((c) => c.valor).map((c) => `${c.rotulo}: ${c.valor}`),
  ].filter(Boolean);

  const pagina = {
    width: "210mm",
    minHeight: "296mm", // 1mm de folga evita uma página extra em branco no PDF
    padding: modelo === "executivo" ? "0 0 18mm" : "18mm",
    background: "#fff",
    color: "#1d1d1f",
    boxSizing: "border-box",
    fontFamily: estilo.fonte,
    fontSize: `${base}pt`,
    lineHeight: 1.4,
  };

  const corpo = modelo === "executivo" ? { padding: "0 18mm" } : {};

  // ----- Cabeçalho -----
  const cabecalhoAlinhamento = centro ? "center" : "left";
  let cabecalho;
  if (modelo === "executivo") {
    cabecalho = (
      <div style={{ background: cor, color: "#fff", padding: "14mm 18mm 10mm", marginBottom: `${16 * esp}px`, textAlign: cabecalhoAlinhamento }}>
        <div style={{ fontSize: `${base * 2}pt`, fontWeight: 700, letterSpacing: "0.5px" }}>{dados.nome || "Seu Nome Completo"}</div>
        {dados.cargo && <div style={{ fontSize: `${base * 1.15}pt`, marginTop: "4px", opacity: 0.9 }}>{dados.cargo}</div>}
        {contatoItens.length > 0 && (
          <div style={{ fontSize: `${base * 0.9}pt`, marginTop: "10px", opacity: 0.92 }}>{contatoItens.join("  |  ")}</div>
        )}
      </div>
    );
  } else {
    const nomeCor = modelo === "moderno" ? cor : "#1d1d1f";
    cabecalho = (
      <div style={{ textAlign: modelo === "classico" ? "center" : cabecalhoAlinhamento, marginBottom: `${14 * esp}px` }}>
        <div
          style={{
            fontSize: `${base * (modelo === "minimalista" ? 1.9 : 1.75)}pt`,
            fontWeight: modelo === "minimalista" ? 300 : 700,
            color: nomeCor,
            letterSpacing: modelo === "minimalista" ? "2px" : "0",
            textTransform: modelo === "minimalista" ? "uppercase" : "none",
          }}
        >
          {dados.nome || "Seu Nome Completo"}
        </div>
        {dados.cargo && (
          <div style={{ fontSize: `${base * 1.1}pt`, marginTop: "4px", color: modelo === "classico" ? "#444" : cor, fontWeight: 600 }}>
            {dados.cargo}
          </div>
        )}
        {contatoItens.length > 0 && (
          <div style={{ fontSize: `${base * 0.9}pt`, marginTop: "8px", color: "#555", fontStyle: modelo === "classico" ? "italic" : "normal" }}>
            {contatoItens.join("  |  ")}
          </div>
        )}
        {estilo.divisores && (
          <div style={{ marginTop: `${12 * esp}px`, borderTop: modelo === "moderno" ? `2px solid ${cor}` : "1px solid #c7c7cc" }} />
        )}
      </div>
    );
  }

  // ----- Título de seção -----
  const tituloSecao = (texto) => {
    const estilos = {
      classico: { fontSize: `${base * 1.2}pt`, fontWeight: 800, color: "#1d1d1f" },
      moderno: {
        fontSize: `${base * 1.1}pt`, fontWeight: 700, color: cor, textTransform: "uppercase",
        letterSpacing: "1px", borderLeft: `3px solid ${cor}`, paddingLeft: "8px",
      },
      executivo: {
        fontSize: `${base * 1.15}pt`, fontWeight: 700, color: cor,
        borderBottom: estilo.divisores ? `1.5px solid ${cor}` : "none", paddingBottom: "3px",
      },
      minimalista: {
        fontSize: `${base * 0.95}pt`, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "2.5px",
      },
    };
    return <div style={{ ...estilos[modelo], marginBottom: `${6 * esp}px` }}>{texto}</div>;
  };

  const secaoWrap = (id, titulo, conteudo) => (
    <section key={id} style={{ marginBottom: `${14 * esp}px`, pageBreakInside: "avoid" }}>
      {tituloSecao(titulo)}
      <div style={{ paddingLeft: modelo === "moderno" ? "11px" : 0 }}>{conteudo}</div>
    </section>
  );

  const vazio = <div style={{ color: "#8e8e93" }}>-</div>;
  const item = { marginBottom: `${8 * esp}px` };
  const sub = { color: "#555", fontSize: `${base * 0.92}pt`, marginTop: "2px" };

  const renderSecao = (s) => {
    if (!s.visivel) return null;
    switch (s.id) {
      case "objetivo":
        return secaoWrap(s.id, s.titulo, <div style={{ whiteSpace: "pre-wrap" }}>{dados.objetivo || "-"}</div>);
      case "formacoes":
        return secaoWrap(
          s.id,
          s.titulo,
          cv.formacoes.length === 0
            ? vazio
            : cv.formacoes.map((f, i) => (
                <div key={i} style={item}>
                  <span style={{ fontWeight: 700 }}>{f.curso || "Formação"}</span>
                  {f.escola && <span> — {f.escola}</span>}
                  <div style={sub}>
                    {[formatarPeriodo(f.inicio, f.fim, f.status === "Cursando"), f.status].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))
        );
      case "experiencias":
        return secaoWrap(
          s.id,
          s.titulo,
          cv.experiencias.length === 0
            ? vazio
            : cv.experiencias.map((e, i) => (
                <div key={i} style={item}>
                  <span style={{ fontWeight: 700 }}>{e.cargo || "Cargo"}</span>
                  {e.empresa && <span> — {e.empresa}</span>}
                  <div style={sub}>{formatarPeriodo(e.inicio, e.fim, e.atual)}</div>
                  {linhas(e.atribuicoes).length > 0 && (
                    <ul style={{ margin: "4px 0 0 18px", listStyle: "disc" }}>
                      {linhas(e.atribuicoes).map((a, j) => (
                        <li key={j} style={{ marginBottom: "2px" }}>{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
        );
      case "cursos":
        return secaoWrap(
          s.id,
          s.titulo,
          cv.cursos.length === 0
            ? vazio
            : cv.cursos.map((c, i) => (
                <div key={i} style={item}>
                  <span style={{ fontWeight: 700 }}>{c.curso || "Curso"}</span>
                  {c.instituicao && <span> — {c.instituicao}</span>}
                  <div style={sub}>
                    {[formatarPeriodo(c.inicio, c.fim, c.status === "Cursando"), c.status].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))
        );
      case "conhecimentos":
        return secaoWrap(
          s.id,
          s.titulo,
          cv.conhecimentos.filter(Boolean).length === 0 ? (
            vazio
          ) : (
            <ul style={{ margin: "0 0 0 18px", listStyle: "disc", columns: cv.conhecimentos.length > 4 ? 2 : 1 }}>
              {cv.conhecimentos.filter(Boolean).map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          )
        );
      case "idiomas":
        return secaoWrap(
          s.id,
          s.titulo,
          cv.idiomas.length === 0 ? (
            vazio
          ) : (
            <ul style={{ margin: "0 0 0 18px", listStyle: "disc" }}>
              {cv.idiomas.map((l, i) => (
                <li key={i}>
                  {l.idioma || "Idioma"}
                  {l.nivel && ` — ${l.nivel}`}
                </li>
              ))}
            </ul>
          )
        );
      case "cnh":
        return dados.cnh ? secaoWrap(s.id, s.titulo, <div>Categoria {dados.cnh}</div>) : null;
      default:
        // seção personalizada
        return secaoWrap(
          s.id,
          s.titulo || "Nova seção",
          linhas(s.itens).length === 0 ? (
            vazio
          ) : (
            <ul style={{ margin: "0 0 0 18px", listStyle: "disc" }}>
              {linhas(s.itens).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )
        );
    }
  };

  return (
    <div id="preview-plus" style={pagina}>
      {cabecalho}
      <div style={corpo}>{cv.secoes.map(renderSecao)}</div>
    </div>
  );
}

/* ============================================================
   PÁGINA
============================================================ */
export default function Plus() {
  const navigate = useNavigate();
  const usuario = getUsuario();
  const [cv, setCv] = useState(carregar);
  const [aba, setAba] = useState("conteudo");
  const [gerando, setGerando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [previewMobile, setPreviewMobile] = useState(false);
  const [escala, setEscala] = useState(0.6);
  const palcoRef = useRef(null);
  const folhaRef = useRef(null);
  const [alturaFolha, setAlturaFolha] = useState(1123);
  const editorRef = useRef(null);

  // Salva automaticamente no navegador
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
      setSalvo(true);
      const t = setTimeout(() => setSalvo(false), 1200);
      return () => clearTimeout(t);
    } catch {
      return undefined;
    }
  }, [cv]);

  // Ajusta a escala da folha A4 ao espaço disponível
  useLayoutEffect(() => {
    const palco = palcoRef.current;
    const folha = folhaRef.current;
    if (!palco || !folha) return undefined;
    const atualizar = () => {
      const largura = palco.clientWidth - 32;
      setEscala(Math.min(1, largura / 794));
      setAlturaFolha(folha.scrollHeight);
    };
    atualizar();
    const ro = new ResizeObserver(atualizar);
    ro.observe(palco);
    ro.observe(folha);
    return () => ro.disconnect();
  }, [previewMobile]);

  /* ----- atualizadores ----- */
  const setDados = (campo, valor) => setCv((p) => ({ ...p, dados: { ...p.dados, [campo]: valor } }));
  const setEstilo = (campo, valor) => setCv((p) => ({ ...p, estilo: { ...p.estilo, [campo]: valor } }));
  const setMostrar = (campo, valor) => setCv((p) => ({ ...p, mostrar: { ...p.mostrar, [campo]: valor } }));

  const setLista = (lista, fn) => setCv((p) => ({ ...p, [lista]: fn(p[lista]) }));
  const addItem = (lista, modelo) => setLista(lista, (l) => [...l, modelo]);
  const removeItem = (lista, i) => setLista(lista, (l) => l.filter((_, idx) => idx !== i));
  const editItem = (lista, i, campo, valor) =>
    setLista(lista, (l) => l.map((it, idx) => (idx === i ? (campo === null ? valor : { ...it, [campo]: valor }) : it)));

  const moverSecao = (i, dir) =>
    setLista("secoes", (l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const nova = [...l];
      [nova[i], nova[j]] = [nova[j], nova[i]];
      return nova;
    });

  const irParaAba = (id) => {
    setAba(id);
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sair = () => {
    logout();
    navigate("/");
  };

  const limparTudo = () => {
    if (window.confirm("Apagar todos os dados e voltar às configurações padrão?")) setCv(ESTADO_INICIAL);
  };

  const gerarPDF = async () => {
    if (!cv.dados.nome) {
      alert("Preencha pelo menos o seu nome antes de gerar o PDF.");
      setAba("conteudo");
      return;
    }
    const elemento = document.getElementById("preview-plus");
    if (!elemento) return;
    setGerando(true);
    try {
      await html2pdf()
        .set({
          margin: 0,
          filename: `curriculo_${cv.dados.nome.replace(/\s+/g, "_")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(elemento)
        .save();
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  const nomeSecao = (s) => (TITULOS_PADRAO[s.id] ? TITULOS_PADRAO[s.id] : "Seção personalizada");

  /* ============================================================
     ABAS DO EDITOR
  ============================================================ */
  const abaConteudo = (
    <>
      <Dica>
        Preencha seus dados abaixo. O currículo ao lado é atualizado <strong>na hora</strong> e tudo fica salvo
        automaticamente neste navegador.
      </Dica>

      <CardSecao icone="bi-person-fill" cor="blue" titulo="Dados pessoais">
        <div className="input-grid">
          <label className="field-label form-row">
            Nome completo
            <input value={cv.dados.nome} placeholder="Ex.: Maria Silva" onChange={(e) => setDados("nome", capitalizar(e.target.value))} />
          </label>
          <label className="field-label form-row">
            Cargo / título profissional <span className="badge-new">Plus</span>
            <input value={cv.dados.cargo} placeholder="Ex.: Analista de Marketing" onChange={(e) => setDados("cargo", e.target.value)} />
          </label>
          <label className="field-label">
            Email
            <input type="email" value={cv.dados.email} placeholder="nome@exemplo.com" onChange={(e) => setDados("email", e.target.value.toLowerCase())} />
          </label>
          <label className="field-label">
            Telefone
            <input value={cv.dados.telefone} placeholder="Apenas números" onChange={(e) => setDados("telefone", formatarTelefone(e.target.value))} />
          </label>
          <label className="field-label">
            Cidade
            <input value={cv.dados.cidade} placeholder="Sua cidade" onChange={(e) => setDados("cidade", capitalizar(e.target.value))} />
          </label>
          <label className="field-label">
            Data de nascimento
            <input type="date" value={cv.dados.data_nascimento} onChange={(e) => setDados("data_nascimento", e.target.value)} />
          </label>
          <label className="field-label form-row">
            Objetivo profissional
            <textarea rows={4} value={cv.dados.objetivo} placeholder="Descreva seus objetivos e metas" onChange={(e) => setDados("objetivo", e.target.value)} />
          </label>
        </div>
      </CardSecao>

      <CardSecao icone="bi-mortarboard-fill" cor="purple" titulo="Formação acadêmica">
        {cv.formacoes.map((f, i) => (
          <div key={i} className="multi-input">
            <label className="field-label">
              Formação
              <input value={f.curso} placeholder="Engenharia, Medicina…" onChange={(e) => editItem("formacoes", i, "curso", capitalizar(e.target.value))} />
            </label>
            <label className="field-label">
              Instituição
              <input value={f.escola} placeholder="Nome da instituição" onChange={(e) => editItem("formacoes", i, "escola", capitalizar(e.target.value))} />
            </label>
            <label className="field-label">
              Status
              <select value={f.status} onChange={(e) => editItem("formacoes", i, "status", e.target.value)}>
                <option value="">Status</option>
                <option>Concluído</option>
                <option>Cursando</option>
                <option>Trancado</option>
              </select>
            </label>
            <label className="field-label">
              Início
              <input type="month" value={f.inicio} onChange={(e) => editItem("formacoes", i, "inicio", e.target.value)} />
            </label>
            <div className={`hide-animate ${f.status === "Cursando" ? "hidden" : ""}`}>
              <label className="field-label">
                Término
                <input type="month" value={f.fim} onChange={(e) => editItem("formacoes", i, "fim", e.target.value)} />
              </label>
            </div>
            <button type="button" className="remove-btn" onClick={() => removeItem("formacoes", i)}>
              <i className="bi bi-trash3" /> Remover
            </button>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={() => addItem("formacoes", { curso: "", escola: "", status: "", inicio: "", fim: "" })}>
          <i className="bi bi-plus-circle-fill" /> Adicionar formação
        </button>
      </CardSecao>

      <CardSecao icone="bi-briefcase-fill" cor="indigo" titulo="Experiência profissional">
        {cv.experiencias.map((x, i) => (
          <div key={i} className="multi-input">
            <label className="field-label">
              Empresa
              <input value={x.empresa} placeholder="Nome da empresa" onChange={(e) => editItem("experiencias", i, "empresa", capitalizar(e.target.value))} />
            </label>
            <label className="field-label">
              Cargo
              <input value={x.cargo} placeholder="Nome do cargo" onChange={(e) => editItem("experiencias", i, "cargo", capitalizar(e.target.value))} />
            </label>
            <Switch checked={!!x.atual} onChange={(v) => editItem("experiencias", i, "atual", v)} label="Trabalho atual" />
            <label className="field-label">
              Início
              <input type="month" value={x.inicio} onChange={(e) => editItem("experiencias", i, "inicio", e.target.value)} />
            </label>
            <div className={`hide-animate ${x.atual ? "hidden" : ""}`}>
              <label className="field-label">
                Término
                <input type="month" value={x.fim} onChange={(e) => editItem("experiencias", i, "fim", e.target.value)} />
              </label>
            </div>
            <button type="button" className="remove-btn" onClick={() => removeItem("experiencias", i)}>
              <i className="bi bi-trash3" /> Remover
            </button>
            <label className="field-label full-row">
              Atribuições <span className="helper">uma por linha</span>
              <textarea
                rows={3}
                value={x.atribuicoes}
                placeholder={"Atendimento ao cliente\nControle de estoque"}
                onChange={(e) => editItem("experiencias", i, "atribuicoes", e.target.value)}
              />
            </label>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={() => addItem("experiencias", { empresa: "", cargo: "", atual: false, inicio: "", fim: "", atribuicoes: "" })}>
          <i className="bi bi-plus-circle-fill" /> Adicionar experiência
        </button>
      </CardSecao>

      <CardSecao icone="bi-journal-bookmark-fill" cor="green" titulo="Cursos">
        {cv.cursos.map((c, i) => (
          <div key={i} className="multi-input">
            <label className="field-label">
              Curso
              <input value={c.curso} placeholder="Nome do curso" onChange={(e) => editItem("cursos", i, "curso", capitalizar(e.target.value))} />
            </label>
            <label className="field-label">
              Instituição
              <input value={c.instituicao} placeholder="Nome da instituição" onChange={(e) => editItem("cursos", i, "instituicao", capitalizar(e.target.value))} />
            </label>
            <label className="field-label">
              Status
              <select value={c.status} onChange={(e) => editItem("cursos", i, "status", e.target.value)}>
                <option value="">Status</option>
                <option>Concluído</option>
                <option>Cursando</option>
              </select>
            </label>
            <label className="field-label">
              Início
              <input type="month" value={c.inicio} onChange={(e) => editItem("cursos", i, "inicio", e.target.value)} />
            </label>
            <div className={`hide-animate ${c.status === "Cursando" ? "hidden" : ""}`}>
              <label className="field-label">
                Término
                <input type="month" value={c.fim} onChange={(e) => editItem("cursos", i, "fim", e.target.value)} />
              </label>
            </div>
            <button type="button" className="remove-btn" onClick={() => removeItem("cursos", i)}>
              <i className="bi bi-trash3" /> Remover
            </button>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={() => addItem("cursos", { curso: "", instituicao: "", status: "", inicio: "", fim: "" })}>
          <i className="bi bi-plus-circle-fill" /> Adicionar curso
        </button>
      </CardSecao>

      <CardSecao icone="bi-lightbulb-fill" cor="orange" titulo="Conhecimentos">
        {cv.conhecimentos.map((k, i) => (
          <div key={i} className="atribuicao-item">
            <input value={k} placeholder="Ex.: Pacote Office, Python…" onChange={(e) => editItem("conhecimentos", i, null, e.target.value)} />
            <button type="button" className="remove-btn icon-only" aria-label="Remover conhecimento" onClick={() => removeItem("conhecimentos", i)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={() => addItem("conhecimentos", "")}>
          <i className="bi bi-plus-circle-fill" /> Adicionar conhecimento
        </button>
      </CardSecao>

      <CardSecao icone="bi-translate" cor="pink" titulo="Idiomas">
        {cv.idiomas.map((l, i) => (
          <div key={i} className="multi-input">
            <label className="field-label">
              Idioma
              <select value={l.idioma} onChange={(e) => editItem("idiomas", i, "idioma", e.target.value)}>
                <option value="">Selecione</option>
                {IDIOMAS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Nível
              <select value={l.nivel} onChange={(e) => editItem("idiomas", i, "nivel", e.target.value)}>
                <option value="">Nível</option>
                {NIVEIS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <button type="button" className="remove-btn" onClick={() => removeItem("idiomas", i)}>
              <i className="bi bi-trash3" /> Remover
            </button>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={() => addItem("idiomas", { idioma: "", nivel: "" })}>
          <i className="bi bi-plus-circle-fill" /> Adicionar idioma
        </button>
      </CardSecao>

      <CardSecao icone="bi-car-front-fill" cor="teal" titulo="CNH">
        <label className="field-label">
          Categoria (deixe vazio para não exibir)
          <input value={cv.dados.cnh} placeholder="Ex.: AB" onChange={(e) => setDados("cnh", e.target.value.replace(/[^0-9A-Za-z]/g, "").toUpperCase())} />
        </label>
      </CardSecao>

      {cv.secoes.some((s) => !TITULOS_PADRAO[s.id]) && (
        <Dica>
          Suas seções personalizadas são editadas na aba{" "}
          <button type="button" className="link-btn" onClick={() => irParaAba("secoes")}>
            Títulos e seções
          </button>
          .
        </Dica>
      )}
    </>
  );

  const abaSecoes = (
    <>
      <Dica>
        <strong>Renomeie</strong> qualquer título digitando no campo, use as <strong>setas</strong> para mudar a ordem e o
        <strong> interruptor</strong> para mostrar ou esconder a seção.
      </Dica>

      <CardSecao
        icone="bi-list-ol"
        cor="purple"
        titulo="Ordem e títulos"
        acao={
          <button
            type="button"
            className="ghost-btn"
            onClick={() =>
              setLista("secoes", (l) => l.map((s) => (TITULOS_PADRAO[s.id] ? { ...s, titulo: TITULOS_PADRAO[s.id] } : s)))
            }
          >
            <i className="bi bi-arrow-counterclockwise" /> Restaurar títulos
          </button>
        }
      >
        <div className="section-list">
          {cv.secoes.map((s, i) => (
            <div key={s.id} className={`section-row ${s.visivel ? "" : "is-hidden"}`}>
              <div className="section-order">
                <button type="button" aria-label="Mover para cima" disabled={i === 0} onClick={() => moverSecao(i, -1)}>
                  <i className="bi bi-chevron-up" />
                </button>
                <button type="button" aria-label="Mover para baixo" disabled={i === cv.secoes.length - 1} onClick={() => moverSecao(i, 1)}>
                  <i className="bi bi-chevron-down" />
                </button>
              </div>
              <div className="section-main">
                <span className="section-kind">{nomeSecao(s)}</span>
                <input value={s.titulo} placeholder="Título da seção" onChange={(e) => editItem("secoes", i, "titulo", e.target.value)} />
                {!TITULOS_PADRAO[s.id] && (
                  <textarea
                    rows={3}
                    value={s.itens || ""}
                    placeholder={"Um item por linha\nEx.: Voluntário na ONG X (2023)"}
                    onChange={(e) => editItem("secoes", i, "itens", e.target.value)}
                  />
                )}
              </div>
              <div className="section-actions">
                <input
                  type="checkbox"
                  className="switch"
                  aria-label={s.visivel ? "Esconder seção" : "Mostrar seção"}
                  checked={s.visivel}
                  onChange={(e) => editItem("secoes", i, "visivel", e.target.checked)}
                />
                {!TITULOS_PADRAO[s.id] && (
                  <button type="button" className="remove-btn icon-only" aria-label="Excluir seção" onClick={() => removeItem("secoes", i)}>
                    <i className="bi bi-trash3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="chip-row">
          <span className="chip-label">Adicionar seção:</span>
          {["Projetos", "Certificações", "Voluntariado", "Prêmios", "Referências"].map((t) => (
            <button key={t} type="button" className="chip" onClick={() => addItem("secoes", { id: novoId(), titulo: t, visivel: true, itens: "" })}>
              <i className="bi bi-plus" /> {t}
            </button>
          ))}
          <button type="button" className="chip chip-primary" onClick={() => addItem("secoes", { id: novoId(), titulo: "Nova seção", visivel: true, itens: "" })}>
            <i className="bi bi-plus" /> Em branco
          </button>
        </div>
      </CardSecao>
    </>
  );

  const abaFormatacao = (
    <>
      <Dica>Escolha um modelo e ajuste cores, fonte e espaçamento. O resultado aparece na hora no preview.</Dica>

      <CardSecao icone="bi-grid-1x2-fill" cor="pink" titulo="Modelo">
        <div className="template-grid">
          {MODELOS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`template-card ${cv.estilo.modelo === m.id ? "active" : ""}`}
              onClick={() => setEstilo("modelo", m.id)}
              style={{ "--accent": cv.estilo.cor }}
            >
              <div className={`template-thumb thumb-${m.id}`}>
                <span className="t-head" />
                <span className="t-line w60" />
                <span className="t-title" />
                <span className="t-line" />
                <span className="t-line w80" />
                <span className="t-title" />
                <span className="t-line w70" />
              </div>
              <strong>{m.nome}</strong>
              <span>{m.desc}</span>
              {cv.estilo.modelo === m.id && <i className="bi bi-check-circle-fill template-check" />}
            </button>
          ))}
        </div>
      </CardSecao>

      <CardSecao icone="bi-palette-fill" cor="orange" titulo="Cor de destaque">
        <div className="swatches">
          {CORES.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch ${cv.estilo.cor === c ? "active" : ""}`}
              style={{ background: c }}
              aria-label={`Cor ${c}`}
              onClick={() => setEstilo("cor", c)}
            />
          ))}
          <label className="swatch swatch-custom" title="Escolher outra cor">
            <i className="bi bi-eyedropper" />
            <input type="color" value={cv.estilo.cor} onChange={(e) => setEstilo("cor", e.target.value)} />
          </label>
        </div>
      </CardSecao>

      <CardSecao icone="bi-fonts" cor="blue" titulo="Tipografia e layout">
        <div className="field-label">Fonte</div>
        <div className="font-grid">
          {FONTES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`font-chip ${cv.estilo.fonte === f.id ? "active" : ""}`}
              style={{ fontFamily: f.id }}
              onClick={() => setEstilo("fonte", f.id)}
            >
              Aa <span>{f.nome}</span>
            </button>
          ))}
        </div>

        <div className="field-label">Tamanho do texto</div>
        <Segmentado
          valor={cv.estilo.tamanho}
          onChange={(v) => setEstilo("tamanho", v)}
          opcoes={[
            { id: "pequeno", nome: "Pequeno" },
            { id: "medio", nome: "Médio" },
            { id: "grande", nome: "Grande" },
          ]}
        />

        <div className="field-label">Espaçamento</div>
        <Segmentado
          valor={cv.estilo.espacamento}
          onChange={(v) => setEstilo("espacamento", v)}
          opcoes={[
            { id: "compacto", nome: "Compacto" },
            { id: "normal", nome: "Normal" },
            { id: "amplo", nome: "Amplo" },
          ]}
        />

        <div className="field-label">Alinhamento do cabeçalho</div>
        <Segmentado
          valor={cv.estilo.alinhamento}
          onChange={(v) => setEstilo("alinhamento", v)}
          opcoes={[
            { id: "esquerda", nome: "Esquerda", icone: "bi-text-left" },
            { id: "centro", nome: "Centro", icone: "bi-text-center" },
          ]}
        />

        <div className="format-switch">
          <Switch checked={cv.estilo.divisores} onChange={(v) => setEstilo("divisores", v)} label="Linhas divisórias" />
        </div>
      </CardSecao>
    </>
  );

  const abaCampos = (
    <>
      <Dica>Escolha quais informações aparecem no cabeçalho e adicione novos campos de contato, como LinkedIn e portfólio.</Dica>

      <CardSecao icone="bi-eye-fill" cor="orange" titulo="Mostrar no cabeçalho">
        <div className="toggle-grid">
          <Switch checked={cv.mostrar.email} onChange={(v) => setMostrar("email", v)} label="Email" />
          <Switch checked={cv.mostrar.telefone} onChange={(v) => setMostrar("telefone", v)} label="Telefone" />
          <Switch checked={cv.mostrar.idade} onChange={(v) => setMostrar("idade", v)} label="Idade" />
          <Switch checked={cv.mostrar.cidade} onChange={(v) => setMostrar("cidade", v)} label="Cidade" />
        </div>
      </CardSecao>

      <CardSecao icone="bi-link-45deg" cor="blue" titulo="Contatos e links extras">
        {cv.contatos.map((c, i) => (
          <div key={i} className="contact-row">
            <input value={c.rotulo} placeholder="Nome do campo" onChange={(e) => editItem("contatos", i, "rotulo", e.target.value)} />
            <input value={c.valor} placeholder="Ex.: linkedin.com/in/seunome" onChange={(e) => editItem("contatos", i, "valor", e.target.value)} />
            <button type="button" className="remove-btn icon-only" aria-label="Remover campo" onClick={() => removeItem("contatos", i)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ))}
        <div className="chip-row">
          <span className="chip-label">Adicionar:</span>
          {CONTATOS_SUGERIDOS.map((r) => (
            <button key={r} type="button" className="chip" onClick={() => addItem("contatos", { rotulo: r, valor: "" })}>
              <i className="bi bi-plus" /> {r}
            </button>
          ))}
          <button type="button" className="chip chip-primary" onClick={() => addItem("contatos", { rotulo: "", valor: "" })}>
            <i className="bi bi-plus" /> Outro campo
          </button>
        </div>
      </CardSecao>

      <CardSecao icone="bi-arrow-counterclockwise" cor="pink" titulo="Recomeçar">
        <p className="muted">Apaga todos os dados preenchidos e volta às configurações padrão.</p>
        <button type="button" className="remove-btn" onClick={limparTudo}>
          <i className="bi bi-trash3" /> Limpar currículo
        </button>
      </CardSecao>
    </>
  );

  const abaSuporte = (
    <div className="support-card">
      <div className="support-icon">
        <i className="bi bi-headset" />
      </div>
      <h2>Suporte prioritário</h2>
      <p>
        Como assinante Plus, você fala direto com a nossa equipe pelo WhatsApp e tem atendimento na frente da fila.
      </p>
      <a
        className="whatsapp-btn"
        href={whatsappLink("Olá! Sou assinante do Plano Plus do Gerador de Currículo e preciso de ajuda.")}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="bi bi-whatsapp" /> Falar com o suporte
      </a>
      <ul className="support-list">
        <li><i className="bi bi-lightning-charge-fill" /> Resposta prioritária</li>
        <li><i className="bi bi-chat-heart-fill" /> Revisão do seu currículo</li>
        <li><i className="bi bi-shield-check" /> Ajuda com qualquer dúvida</li>
      </ul>
    </div>
  );

  const conteudoAba = {
    conteudo: abaConteudo,
    secoes: abaSecoes,
    formatacao: abaFormatacao,
    campos: abaCampos,
    suporte: abaSuporte,
  }[aba];

  return (
    <div className="gerador-container plus-page">
      {/* NAVBAR */}
      <nav className="top-navbar plus-nav">
        <div className="left-section">
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="logo" />
          </Link>
          <span className="plus-pill">
            <i className="bi bi-stars" /> Plus
          </span>
        </div>
        <div className="plus-nav-right">
          <span className={`autosave ${salvo ? "show" : ""}`}>
            <i className="bi bi-cloud-check-fill" /> Salvo
          </span>
          <span className="user-chip">
            <i className="bi bi-person-circle" /> {usuario}
          </span>
          <button type="button" className="logout-btn" onClick={sair}>
            <i className="bi bi-box-arrow-right" /> <span>Sair</span>
          </button>
        </div>
      </nav>

      <main className="plus-main">
        {/* BOAS-VINDAS */}
        <header className="plus-hero">
          <h1>
            Olá, {usuario}! <span>Bem-vindo ao Plus.</span>
          </h1>
          <p>Clique em um recurso abaixo para começar. Seu currículo aparece pronto ao lado.</p>
          <div className="feature-shortcuts">
            {[
              { id: "secoes", icone: "bi-type", cor: "purple", t: "Personalize títulos e seções", d: "Renomeie, reordene e crie seções" },
              { id: "formatacao", icone: "bi-palette-fill", cor: "pink", t: "Formatação profissional", d: "4 modelos, cores e fontes" },
              { id: "campos", icone: "bi-ui-checks", cor: "orange", t: "Alteração de campos", d: "LinkedIn, portfólio e mais" },
              { id: "suporte", icone: "bi-headset", cor: "green", t: "Suporte prioritário", d: "Atendimento pelo WhatsApp" },
            ].map((f) => (
              <button key={f.id} type="button" className={`shortcut ${aba === f.id ? "active" : ""}`} onClick={() => irParaAba(f.id)}>
                <span className={`section-icon ${f.cor}`}>
                  <i className={`bi ${f.icone}`} />
                </span>
                <span className="shortcut-text">
                  <strong>{f.t}</strong>
                  <small>{f.d}</small>
                </span>
                <i className="bi bi-chevron-right shortcut-arrow" />
              </button>
            ))}
          </div>
        </header>

        <div className="plus-layout" ref={editorRef}>
          {/* EDITOR */}
          <section className="plus-editor">
            <div className="tabs" role="tablist">
              {ABAS.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  role="tab"
                  aria-selected={aba === a.id}
                  className={`tab ${aba === a.id ? "active" : ""}`}
                  onClick={() => setAba(a.id)}
                >
                  <span className="tab-step">{i + 1}</span>
                  <i className={`bi ${a.icone}`} />
                  <span className="tab-name">{a.nome}</span>
                </button>
              ))}
            </div>

            <div className="tab-panel" key={aba}>
              {conteudoAba}
            </div>
          </section>

          {/* PREVIEW */}
          <aside className={`plus-preview ${previewMobile ? "open" : ""}`}>
            <div className="preview-head">
              <div>
                <strong>Preview ao vivo</strong>
                <span>{MODELOS.find((m) => m.id === cv.estilo.modelo)?.nome} · A4</span>
              </div>
              <button type="button" className="preview-close" onClick={() => setPreviewMobile(false)} aria-label="Fechar preview">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="paper-stage" ref={palcoRef}>
              <div className="paper-fit" style={{ height: alturaFolha * escala }}>
                <div className="paper-scale" style={{ transform: `scale(${escala})` }} ref={folhaRef}>
                  <CurriculoPlus cv={cv} />
                </div>
              </div>
            </div>

            <button type="button" className="submit-btn download-btn" onClick={gerarPDF} disabled={gerando}>
              {gerando ? (
                <>
                  <span className="spinner" /> Gerando…
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-arrow-down-fill" /> Baixar PDF
                </>
              )}
            </button>
          </aside>
        </div>
      </main>

      {/* Barra inferior no celular */}
      <div className="mobile-bar">
        <button type="button" className="preview-toggle" onClick={() => setPreviewMobile(true)}>
          <i className="bi bi-eye" /> Ver currículo
        </button>
        <button type="button" className="submit-btn" onClick={gerarPDF} disabled={gerando}>
          <i className="bi bi-file-earmark-arrow-down-fill" /> PDF
        </button>
      </div>
    </div>
  );
}
