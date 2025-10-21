  // src/pages/telaInicial/telaInicial.js
  import React, { useState, useEffect, useRef } from "react";
  import "./telaInicial.css";
  import "../../App.css";
  import { useNavigate } from "react-router-dom";
  import Login from "../../components/login/login";

  export default function TelaInicial() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = ["/notebook.png", "/notebook01.png", "/notebook02.png", "/notebook03.png"];
    const navigate = useNavigate();

    const [faqOpen, setFaqOpen] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleFaq = (i) => setFaqOpen(faqOpen === i ? null : i);
    const toggleMenu = () => setMenuOpen(!menuOpen);

    // === ANIMAÇÃO POR SCROLL ===
    const observer = useRef(null);

    useEffect(() => {
      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("aparecer");
            }
          });
        },
        { threshold: 0.3 }
      );

      const elements = document.querySelectorAll(".delay1, .delay2, .delay3, .delay4");
      elements.forEach((el) => observer.current.observe(el));

      return () => {
        if (observer.current) observer.current.disconnect();
      };
    }, []);

    return (
      <div className="telaInicial">
        {/* NAVBAR */}
        <nav className="top-navbar">
          <div className="left-section">
            <a href="#top">
              <img src="/logo.png" alt="Logo" className="logo" />
            </a>
          </div>
          <div className={`right-section ${menuOpen ? "open" : ""}`}>
            <a href="#duvidas" onClick={() => setMenuOpen(false)}>Dúvidas frequentes</a>
            <a href="#plus" onClick={() => setMenuOpen(false)}>Plano Plus</a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
            <a href="#quem-somos" onClick={() => setMenuOpen(false)}>Quem somos</a>
            <Login />
          </div>

          <div className="menu-toggle" onClick={toggleMenu}>
            <i className={`bi ${menuOpen ? "bi-x" : "bi-list"}`}></i>
          </div>
        </nav>

        {/* BOTÃO FLUTUANTE */}
        <div className="floating-button">
          <button className="btn-floating" onClick={() => navigate("/gerador")}>
            Gerar currículo
          </button>
        </div>

        {/* HERO */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="delay1">Chega de não ser convocado para entrevistas</h1>
            <button className="btn-green delay3" onClick={() => navigate("/gerador")}>
              Mude seu futuro agora
            </button>
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="sec2">
          <div className="overlay" />
          <div className="curriculo-image delay1">
            <img src="/curriculo-preview.jpg" alt="Currículo" />
          </div>
          <div className="text delay1">
            <h2>Com poucos cliques, seu currículo sai formatado e de graça</h2>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="sec3" id="como-funciona">
          <h2 className="delay1">Acesse de qualquer lugar</h2>
          <div className="carousel-container delay2">
            <div className="carousel-track">
              {slides.concat(slides).map((src, i) => (
                <div key={i} className="carousel-item">
                  <img src={src} alt={`slide-${i}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq" id="duvidas">
          <h2 className="delay1">Dúvidas frequentes</h2>
          <div className="faq-container delay2">
            {[
              { q: "O gerador é realmente gratuito?", a: "Sim! Você pode gerar quantos currículos quiser sem pagar nada." },
              { q: "Preciso criar uma conta?", a: "Não é necessário criar conta para usar a versão gratuita." },
              { q: "Como faço para salvar meu currículo?", a: "Após preencher o formulário, clique em 'Gerar Currículo' e o PDF será baixado automaticamente." },
              { q: "Posso editar o currículo depois?", a: "Na versão gratuita, não há edição posterior. No Plano Plus, sim." },
            ].map((item, i) => (
              <div key={i} className="faq-item delay3">
                <button
                  className={`faq-question ${faqOpen === i ? "open" : ""}`}
                  onClick={() => toggleFaq(i)}
                >
                  <span>{item.q}</span>
                  <i className={`bi ${faqOpen === i ? "bi-chevron-double-up" : "bi-chevron-double-down"}`}></i>
                </button>

                <div className={`faq-answer ${faqOpen === i ? "show" : ""}`}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PLUS */}
        <section className="plus" id="plus">
          <h2 className="delay1">Plano Plus</h2>
          <p className="delay2">Leve seu currículo para o próximo nível</p>
          <p className="delay3">
            <span>Tenha acesso a recursos premium:</span>
            <br />• Personalize títulos e seções
            <br />• Formatação profissional
            <br />• Alteração de campos
            <br />• E suporte prioritário <br />
          </p>
          <button className="btn-green delay4">Assine o Plano Plus por apenas R$9,90</button>
        </section>

        {/* QUEM SOMOS */}
        <section className="quem-somos" id="quem-somos">
          <div className="quem-somos-content">
            <h2 className="delay1">Quem somos</h2>
            <p className="delay3">
              Somos uma equipe dedicada a facilitar sua jornada profissional,
              oferecendo ferramentas que tornam o processo de criação de currículo
              rápido, simples e gratuito.
            </p>
          </div>
        </section>

        {/* FINAL */}
        <section className="final">
          <h2 className="delay1">
            Seu futuro começa com um bom <span>currículo</span>
          </h2>
        </section>
      </div>
    );
  }
