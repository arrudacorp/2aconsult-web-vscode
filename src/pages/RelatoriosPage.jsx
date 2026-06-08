// src/pages/RelatoriosPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import RelatorioSintetico from "@/components/relatorios/RelatorioSintetico";
import RelatorioAnalitico from "@/components/relatorios/RelatorioAnalitico";
import RelatorioAgente from "@/components/relatorios/RelatorioAgente";
import FiltrosHierarquicos from "@/components/relatorios/FiltrosHierarquicos";
import { criarDocPDF, drawTable } from "@/lib/pdfUtils";
import { deduplicarQuestionarios } from "@/lib/prontuarioUtils";

export function getRiscoLabel(risco) {
  const val = parseInt(risco, 10);
  if (isNaN(val) || val <= 4) return "Sem Risco";
  if (val <= 6) return "R1 - Risco Menor";
  if (val <= 8) return "R2 - Risco Médio";
  return "R3 - Risco Máximo";
}

export function getRiscoClassName(risco) {
  const val = parseInt(risco, 10);
  if (isNaN(val) || val <= 4) return "bg-green-100 text-green-800 border-green-200";
  if (val <= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (val <= 8) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export default function RelatoriosPage() {
  const [questionarios, setQuestionarios] = useState([]);
  const [users, setUsers] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [instituicao, setInstituicao] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filtroUnidade, setFiltroUnidade] = useState(null);
  const [filtroEquipe, setFiltroEquipe] = useState(null);
  const [filtroAgente, setFiltroAgente] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Questionario.list(),
      base44.entities.AppUser.list(),
      base44.entities.Unidade.list(),
      base44.entities.Equipe.list(),
      base44.entities.Instituicao.list(),
      base44.auth.me().catch(() => null),
    ]).then(([q, u, unids, eqs, insts, me]) => {
      setQuestionarios(q);
      setUsers(u);
      setUnidades(unids);
      setEquipes(eqs);
      setInstituicao(insts[0] || null);
      setCurrentUser(me);
    }).finally(() => setLoading(false));
  }, []);

  const userMap = useMemo(() => {
    const m = {};
    users.forEach((u) => { m[u.id_user_api] = u.home_user; });
    return m;
  }, [users]);

  const idsAgentesDaEquipe = useMemo(() => {
    if (!filtroEquipe) return null;
    const ine = filtroEquipe.ine;
    const agentesVinculados = users.filter((u) => u.ine && u.ine === ine);
    return new Set(agentesVinculados.map((u) => u.id_user_api));
  }, [filtroEquipe, users]);

  // Dados filtrados pela hierarquia e deduplicados
  const dadosFiltrados = useMemo(() => {
    let resultado = questionarios;
    
    // Aplica filtro hierárquico
    if (filtroEquipe) {
      resultado = resultado.filter((q) => {
        if (!idsAgentesDaEquipe || !idsAgentesDaEquipe.has(q.id_user)) return false;
        if (filtroAgente && q.id_user !== filtroAgente.id_user_api) return false;
        return true;
      });
    }
    
    // Deduplica por prontuário (mantém apenas o mais recente)
    return deduplicarQuestionarios(resultado);
  }, [questionarios, filtroEquipe, filtroAgente, idsAgentesDaEquipe]);

  const [exporting, setExporting] = useState(false);

  const exportarProntuariosPDF = async () => {
    if (!dadosFiltrados.length) return;
    setExporting(true);
    try {
      const { doc, contentStartY, usableW, marginLeft, pageH, addFooters } = await criarDocPDF({
        titulo: "Relatório por Prontuários",
        periodo: "Todos os períodos",
        unidade: unidadePdf,
        instituicao,
        userName: currentUser?.full_name || currentUser?.email || "—",
        orientation: "landscape",
      });

      let y = contentStartY;
      let subtitulo = "";
      if (filtroAgente) subtitulo = `Agente: ${filtroAgente.home_user}`;
      else if (filtroEquipe) subtitulo = `Equipe: ${filtroEquipe.descricao}`;
      else if (filtroUnidade) subtitulo = `Unidade: ${filtroUnidade.nome_unidade}`;
      if (subtitulo) {
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.text(subtitulo, marginLeft, y);
        y += 7;
      }

      drawTable(doc, {
        startY: y,
        headers: ["Prontuário", "Agente", "Responsável", "Endereço", "Risco", "Classificação", "Data"],
        rows: dadosFiltrados.map((q) => [
          q.id_user_app || "—",
          userMap[q.id_user] || (q.id_user ? `ID: ${q.id_user}` : "—"),
          q.responsavel || "—",
          q.endereco || "—",
          q.risco ?? "—",
          getRiscoLabel(q.risco),
          q.data ? new Date(q.data).toLocaleDateString("pt-BR") : "—",
        ]),
        colWidths: [
          usableW * 0.10,
          usableW * 0.16,
          usableW * 0.16,
          usableW * 0.24,
          usableW * 0.07,
          usableW * 0.16,
          usableW * 0.11,
        ],
        marginLeft,
        pageH,
      });

      addFooters();
      const slug = (filtroAgente?.home_user || filtroEquipe?.descricao || filtroUnidade?.nome_unidade || "todos")
        .replace(/\s+/g, "_").toLowerCase();
      doc.save(`prontuarios_${slug}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const unidadePdf = filtroUnidade || unidades[0] || null;

  const pdfProps = {
    unidade: unidadePdf,
    instituicao,
    userName: currentUser?.full_name || currentUser?.email || "—",
    mesLabel: "Todos",
    ano: "Todos",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Relatórios</h2>

      <Card className="mb-4 shadow-sm">
        <CardContent className="pt-5 space-y-4">
          
          {/* ÁREA DO FILTRO HIERÁRQUICO */}
          <div className="space-y-3">
            <FiltrosHierarquicos
              unidades={unidades}
              equipes={equipes}
              appUsers={users}
              selectedUnidade={filtroUnidade}
              selectedEquipe={filtroEquipe}
              selectedAgente={filtroAgente}
              onUnidadeChange={setFiltroUnidade}
              onEquipeChange={setFiltroEquipe}
              onAgenteChange={setFiltroAgente}
            />
            
            {/* Botão Exportar Prontuários */}
            {(filtroEquipe || filtroAgente) && dadosFiltrados.length > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={exportarProntuariosPDF}
                  variant="outline"
                  className="gap-2"
                  disabled={exporting}
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  Exportar Prontuários ({dadosFiltrados.length})
                </Button>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="sintetico">
          <TabsList className="mb-6">
            <TabsTrigger value="sintetico">Sintético</TabsTrigger>
            <TabsTrigger value="analitico">Analítico</TabsTrigger>
            <TabsTrigger value="agente">Por Agente</TabsTrigger>
          </TabsList>

          <TabsContent value="sintetico">
            <RelatorioSintetico dados={dadosFiltrados} userMap={userMap} {...pdfProps} />
          </TabsContent>

          <TabsContent value="analitico">
            <RelatorioAnalitico dados={dadosFiltrados} userMap={userMap} {...pdfProps} />
          </TabsContent>

          <TabsContent value="agente">
            <RelatorioAgente dados={dadosFiltrados} userMap={userMap} {...pdfProps} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}