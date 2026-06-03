import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function QuestionariosPage() {
  const [users, setUsers] = useState([]);
  const [allQuestionarios, setAllQuestionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortKey, setSortKey] = useState("data");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    Promise.all([
      base44.entities.AppUser.list(),
      base44.entities.Questionario.list(),
    ]).then(([u, q]) => {
      setUsers(u);
      setAllQuestionarios(q);
    }).finally(() => setLoading(false));
  }, []);

  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => { map[u.id_user_api] = u.home_user; });
    return map;
  }, [users]);

  // Helpers de deduplicação por prontuário
  function getProntuarioBase(prontuario) {
    if (!prontuario) return String(prontuario || "");
    const str = String(prontuario);
    const idx = str.indexOf("/");
    return idx === -1 ? str.trim() : str.substring(0, idx).trim();
  }

  function getProntuarioVersion(prontuario) {
    if (!prontuario) return 0;
    const str = String(prontuario);
    const idx = str.indexOf("/");
    if (idx === -1) return 0;
    const num = parseInt(str.substring(idx + 1).trim(), 10);
    return isNaN(num) ? 0 : num;
  }

  const deduplicado = useMemo(() => {
    // 1. Aplica filtros
    const comFiltro = allQuestionarios.filter((q) => {
      if (selectedUser && String(q.id_user) !== selectedUser) return false;
      if (filterDate && q.data) {
        const qDate = q.data.substring(0, 10);
        if (qDate !== filterDate) return false;
      }
      return true;
    });

    // 2. Deduplica: mantém apenas o registro mais recente por prontuário
    const mapa = {};
    for (const q of comFiltro) {
      const base = getProntuarioBase(q.id_user_app);
      const versao = getProntuarioVersion(q.id_user_app);
      if (!mapa[base] || versao > mapa[base].versao) {
        mapa[base] = { ...q, versao };
      }
    }

    return Object.values(mapa);
  }, [allQuestionarios, selectedUser, filterDate]);

  // 3. Ordena dinamicamente pela coluna selecionada
  const filtered = useMemo(() => {
    return [...deduplicado].sort((a, b) => {
      let vA = a[sortKey];
      let vB = b[sortKey];
      // Ordenação numérica para risco
      if (sortKey === "risco") {
        vA = Number(vA) || 0;
        vB = Number(vB) || 0;
        return sortDir === "asc" ? vA - vB : vB - vA;
      }
      // Ordenação por data
      if (sortKey === "data") {
        vA = vA ? new Date(vA).getTime() : 0;
        vB = vB ? new Date(vB).getTime() : 0;
        return sortDir === "asc" ? vA - vB : vB - vA;
      }
      // Ordenação por agente (resolução via userMap)
      if (sortKey === "id_user") {
        vA = userMap[vA] || String(vA || "");
        vB = userMap[vB] || String(vB || "");
      }
      vA = String(vA || "").toLowerCase();
      vB = String(vB || "").toLowerCase();
      const cmp = vA.localeCompare(vB, "pt-BR");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [deduplicado, sortKey, sortDir, userMap]);

  const clearFilters = () => {
    setSelectedUser("");
    setFilterDate("");
  };

  const getRiscoClass = (risco) => {
    const val = Number(risco);
    if (isNaN(val)) return { label: "—", className: "" };
    if (val <= 4) return { label: "Sem Risco", className: "bg-green-100 text-green-800 border-green-200" };
    if (val <= 6) return { label: "R1 - Risco Menor", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    if (val <= 8) return { label: "R2 - Risco Médio", className: "bg-orange-100 text-orange-800 border-orange-200" };
    return { label: "R3 - Risco Máximo", className: "bg-red-100 text-red-800 border-red-200" };
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 ml-1 text-primary" />
      : <ChevronDown className="w-3 h-3 ml-1 text-primary" />;
  };

  const COLS = [
    { key: "data", label: "Data" },
    { key: "id_user", label: "Agente" },
    { key: "id_user_app", label: "Prontuário" },
    { key: "responsavel", label: "Responsável" },
    { key: "endereco", label: "Endereço" },
    { key: "risco", label: "Risco" },
    { key: "risco_label", label: "Classificação", noSort: true },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Questionários</h2>

      <Card className="mb-6 shadow-sm">
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-4 items-end flex-wrap">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label className="text-sm font-medium">Filtrar por Agente</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os agentes" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.user_app_id} value={String(u.id_user_api)}>
                      {u.home_user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Filtrar por Data</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-44"
              />
            </div>

            {(selectedUser || filterDate) && (
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="w-4 h-4" /> Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-base font-semibold">Questionários ({filtered.length} registros)</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {COLS.map((col) => (
                    <TableHead
                      key={col.key + col.label}
                      className={`font-semibold text-xs uppercase tracking-wider select-none ${!col.noSort ? "cursor-pointer hover:text-primary" : ""}`}
                      onClick={() => !col.noSort && handleSort(col.key)}
                    >
                      <span className="inline-flex items-center">
                        {col.label}
                        {!col.noSort && <SortIcon colKey={col.key} />}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLS.length} className="text-center py-10 text-muted-foreground">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((q, idx) => {
                    const { label: riscoLabel, className: riscoClass } = getRiscoClass(q.risco);
                    return (
                      <TableRow key={q.id || idx} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-sm">{q.data ? new Date(q.data).toLocaleDateString("pt-BR") : "—"}</TableCell>
                        <TableCell className="text-sm">{userMap[q.id_user] || (q.id_user ? `ID: ${q.id_user}` : "—")}</TableCell>
                        <TableCell className="text-sm">{q.id_user_app || "—"}</TableCell>
                        <TableCell className="text-sm">{q.responsavel || "—"}</TableCell>
                        <TableCell className="text-sm">{q.endereco || "—"}</TableCell>
                        <TableCell className="text-sm">{q.risco ?? "—"}</TableCell>
                        <TableCell className="text-sm">
                          {riscoLabel !== "—" ? <Badge className={riscoClass}>{riscoLabel}</Badge> : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}