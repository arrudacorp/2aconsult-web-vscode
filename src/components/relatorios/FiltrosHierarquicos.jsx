import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function FiltrosHierarquicos({
  unidades,
  equipes,
  appUsers,
  selectedUnidade,
  selectedEquipe,
  selectedAgente,
  onUnidadeChange,
  onEquipeChange,
  onAgenteChange,
}) {
  // Equipes da unidade selecionada (mesmo CNES)
  const equipesDaUnidade = useMemo(() => {
    if (!selectedUnidade) return [];
    return equipes.filter((e) => e.cnes && e.cnes === selectedUnidade.cnes);
  }, [selectedUnidade, equipes]);

  // AppUsers da equipe selecionada (mesmo INE)
  const agentesDaEquipe = useMemo(() => {
    if (!selectedEquipe) return [];
    return appUsers.filter((u) => u.ine && u.ine === selectedEquipe.ine && u.ativo !== false);
  }, [selectedEquipe, appUsers]);

  const handleUnidadeChange = (val) => {
    const unid = unidades.find((u) => String(u.unidade_id) === val) || null;
    onUnidadeChange(unid);
    onEquipeChange(null);
    onAgenteChange(null);
  };

  const handleEquipeChange = (val) => {
    if (val === "__limpar__") {
      onEquipeChange(null);
      onAgenteChange(null);
      return;
    }
    const eq = equipesDaUnidade.find((e) => String(e.equipe_id) === val) || null;
    onEquipeChange(eq);
    onAgenteChange(null);
  };

  const handleAgenteChange = (val) => {
    if (val === "__limpar__") {
      onAgenteChange(null);
      return;
    }
    const ag = agentesDaEquipe.find((u) => String(u.id_user_api) === val) || null;
    onAgenteChange(ag);
  };

  const limparTudo = () => {
    onUnidadeChange(null);
    onEquipeChange(null);
    onAgenteChange(null);
  };

  const temFiltro = selectedUnidade || selectedEquipe || selectedAgente;

  return (
    <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Filtro por Unidade / Equipe / Agente</p>
        {temFiltro && (
          <Button variant="ghost" size="sm" onClick={limparTudo} className="gap-1 text-muted-foreground h-7 text-xs">
            <X className="w-3 h-3" /> Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Unidade */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Unidade</Label>
          <Select
            value={selectedUnidade ? String(selectedUnidade.unidade_id) : ""}
            onValueChange={handleUnidadeChange}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Selecione a unidade..." />
            </SelectTrigger>
            <SelectContent>
              {unidades.map((u) => (
                <SelectItem key={u.unidade_id} value={String(u.unidade_id)}>
                  {u.nome_unidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Equipe */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Equipe</Label>
          <Select
            value={selectedEquipe ? String(selectedEquipe.equipe_id) : ""}
            onValueChange={handleEquipeChange}
            disabled={!selectedUnidade}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={selectedUnidade ? "Selecione a equipe..." : "Selecione a unidade primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {equipesDaUnidade.length === 0 ? (
                <SelectItem value="__vazio__" disabled>Nenhuma equipe encontrada</SelectItem>
              ) : (
                equipesDaUnidade.map((e) => (
                  <SelectItem key={e.equipe_id} value={String(e.equipe_id)}>
                    {e.descricao} {e.ine ? `(INE: ${e.ine})` : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Agente (opcional) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            Agente <span className="text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <Select
            value={selectedAgente ? String(selectedAgente.id_user_api) : ""}
            onValueChange={handleAgenteChange}
            disabled={!selectedEquipe}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={selectedEquipe ? "Todos os agentes" : "Selecione a equipe primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {selectedAgente && (
                <SelectItem value="__limpar__">— Todos os agentes —</SelectItem>
              )}
              {agentesDaEquipe.length === 0 ? (
                <SelectItem value="__vazio__" disabled>Nenhum agente encontrado</SelectItem>
              ) : (
                agentesDaEquipe.map((u) => (
                  <SelectItem key={u.id_user_api} value={String(u.id_user_api)}>
                    {u.home_user}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumo do filtro ativo */}
      {selectedEquipe && (
        <p className="text-xs text-muted-foreground pt-1">
          {selectedAgente
            ? <>Exibindo registros do agente <strong>{selectedAgente.home_user}</strong></>
            : <>Exibindo todos os registros da equipe <strong>{selectedEquipe.descricao}</strong></>
          }
        </p>
      )}
    </div>
  );
}