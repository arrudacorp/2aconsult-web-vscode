import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRiscoLabel, getRiscoClassName } from "@/pages/RelatoriosPage";
import { FileDown, Loader2 } from "lucide-react";
import { criarDocPDF, drawTable } from "@/lib/pdfUtils";

const RISCO_ORDER = ["Sem Risco", "R1 - Risco Menor", "R2 - Risco Médio", "R3 - Risco Máximo"];

export default function RelatorioAgente({ dados, mesLabel, ano, userMap, unidade, instituicao, userName }) {
  const [agenteSelecionado, setAgenteSelecionado] = useState("");
  const [exporting, setExporting] = useState(false);

  const porAgente = useMemo(() => {
    const mapa = {};
    for (const q of dados) {
      const agenteId = q.id_user;
      const nomeAgente = userMap[agenteId] || (agenteId ? `ID: ${agenteId}` : "Sem Agente");
      if (!mapa[nomeAgente]) {
        mapa[nomeAgente] = { nome: nomeAgente, registros: [], contagem: {} };
        RISCO_ORDER.forEach((r) => { mapa[nomeAgente].contagem[r] = 0; });
      }
      mapa[nomeAgente].registros.push(q);
      mapa[nomeAgente].contagem[getRiscoLabel(q.risco)]++;
    }
    return Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [dados, userMap]);

  // Se há apenas 1 agente nos dados (filtro hierárquico aplicado), usa direto sem seleção interna
  const filtroHierarquicoAtivo = porAgente.length === 1;

  const agenteData = useMemo(() => {
    if (filtroHierarquicoAtivo) return porAgente[0];
    if (!agenteSelecionado) return null;
    return porAgente.find((a) => a.nome === agenteSelecionado) || null;
  }, [agenteSelecionado, porAgente, filtroHierarquicoAtivo]);

  // Dados para exportar: se filtro hierárquico ativo sem agente específico, usa todos os dados agrupados
  const registrosParaExportar = useMemo(() => {
    if (!agenteData) return [];
    return agenteData.registros;
  }, [agenteData]);

  const exportarPDF = async () => {
    if (!registrosParaExportar.length) return;
    setExporting(true);
    try {
      const { doc, contentStartY, usableW, marginLeft, pageH, addFooters } = await criarDocPDF({
        titulo: "Relatório por Agente",
        periodo: `${mesLabel}/${ano}`,
        unidade,
        instituicao,
        userName,
        orientation: "landscape",
      });

      let y = contentStartY;
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      const tituloAgente = agenteData ? `Agente: ${agenteData.nome} — ${registrosParaExportar.length} prontuário(s)` : `${registrosParaExportar.length} prontuário(s)`;
      doc.text(tituloAgente, marginLeft, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("Detalhamento dos Prontuários", marginLeft, y);
      y += 5;

      drawTable(doc, {
        startY: y,
        headers: ["Prontuário", "Responsável", "Endereço", "Risco", "Classificação", "Data"],
        rows: registrosParaExportar.map((q) => [
          q.id_user_app || "—",
          q.responsavel || "—",
          q.endereco || "—",
          q.risco ?? "—",
          getRiscoLabel(q.risco),
          q.data ? new Date(q.data).toLocaleDateString("pt-BR") : "—",
        ]),
        colWidths: [
          usableW * 0.12,
          usableW * 0.18,
          usableW * 0.28,
          usableW * 0.08,
          usableW * 0.20,
          usableW * 0.14,
        ],
        marginLeft,
        pageH,
      });

      addFooters();
      const nomeArquivo = agenteData
        ? `relatorio_agente_${agenteData.nome.replace(/\s+/g, "_")}_${mesLabel}_${ano}`
        : `relatorio_agentes_${mesLabel}_${ano}`;
      doc.save(`${nomeArquivo}.pdf`);
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">
          Período: <strong>{mesLabel}/{ano}</strong> — {dados.length} prontuário(s) em {porAgente.length} agente(s)
        </p>
        {/* Botão de export direto quando filtro hierárquico está ativo */}
        {filtroHierarquicoAtivo && (
          <Button onClick={exportarPDF} variant="outline" className="gap-2" disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Exportar PDF
          </Button>
        )}
      </div>

      {/* Seletor de agente: apenas quando há múltiplos agentes */}
      {!filtroHierarquicoAtivo && (
        <Card className="shadow-sm">
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5 flex-1 min-w-[220px]">
                <Label className="text-sm font-medium">Selecionar Agente</Label>
                <Select value={agenteSelecionado} onValueChange={setAgenteSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um agente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {porAgente.map((a) => (
                      <SelectItem key={a.nome} value={a.nome}>
                        {a.nome} ({a.registros.length} prontuário(s))
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {agenteData && (
                <Button onClick={exportarPDF} variant="outline" className="gap-2" disabled={exporting}>
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  Exportar PDF
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!agenteData && !filtroHierarquicoAtivo && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Selecione um agente para visualizar os dados.
        </div>
      )}

      {agenteData && (
        <>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{agenteData.nome}</span>
                <span className="text-sm font-normal text-muted-foreground">{agenteData.registros.length} prontuário(s)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {RISCO_ORDER.map((r) => (
                  <div key={r} className="border rounded-lg px-4 py-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{r}</p>
                    <p className="text-2xl font-bold text-primary">{agenteData.contagem[r]}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Prontuários</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-2 font-semibold text-xs uppercase">Prontuário</th>
                      <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Responsável</th>
                      <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Endereço</th>
                      <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Risco</th>
                      <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Classificação</th>
                      <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agenteData.registros.map((q, idx) => (
                      <tr key={q.id || idx} className="border-t hover:bg-muted/20">
                        <td className="px-4 py-2">{q.id_user_app || "—"}</td>
                        <td className="px-3 py-2">{q.responsavel || "—"}</td>
                        <td className="px-3 py-2">{q.endereco || "—"}</td>
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
        </>
      )}
    </div>
  );
}