// pdf.js
// Coloque este arquivo na mesma pasta do Gerador.jsx
// Requer html2pdf.js: npm install html2pdf.js

import html2pdf from "html2pdf.js";

export async function gerarPDF() {
  const elemento = document.getElementById("preview-curriculo");
  if (!elemento) throw new Error("Elemento preview-curriculo não encontrado no DOM.");

  const opt = {
    margin: [10, 10, 10, 10], // mm (top, left, bottom, right)
    filename: `curriculo.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    enableLinks: true,
  };

  // Aplica temporariamente uma classe para melhor render se precisar (opcional)
  // elemento.classList.add("pdf-exporting");

  try {
    await html2pdf().set(opt).from(elemento).save();
  } finally {
    // elemento.classList.remove("pdf-exporting");
  }
}
