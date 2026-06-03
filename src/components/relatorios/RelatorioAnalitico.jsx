import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRiscoLabel, getRiscoClassName } from "@/pages/RelatoriosPage";
import { FileDown, Loader2 } from "lucide-react";
import { criarDocPDF, drawTable } from "@/lib/pdfUtils";

const CAMPOS_CONDICIONAIS = [
  { key: "acamado", label: "Acamado" },
  { key: "def_fisico", label: "Def. Físico" },
  { key: "def_mental", label: "Def. Mental" },
  { key: "saneamento", label: "Saneamento" },
  { key: "desnutricao", label: "Desnutrição" },
  { key: "drogadicao", label: "Drogadição" },
  { key: "desemprego", label: "Desemprego" },
  { key: "analfabetismo", label: "Analfabetismo" },
  { key: "menor6meses", label: "Menor 6m" },
  { key: "maior70", label: "Maior 70a" },
  { key: "hipertensao", label: "Hipertensão" },
  { key: "diabetes", label: "Diabetes" },
];

export default function RelatorioAnalitico({ dados, mesLabel, ano, userMap, unidade, instituicao, userName }) {
  const [exporting, setExporting] = useState(false);

  const totaisCampos = {};
  CAMPOS_CONDICIONAIS.forEach(({ key }) => {
    totaisCampos[key] = dados.reduce((acc, q) => acc + (Number(q[key]) || 0), 0);
  });

  const exportarPDF = async () => {
    setExporting(true);
    try {
      const { doc, contentStartY, usableW, marginLeft, pageH, addFooters } = await criarDocPDF({
        titulo: "Relatório Analítico",
        periodo: `${mesLabel}/${ano}`,
        unidade,
        instituicao,
        userName,
        orientation: "landscape",
      });

      let y = contentStartY;

      // Totais dos campos condicionais
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("Totais por Condição", marginLeft, y);
      y += 5;

      y = drawTable(doc, {
        startY: y,
        headers: ["Condição", "Total"],
        rows: CAMPOS_CONDICIONAIS.map(({ key, label }) => [label, totaisCampos[key]]),
        colWidths: [usableW * 0.7, usableW * 0.3],
        marginLeft,
        pageH,
      });

      y += 8;
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("Detalhamento por Prontuário", marginLeft, y);
      y += 5;

      const colW = [
        usableW * 0.11, // prontuário
        usableW * 0.17, // responsável
        usableW * 0.14, // agente
        usableW * 0.07, // risco
        usableW * 0.19, // classificação
        usableW * 0.10, // data
        // campos condicionais divididos no espaço restante
        ...Array(CAMPOS_CONDICIONAIS.length).fill(usableW * 0.22 / CAMPOS_CONDICIONAIS.length),
      ];

      // Tabela principal compacta sem campos condicionais (muito largo)
      y = drawTable(doc, {
        startY: y,
        headers: ["Prontuário", "Responsável", "Agente", "Risco", "Classificação", "Data"],
        rows: dados.map((q) => [
          q.id_user_app || "—",
          q.responsavel || "—",
          userMap[q.id_user] || (q.id_user ? `ID: ${q.id_user}` : "—"),
          q.risco ?? "—",
          getRiscoLabel(q.risco),
          q.data ? new Date(q.data).toLocaleDateString("pt-BR") : "—",
        ]),
        colWidths: [
          usableW * 0.13,
          usableW * 0.20,
          usableW * 0.20,
          usableW * 0.08,
          usableW * 0.24,
          usableW * 0.15,
        ],
        marginLeft,
        pageH,
      });

      addFooters();
      doc.save(`relatorio_analitico_${mesLabel}_${ano}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  if (dados.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Nenhum registro encontrado para {mesLabel}/{ano}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Período: <strong>{mesLabel}/{ano}</strong> — {dados.length} prontuário(s)
        </p>
        <Button onClick={exportarPDF} variant="outline" className="gap-2" disabled={exporting}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          Exportar PDF
        </Button>
      </div>

      {/* Totais condicionais */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Totais por Condição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CAMPOS_CONDICIONAIS.map(({ key, label }) => (
              <div key={key} className="border rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-bold text-primary">{totaisCampos[key]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Listagem detalhada */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Detalhamento por Prontuário</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Prontuário</th>
                  <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Responsável</th>
                  <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Agente</th>
                  <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Risco</th>
                  <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Classificação</th>
                  <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Data</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((q, idx) => (
                  <tr key={q.id || idx} className="border-t hover:bg-muted/20">
                    <td className="px-3 py-2">{q.id_user_app || "—"}</td>
                    <td className="px-3 py-2">{q.responsavel || "—"}</td>
                    <td className="px-3 py-2">{userMap[q.id_user] || (q.id_user ? `ID: ${q.id_user}` : "—")}</td>
                    <td className="px-3 py-2">{q.risco ?? "—"}</td>
                    <td className="px-3 py-2">
                      <Badge className={getRiscoClassName(q.risco)}>{getRiscoLabel(q.risco)}</Badge>
                    </td>
                    <td className="px-3 py-2">{q.data ? new Date(q.data).toLocaleDateString("pt-BR") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}