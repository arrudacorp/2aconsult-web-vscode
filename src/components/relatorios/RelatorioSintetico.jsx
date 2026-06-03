import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRiscoLabel } from "@/pages/RelatoriosPage";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FileDown, Loader2 } from "lucide-react";
import { criarDocPDF, drawTable } from "@/lib/pdfUtils";

const RISCO_ORDER = ["Sem Risco", "R1 - Risco Menor", "R2 - Risco Médio", "R3 - Risco Máximo"];
const COLORS = ["#4caf50", "#ff9800", "#f44336", "#9c27b0"];

export default function RelatorioSintetico({ dados, mesLabel, ano, userMap, unidade, instituicao, userName }) {
  const [exporting, setExporting] = useState(false);

  const contagem = { "Sem Risco": 0, "R1 - Risco Menor": 0, "R2 - Risco Médio": 0, "R3 - Risco Máximo": 0 };
  for (const q of dados) {
    const label = getRiscoLabel(q.risco);
    contagem[label] = (contagem[label] || 0) + 1;
  }
  const chartData = RISCO_ORDER.map((name, i) => ({ name, value: contagem[name] || 0, color: COLORS[i] }));
  const total = dados.length;

  const exportarPDF = async () => {
    setExporting(true);
    try {
      const { doc, contentStartY, usableW, marginLeft, pageH, addFooters } = await criarDocPDF({
        titulo: "Relatório Sintético",
        periodo: `${mesLabel}/${ano}`,
        unidade,
        instituicao,
        userName,
        orientation: "portrait",
      });

      let y = contentStartY;
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("Distribuição por Classificação de Risco", marginLeft, y);
      y += 6;

      y = drawTable(doc, {
        startY: y,
        headers: ["Classificação de Risco", "Quantidade", "%"],
        rows: RISCO_ORDER.map((r) => [
          r,
          contagem[r] || 0,
          total > 0 ? `${((contagem[r] || 0) / total * 100).toFixed(1)}%` : "0%",
        ]).concat([["TOTAL", total, "100%"]]),
        colWidths: [usableW * 0.6, usableW * 0.2, usableW * 0.2],
        marginLeft,
        pageH,
      });

      addFooters();
      doc.save(`relatorio_sintetico_${mesLabel}_${ano}.pdf`);
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
          Período: <strong>{mesLabel}/{ano}</strong> — {total} prontuário(s)
        </p>
        <Button onClick={exportarPDF} variant="outline" className="gap-2" disabled={exporting}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          Exportar PDF
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Classificação de Risco</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                    label={({ value, percent }) => value > 0 ? `${value} (${(percent * 100).toFixed(0)}%)` : ""}
                    labelLine={true}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} prontuário(s)`, n]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {RISCO_ORDER.map((cat, i) => (
                <div key={cat} className="flex items-center justify-between border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-sm font-medium">{cat}</span>
                  </div>
                  <span className="text-lg font-bold">{contagem[cat] || 0}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border rounded-lg px-4 py-3 bg-muted/40">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold">{total}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}