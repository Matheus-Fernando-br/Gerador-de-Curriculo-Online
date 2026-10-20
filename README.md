# 📄 Resume PDF App

Aplicação completa para gerar **currículos em PDF**, totalmente no **frontend**, usando **React + html2pdf.js**.  
O usuário preenche um formulário moderno, organizado por seções, com campos dinâmicos e animações — e o sistema monta automaticamente um currículo profissional pronto para salvar em PDF.

A geração do currículo é **100% client-side**. O único backend é uma API mínima
de login (pasta `backend/`, hospedada no Render) que protege a **Área Plus**.

---

## ⭐ Plano Plus

- Assinatura pelo WhatsApp (botão "Assine o Plano Plus" abre a conversa com a mensagem pronta)
- Login em `/entrar` ou pelo menu **Login**; a página `/plus` só abre com sessão válida
- Recursos da Área Plus:
  - **Personalize títulos e seções**: renomear, reordenar, esconder e criar seções
  - **Formatação profissional**: 4 modelos, cor de destaque, fonte, tamanho e espaçamento
  - **Alteração de campos**: cargo, LinkedIn/portfólio e escolha do que aparece no cabeçalho
  - **Suporte prioritário** pelo WhatsApp

### Backend (`backend/`)

Node puro, sem dependências. Variáveis de ambiente (definidas no Render):

| Variável | Descrição |
| --- | --- |
| `ADMIN_USER` / `ADMIN_PASSWORD` | credenciais de acesso à Área Plus |
| `TOKEN_SECRET` | segredo para assinar os tokens de sessão (12h) |
| `ALLOWED_ORIGIN` | origens liberadas no CORS (padrão `*`) |

Rotas: `POST /api/login`, `GET /api/me`, `GET /api/health`.
O frontend usa `REACT_APP_API_URL` (em `frontend/.env`) para encontrar a API.

---

## 🚀 Tecnologias Principais

- **React.js**
- **html2pdf.js** (geração de PDF direto no navegador)
- **CSS com efeito Glass / Blur**
- Hooks React: `useState`, `useEffect`
- Campos dinâmicos (controle de arrays)
- Animações para campos condicionais (cursando / atual)

---

## 🧩 Funcionalidades

### ✔ Gerador de Currículo
Formulário dividido em seções:

- **Dados pessoais**
- **Objetivo profissional**
- **Formação acadêmica** (dinâmico)
- **Experiência profissional** (dinâmico)
- **Cursos complementares** (dinâmico)
- **Idiomas** (dinâmico)
- **Conhecimentos** (dinâmico)
- **CNH opcional**, só aparece se o usuário quiser

### ✔ Pré-visualização inteligente
- A preview **não fica mais visível o tempo todo**
- Usuário clica no botão com ícone de olho para exibir/ocultar
- Preview é exatamente o layout usado no PDF

### ✔ Geração de PDF integrada
- Usa **html2pdf.js**
- Renderiza o currículo com as mesmas fontes e espaçamentos da preview
- Download automático

### ✔ Campos dinâmicos
- Botões **Adicionar** e **Remover** para listas
- Mantêm estilo consistente
- Funciona para: idiomas, cursos, formações, experiências, conhecimentos, CNH, etc.

### ✔ Campos condicionais
- “Cursando” esconde automaticamente o campo de **data de término**
- “Trabalho atual” esconde o **fim** da experiência
- CNH só aparece quando ativada pelo usuário

### ✔ Layout profissional
- Fontes personalizadas
- Seções bem separadas
- Espaçamentos corretos
- Curso + instituição na **mesma linha**, com formatação diferente
- Período logo abaixo com bullet point
- Campos completamente revisados

---

## 🛠 Como Rodar o Projeto

### 1. Instale dependências
```bash
npm install
