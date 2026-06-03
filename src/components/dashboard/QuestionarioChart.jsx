import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Retorna o número de versão do prontuário para comparação
function getProntuarioVersion(prontuario) {
  if (!prontuario) return 0;
  const str = String(prontuario);
  const slashIdx = str.indexOf("/");
  if (slashIdx === -1) return 0;
  const after = str.substring(slashIdx + 1).trim();
  const num = parseInt(after, 10);
  return isNaN(num) ? 0 : num;
}

// Extrai a chave base do prontuário (parte antes do "/")
function getProntuarioBase(prontuario) {
  if (!prontuario) return String(prontuario);
  const str = String(prontuario);
  const slashIdx = str.indexOf("/");
  if (slashIdx === -1) return str.trim();
  return str.substring(0, slashIdx).trim();
}

// Mapeia valor numérico do campo risco para categoria
function getRiscoCategory(risco) {
  const val = parseInt(risco, 10);
  if (isNaN(val) || val <= 4) return "Sem Risco";
  if (val <= 6) return "R1 - Risco Menor";
  if (val <= 8) return "R2 - Risco Médio";
  return "R3 - Risco Máximo";
}

const RISCO_ORDER = ["Sem Risco", "R1 - Risco Menor", "R2 - Risco Médio", "R3 - Risco Máximo"];
const COLORS = ["#4caf50", "#ff9800", "#f44336", "#9c27b0"];

export default function QuestionarioChart({ questionarios }) {
  const chartData = useMemo(() => {
    if (!questionarios || questionarios.length === 0) return [];

    // Agrupar por prontuário base e manter apenas o mais recente (maior versão)
    const mapaRecentes = {};
    for (const q of questionarios) {
      const base = getProntuarioBase(q.id_user_app);
      const versao = getProntuarioVersion(q.id_user_app);
      if (!mapaRecentes[base] || versao > mapaRecentes[base].versao) {
        mapaRecentes[base] = { ...q, versao };
      }
    }

    // Contar por categoria de risco
    const contagem = { "Sem Risco": 0, "R1 - Risco Menor": 0, "R2 - Risco Médio": 0, "R3 - Risco Máximo": 0 };
    for (const q of Object.values(mapaRecentes)) {
      const categoria = getRiscoCategory(q.risco);
      contagem[categoria] = (contagem[categoria] || 0) + 1;
    }

    return RISCO_ORDER.map((name) => ({ name, value: contagem[name] || 0 }));
  }, [questionarios]);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Classificação de Risco dos Prontuários</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Nenhum questionário encontrado
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Classificação de Risco dos Prontuários</CardTitle>
        <p className="text-xs text-muted-foreground">{total} prontuários (registro mais recente por paciente)</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={95}
              dataKey="value"
              label={({ name, value, percent }) =>
                `${value} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} prontuário(s)`, name]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}