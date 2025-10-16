// src/pages/telaInicial/telaInicial.js
import React, { useState, useEffect } from "react";
import "./telaInicial.css";
import "../../App.css";
import { useNavigate } from "react-router-dom";

export default function TelaInicial() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "/notebook.png",
    "/notebook01.png",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const [faqOpen, setFaqOpen] = useState(null);
  const toggleFaq = (i) => setFaqOpen(faqOpen === i ? null : i);

  const navigate = useNavigate();

  return (
    <div className="telaInicial">
      {/* NAVBAR */}
      <nav className="top-navbar">
            <div className="left-section">
                <a href="#top">
                    <img src="/logo.png" alt="Logo" className="logo" />
                </a>
            </div>
            <div className="right-section">
                <a href="#duvidas">Dúvidas frequentes</a>
                <a href="#plus">Plano Plus</a>
                <a href="#como-funciona">Como funciona</a>
                <a href="#quem-somos">Quem somos</a>
            </div>
      </nav>

      {/* BOTÃO FLUTUANTE */}
        <div className="floating-button">
            <button className="btn-floating" onClick={() => navigate("/gerador")}>
                Gerar currículo
            </button>
        </div>


      {/* SECTION 1 */}
      <section className="hero">
        <div className="hero-content">
          <h1>Chega de não ser convocado para entrevistas</h1>
            <button className="btn-green" onClick={() => navigate("/gerador")}>
                Mude seu futuro agora
            </button>
        </div>
      </section>

      {/* SECTION 2 */}
    <section className="sec2">
        <div className="overlay" />
        <div className="curriculo-image">
            <img src="/curriculo-preview.jpg" alt="Currículo" />
        </div>
        <div className="text">
            <h2>Com poucos cliques, seu currículo sai formatado e de graça</h2>
        </div>
    </section>


      {/* SECTION 3 */}
      <section className="sec3" id="como-funciona">
        <h2>Acesse de qualquer lugar</h2>
        <div className="carousel">
          <img
            src={slides[currentSlide]}
            alt="preview"
            className="carousel-img fade"
          />
        </div>
      </section>

      {/* SECTION 4 */}
      <section className="faq" id="duvidas">
        <h2>Dúvidas frequentes</h2>
        <div className="faq-container">
          {[
            {
              q: "O gerador é realmente gratuito?",
              a: "Sim! Você pode gerar quantos currículos quiser sem pagar nada.",
            },
            {
              q: "Preciso criar uma conta?",
              a: "Não é necessário criar conta para usar a versão gratuita.",
            },
            {
              q: "Como faço para salvar meu currículo?",
              a: "Após preencher o formulário, clique em 'Gerar Currículo' e o PDF será baixado automaticamente.",
            },
            {
              q: "Posso editar o currículo depois?",
              a: "Na versão gratuita, não há edição posterior. No Plano Plus, sim.",
            },
          ].map((item, i) => (
            <div key={i} className="faq-item">
              <button
                className={`faq-question ${faqOpen === i ? "open" : ""}`}
                onClick={() => toggleFaq(i)}
              >
                {item.q}
              </button>
              <div
                className={`faq-answer ${
                  faqOpen === i ? "show" : ""
                }`}
              >
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 */}
      <section className="plus" id="plus">
        <h2>Plano Plus</h2>
        <p>
          Tenha acesso a recursos premium:
          <br />• Personalize títulos e seções
          <br />• Formatação profissional
          <br />• Alteração de campos
          <br />• E suporte prioritário
        </p>
        <button className="btn-green">Assine o Plano Plus</button>
      </section>

      {/* SECTION 6 */}
      <section className="quem-somos" id="quem-somos">
        <div className="quem-somos-content">
          <h2>Quem somos</h2>
          <p>
            Somos uma equipe dedicada a facilitar sua jornada profissional,
            oferecendo ferramentas que tornam o processo de criação de currículo
            rápido, simples e gratuito.
          </p>
        </div>
      </section>

      {/* SECTION 7 */}
      <section className="final">
        <h2>Seu futuro começa com um bom currículo</h2>
      </section>
    </div>
  );
}
