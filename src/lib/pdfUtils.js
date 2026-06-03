import { jsPDF } from "jspdf";

/**
 * Cria um jsPDF com cabeçalho e rodapé padronizados.
 * @param {Object} opts
 * @param {string} opts.titulo - Título do relatório
 * @param {string} opts.periodo - Ex: "Abril/2026"
 * @param {Object} opts.unidade - { nome_unidade, cnes }
 * @param {Object} opts.instituicao - { nome, endereco, telefone }
 * @param {string} opts.logoUrl - URL da imagem da logo (opcional, usa logo do sistema por padrão)
 * @param {string} opts.userName - Nome do usuário que imprimiu
 * @param {"portrait"|"landscape"} opts.orientation
 * @returns {Promise<{doc: jsPDF, contentStartY: number, pageWidth: number, marginLeft: number, addFooters: () => void}>}
 */
const SYSTEM_LOGO_URL = "https://media.base44.com/images/public/69efa75166ba9be29f82f74c/f05ca0312_image.png";

export async function criarDocPDF({ titulo, periodo, unidade, instituicao, logoUrl, userName, orientation = "portrait" }) {
  logoUrl = logoUrl || SYSTEM_LOGO_URL;
  const doc = new jsPDF({ orientation });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginLeft = 10;
  const marginRight = 10;
  const usableW = pageW - marginLeft - marginRight;

  // ----- CABEÇALHO -----
  const headerH = 28;
  doc.setFillColor(74, 124, 74);
  doc.rect(0, 0, pageW, headerH, "F");

  let textX = marginLeft;

  // Logo
  if (logoUrl) {
    try {
      const imgData = await loadImageAsBase64(logoUrl);
      doc.addImage(imgData, "JPEG", marginLeft, 3, 22, 22);
      textX = marginLeft + 26;
    } catch (_) {
      // sem logo
    }
  }

  // Dados da unidade
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text(instituicao?.nome || "Unidade de Saúde", textX, 10);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  const linhaUnidade = [
    unidade?.nome_unidade,
    unidade?.cnes ? `CNES: ${unidade.cnes}` : null,
  ].filter(Boolean).join(" — ");
  if (linhaUnidade) doc.text(linhaUnidade, textX, 17);
  const linhaEndereco = [instituicao?.endereco, instituicao?.telefone].filter(Boolean).join(" | ");
  if (linhaEndereco) doc.text(linhaEndereco, textX, 23);

  // Título do relatório (lado direito)
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text(titulo, pageW - marginRight, 10, { align: "right" });
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  if (periodo) doc.text(`Período: ${periodo}`, pageW - marginRight, 17, { align: "right" });

  doc.setTextColor(0, 0, 0);

  const contentStartY = headerH + 6;

  // ----- FUNÇÃO RODAPÉ (chamada ao final) -----
  const addFooters = () => {
    const totalPages = doc.internal.getNumberOfPages();
    const dataImpressao = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.line(marginLeft, pageH - 12, pageW - marginRight, pageH - 12);
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, "normal");
      // Esquerda: usuário + data
      doc.text(`Impresso por: ${userName || "—"} em ${dataImpressao}`, marginLeft, pageH - 7);
      // Centro: página/total
      doc.text(`Página ${i} de ${totalPages}`, pageW / 2, pageH - 7, { align: "center" });
      // Direita: empresa
      doc.text("ArrudaCorp - Sistemas", pageW - marginRight, pageH - 7, { align: "right" });
    }
    doc.setTextColor(0, 0, 0);
  };

  return { doc, contentStartY, pageW, pageH, marginLeft, usableW, addFooters };
}

/**
 * Desenha uma tabela simples no jsPDF.
 */
export function drawTable(doc, { startY, headers, rows, colWidths, marginLeft = 10, pageH, headerBgColor = [74, 124, 74] }) {
  const rowH = 7;
  const headerH = 8;
  let y = startY;
  const footerReserve = 18;

  const checkPage = (h) => {
    if (y + h > pageH - footerReserve) {
      doc.addPage();
      y = 15;
    }
  };

  // Cabeçalho da tabela
  doc.setFillColor(...headerBgColor);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  checkPage(headerH);
  let x = marginLeft;
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  doc.rect(marginLeft, y, totalW, headerH, "F");
  headers.forEach((h, i) => {
    doc.text(String(h), x + 2, y + 5.5, { maxWidth: colWidths[i] - 3 });
    x += colWidths[i];
  });
  y += headerH;

  // Linhas de dados
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "normal");
  doc.setFontSize(7.5);
  rows.forEach((row, ri) => {
    checkPage(rowH);
    x = marginLeft;
    if (ri % 2 === 0) {
      doc.setFillColor(245, 248, 245);
      doc.rect(marginLeft, y, totalW, rowH, "F");
    }
    doc.setDrawColor(220, 220, 220);
    doc.rect(marginLeft, y, totalW, rowH);
    row.forEach((cell, i) => {
      const txt = String(cell ?? "—");
      doc.text(doc.splitTextToSize(txt, colWidths[i] - 3)[0], x + 2, y + 5);
      x += colWidths[i];
    });
    y += rowH;
  });

  return y;
}

// Helper: carrega URL como base64
function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = reject;
    img.src = url;
  });
}