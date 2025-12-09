# 📄 Resume PDF App

Aplicação completa para gerar **currículos em PDF**, totalmente no **frontend**, usando **React + html2pdf.js**.  
O usuário preenche um formulário moderno, organizado por seções, com campos dinâmicos e animações — e o sistema monta automaticamente um currículo profissional pronto para salvar em PDF.

Não utiliza mais backend ou Flask.  
**Tudo é 100% client-side.**

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
