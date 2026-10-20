  // src/pages/telaInicial/telaInicial.js
  import React, { useState, useEffect, useRef } from "react";
  import "./telaInicial.css";
  import "../../App.css";
  import { useNavigate } from "react-router-dom";
  import Login from "../../components/login/login";

  export default function TelaInicial() {
    const slides = ["/notebook.png", "/notebook01.png", "/notebook02.png", "/notebook03.png"];
    const navigate = useNavigate();

    const [faqOpen, setFaqOpen] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const progressRef = useRef(null);

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
        { threshold: 0.15 }
      );

      const elements = document.querySelectorAll(".delay1, .delay2, .delay3, .delay4");
      elements.forEach((el) => observer.current.observe(el));

      return () => {
        if (observer.current) observer.current.disconnect();
      };
    }, []);

    // === NAVBAR + BARRA DE PROGRESSO NO SCROLL ===
    useEffect(() => {
      const onScroll = () => {
        const y = window.scrollY;
        setScrolled(y > 10);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        }
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const features = [
      { icon: "bi-lightning-charge-fill", color: "orange", title: "Pronto em minutos", text: "Preencha seus dados e veja o currículo tomar forma em tempo real." },
      { icon: "bi-file-earmark-pdf-fill", color: "red", title: "PDF profissional", text: "Formatação limpa no padrão A4, pronta para enviar a qualquer empresa." },
      { icon: "bi-gift-fill", color: "green", title: "100% gratuito", text: "Gere quantos currículos quiser, sem cadastro e sem pagar nada." },
      { icon: "bi-phone-fill", color: "blue", title: "Em qualquer tela", text: "Funciona no celular, tablet ou computador, onde você estiver." },
    ];

    const plusItems = [
      "Personalize títulos e seções",
      "Formatação profissional",
      "Alteração de campos",
      "E suporte prioritário",
    ];

    return (
      <div className="telaInicial" id="top">
        {/* NAVBAR */}
        <nav className={`top-navbar ${scrolled ? "scrolled" : ""}`}>
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
          <div className="scroll-progress" ref={progressRef} />
        </nav>

        {/* BOTÃO FLUTUANTE */}
        <div className={`floating-button ${scrolled ? "visible" : ""}`}>
          <button className="btn-floating" onClick={() => navigate("/gerador")}>
            <i className="bi bi-stars"></i>
            Gerar currículo
          </button>
        </div>

        {/* HERO */}
        <section className="hero">
          <div className="hero-glow glow-1" />
          <div className="hero-glow glow-2" />
          <div className="hero-glow glow-3" />

          <div className="hero-content">
            <span className="eyebrow-pill hero-in" style={{ animationDelay: "0.1s" }}>
              <span className="dot" /> Gratuito · PDF em segundos
            </span>
            <h1 className="hero-in" style={{ animationDelay: "0.2s" }}>
              Chega de não ser convocado para <span className="gradient-text">entrevistas</span>
            </h1>
            <p className="hero-sub hero-in" style={{ animationDelay: "0.35s" }}>
              Monte um currículo bonito, organizado e profissional em poucos minutos.
            </p>
            <div className="hero-actions hero-in" style={{ animationDelay: "0.5s" }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/gerador")}>
                Mude seu futuro agora <i className="bi bi-arrow-right"></i>
              </button>
              <a href="#como-funciona" className="btn btn-link btn-lg">
                Como funciona <i className="bi bi-chevron-right"></i>
              </a>
            </div>
          </div>

          <div className="hero-visual hero-in" style={{ animationDelay: "0.65s" }}>
            <img src="/assets/entrevista-ruim.jpg" alt="Entrevista de emprego" />
            <div className="hero-badge badge-1">
              <i className="bi bi-check-circle-fill"></i>
              <div>
                <strong>Currículo pronto</strong>
                <span>curriculo.pdf</span>
              </div>
            </div>
            <div className="hero-badge badge-2">
              <i className="bi bi-briefcase-fill"></i>
              <div>
                <strong>Nova entrevista</strong>
                <span>Você foi convocado!</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features">
          <div className="section-head">
            <span className="eyebrow delay1">Por que usar</span>
            <h2 className="delay1">Tudo o que você precisa. Nada que atrapalhe.</h2>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className={`feature-card delay${(i % 4) + 1}`}>
                <div className={`feature-icon ${f.color}`}>
                  <i className={`bi ${f.icon}`}></i>
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="sec2">
          <div className="overlay" />
          <div className="text delay1">
            <span className="eyebrow light">Simples assim</span>
            <h2>
              Com poucos cliques, seu currículo sai <span className="gradient-text">formatado e de graça</span>
            </h2>
          </div>
          <div className="device delay2">
            <div className="device-bar">
              <span /><span /><span />
            </div>
            <div className="curriculo-image">
              <img src="/curriculo-preview.jpg" alt="Currículo" />
            </div>
          </div>
          <p className="hint delay3">
            <i className="bi bi-cursor-fill"></i> Passe o mouse para rolar o currículo
          </p>
        </section>

        {/* SECTION 3 */}
        <section className="sec3" id="como-funciona">
          <div className="section-head">
            <span className="eyebrow delay1">Como funciona</span>
            <h2 className="delay1">Acesse de qualquer lugar</h2>
          </div>

          <div className="steps">
            {[
              { n: "1", t: "Preencha", d: "Informe seus dados, formação e experiências." },
              { n: "2", t: "Visualize", d: "Confira tudo no preview antes de baixar." },
              { n: "3", t: "Baixe", d: "Gere o PDF e envie para as vagas." },
            ].map((s, i) => (
              <div key={i} className={`step delay${i + 2}`}>
                <div className="step-number">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>

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
          <div className="section-head">
            <span className="eyebrow delay1">FAQ</span>
            <h2 className="delay1">Dúvidas frequentes</h2>
          </div>
          <div className="faq-container delay2">
            {[
              { q: "O gerador é realmente gratuito?", a: "Sim! Você pode gerar quantos currículos quiser sem pagar nada." },
              { q: "Preciso criar uma conta?", a: "Não é necessário criar conta para usar a versão gratuita." },
              { q: "Como faço para salvar meu currículo?", a: "Após preencher o formulário, clique em 'Gerar Currículo' e o PDF será baixado automaticamente." },
              { q: "Posso editar o currículo depois?", a: "Na versão gratuita, não há edição posterior. No Plano Plus, sim." },
            ].map((item, i) => (
              <div key={i} className={`faq-item delay3 ${faqOpen === i ? "open" : ""}`}>
                <button
                  className={`faq-question ${faqOpen === i ? "open" : ""}`}
                  onClick={() => toggleFaq(i)}
                >
                  <span>{item.q}</span>
                  <i className="bi bi-plus-lg"></i>
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
          <div className="plus-card delay1">
            <div className="plus-glow" />
            <span className="plus-badge delay2">
              <i className="bi bi-stars"></i> Premium
            </span>
            <h2 className="delay2">Plano Plus</h2>
            <p className="plus-sub delay2">Leve seu currículo para o próximo nível</p>

            <div className="plus-price delay3">
              <span className="currency">R$</span>
              <span className="value">9,90</span>
            </div>

            <div className="plus-list delay3">
              <span>Tenha acesso a recursos premium:</span>
              <ul>
                {plusItems.map((item, i) => (
                  <li key={i}>
                    <i className="bi bi-check-circle-fill"></i> {item}
                  </li>
                ))}
              </ul>
            </div>
            <button className="btn btn-primary btn-lg btn-green delay4">
              Assine o Plano Plus por apenas R$9,90
            </button>
          </div>
        </section>

        {/* QUEM SOMOS */}
        <section className="quem-somos" id="quem-somos">
          <div className="quem-somos-bg">
            <img src="/assets/quem-somos.png" alt="Equipe" />
          </div>
          <div className="quem-somos-content delay1">
            <span className="eyebrow">Sobre nós</span>
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
          <button className="btn btn-primary btn-lg delay2" onClick={() => navigate("/gerador")}>
            Criar meu currículo <i className="bi bi-arrow-right"></i>
          </button>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <img src="/logo.png" alt="Logo" />
          <p>© {new Date().getFullYear()} Gerador de Currículo Online. Todos os direitos reservados.</p>
        </footer>
      </div>
    );
  }
