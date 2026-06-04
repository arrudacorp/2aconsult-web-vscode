// src/pages/Dashboard.jsx
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MapPin, UsersRound, FileText, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/apiClient";
import { mapApiFields } from "@/lib/mapApiFields";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import QuestionarioChart from "@/components/dashboard/QuestionarioChart";


// Helpers de deduplicação por prontuário
function getProntuarioBase(prontuario) {
  if (!prontuario) return "";
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

const statCards = [
  { label: "Usuários (API)", icon: Users, entity: "AppUser", color: "bg-primary" },
  { label: "Unidades", icon: MapPin, entity: "Unidade", color: "bg-accent" },
  { label: "Questionários", icon: FileText, entity: "Questionario", color: "bg-chart-3" },
  { label: "Equipes", icon: UsersRound, entity: "Equipe", color: "bg-chart-4" },
];

// Configuração das entidades para sincronização
const SYNC_ENTITIES = [
  { label: "Usuários (API)", apiEntity: "users", localEntity: "AppUser", tableName: "app_users", idField: "user_app_id" },
  { label: "Unidades", apiEntity: "unidades", localEntity: "Unidade", tableName: "unidades", idField: "unidade_id" },
  { label: "Instituições", apiEntity: "instituicoes", localEntity: "Instituicao", tableName: "instituicoes", idField: "instituicao_id" },
  { label: "Equipes", apiEntity: "equipes", localEntity: "Equipe", tableName: "equipes", idField: "equipe_id" },
  { label: "Questionários", apiEntity: "questionarios", localEntity: "Questionario", tableName: "questionarios", idField: "questionario_id" },
];

// Mapeamento para buscar dados da API externa
const getApiData = async (apiEntity) => {
  console.log(`📡 Buscando dados da API para: ${apiEntity}`);
  
  switch(apiEntity) {
    case 'users':
      return await apiClient.getUsers();
    case 'unidades':
      return await apiClient.getUnidades();
    case 'instituicoes':
      return await apiClient.getInstituicoes();
    case 'equipes':
      return await apiClient.getEquipes();
    case 'questionarios':
      return await apiClient.getQuestionarios();
    default:
      console.warn(`Entidade não reconhecida: ${apiEntity}`);
      return [];
  }
};

// Mapeamento usando o mapApiFields existente
const mapEntityData = (apiEntity, items) => {
  if (!Array.isArray(items)) {
    console.warn(`Dados não são um array para ${apiEntity}:`, items);
    return [];
  }
  
  console.log(`📦 Mapeando ${items.length} registros para ${apiEntity} usando mapApiFields`);
  
  if (items.length > 0) {
    console.log(`📝 Exemplo do primeiro item original:`, items[0]);
  }
  
  // Usa o mapApiFields existente para fazer o mapeamento
  const mapped = items.map(item => {
    const mappedItem = mapApiFields(apiEntity, item);
    return {
      ...mappedItem,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  if (mapped.length > 0) {
    console.log(`📝 Exemplo do primeiro item mapeado:`, mapped[0]);
  }
  
  return mapped;
};

// Mutex para evitar sync concorrente
const dashSyncLocks = {};

// Função de sincronização para uma entidade
// Função de sincronização para uma entidade
async function syncEntity({ apiEntity, localEntity, tableName, idField }) {
  if (dashSyncLocks[localEntity]) {
    throw new Error("Sync já em andamento para " + localEntity);
  }
  
  dashSyncLocks[localEntity] = true;
  
  try {
    console.log(`🔄 Sincronizando ${localEntity}...`);
    
    // 1. Busca dados da API externa
    const apiData = await getApiData(apiEntity);
    const apiItems = Array.isArray(apiData) ? apiData : (apiData.data || apiData.items || []);
    
    // 2. Primeiro, APAGA todos os dados locais (sempre)
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      console.error(`❌ Erro ao deletar dados de ${tableName}:`, deleteError);
      throw deleteError;
    }
    
    console.log(`🗑️ Dados antigos de ${localEntity} removidos`);
    
    // 3. Se não há dados na API, retorna 0 (já limpou a tabela)
    if (apiItems.length === 0) {
      console.log(`⚠️ Nenhum dado encontrado na API para ${localEntity}, tabela limpa`);
      return 0;
    }
    
    console.log(`📦 API retornou ${apiItems.length} registros para ${localEntity}`);
    
    // 4. Mapeia os dados
    const mappedItems = mapEntityData(apiEntity, apiItems);
    
    if (mappedItems.length === 0) {
      console.warn(`⚠️ Nenhum item mapeado para ${localEntity}`);
      return 0;
    }
    
    // 5. Insere os novos dados em lotes de 50
    const BATCH = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < mappedItems.length; i += BATCH) {
      const batch = mappedItems.slice(i, i + BATCH);
      console.log(`📤 Inserindo lote ${Math.floor(i/BATCH) + 1} com ${batch.length} itens...`);
      
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(batch);
      
      if (insertError) {
        console.error(`❌ Erro detalhado do lote ${Math.floor(i/BATCH) + 1}:`, insertError);
        console.error(`📋 Primeiro item do lote com problema:`, batch[0]);
        throw insertError;
      }
      
      insertedCount += batch.length;
      console.log(`✅ Inserido lote ${Math.floor(i/BATCH) + 1} de ${Math.ceil(mappedItems.length/BATCH)} (${insertedCount}/${mappedItems.length})`);
    }
    
    console.log(`✅ Sincronizado ${insertedCount} registros de ${localEntity}`);
    return insertedCount;
    
  } catch (error) {
    console.error(`❌ Erro ao sincronizar ${localEntity}:`, error);
    throw error;
  } finally {
    delete dashSyncLocks[localEntity];
  }
}

// Funções para buscar dados locais do Supabase
const fetchLocalData = async (tableName) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Erro ao buscar dados de ${tableName}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Exceção ao buscar ${tableName}:`, error);
    return [];
  }
};

export default function Dashboard() {
  console.log('📊 DASHBOARD: Componente está renderizando');
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState(null);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, entity: '' });

  // Queries para dados locais do Supabase
  const usersQuery = useQuery({ 
    queryKey: ["AppUser"], 
    queryFn: () => fetchLocalData('app_users'), 
    initialData: [] 
  });
  
  const unidadesQuery = useQuery({ 
    queryKey: ["Unidade"], 
    queryFn: () => fetchLocalData('unidades'), 
    initialData: [] 
  });
  
  const questionariosQuery = useQuery({ 
    queryKey: ["Questionario"], 
    queryFn: () => fetchLocalData('questionarios'), 
    initialData: [] 
  });
  
  const equipesQuery = useQuery({ 
    queryKey: ["Equipe"], 
    queryFn: () => fetchLocalData('equipes'), 
    initialData: [] 
  });

  // Deduplica questionários: mantém apenas o mais recente por prontuário
  const totalProntuariosUnicos = useMemo(() => {
    const todos = questionariosQuery.data || [];
    const mapa = {};
    for (const q of todos) {
      const base = getProntuarioBase(q.id_user_app);
      const versao = getProntuarioVersion(q.id_user_app);
      if (!mapa[base] || versao > mapa[base]) {
        mapa[base] = versao;
      }
    }
    return Object.keys(mapa).length;
  }, [questionariosQuery.data]);

  // Handler para sincronização completa
  const handleSync = async () => {
    setSyncing(true);
    setSyncResults(null);
    const results = [];
    let completed = 0;
    
    try {
      for (const ent of SYNC_ENTITIES) {
        setSyncProgress({ 
          current: completed + 1, 
          total: SYNC_ENTITIES.length, 
          entity: ent.label 
        });
        
        try {
          const count = await syncEntity(ent);
          results.push({ 
            label: ent.label, 
            count, 
            ok: true 
          });
          toast.success(`${ent.label}: ${count} registros sincronizados`);
        } catch (e) {
          console.error(`Erro ao sincronizar ${ent.label}:`, e);
          results.push({ 
            label: ent.label, 
            error: e.message || 'Erro desconhecido', 
            ok: false 
          });
          toast.error(`${ent.label}: ${e.message || 'Erro desconhecido'}`);
        }
        
        completed++;
      }
      
      setSyncResults(results);
      
      // Invalida todas as queries para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ["AppUser"] });
      queryClient.invalidateQueries({ queryKey: ["Unidade"] });
      queryClient.invalidateQueries({ queryKey: ["Questionario"] });
      queryClient.invalidateQueries({ queryKey: ["Equipe"] });
      
      const failed = results.filter((r) => !r.ok);
      if (failed.length === 0) {
        toast.success("Sincronização concluída com sucesso!");
      } else {
        toast.warning(`Sincronização concluída com ${failed.length} erro(s).`);
      }
      
    } catch (error) {
      console.error("Erro na sincronização:", error);
      toast.error("Erro durante a sincronização");
    } finally {
      setSyncing(false);
      setSyncProgress({ current: 0, total: 0, entity: '' });
    }
  };

  // Mapeia os dados para os cards
  const queriesMap = {
    AppUser: { data: usersQuery.data },
    Unidade: { data: unidadesQuery.data },
    Questionario: { data: { length: totalProntuariosUnicos } },
    Equipe: { data: equipesQuery.data },
  };

  return (
    <div>
      {/* Cabeçalho com título e botão de sincronização */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? `Sincronizando ${syncProgress.entity} (${syncProgress.current}/${syncProgress.total})...` : "Sincronizar com API"}
        </Button>
      </div>

      {/* Barra de progresso da sincronização */}
      {syncing && syncProgress.total > 0 && (
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-2 transition-all duration-300"
              style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Sincronizando {syncProgress.entity}... ({syncProgress.current}/{syncProgress.total})
          </p>
        </div>
      )}

      {/* Cards de resultados da sincronização */}
      {syncResults && !syncing && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {syncResults.map((r) => (
            <div
              key={r.label}
              className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-2 ${
                r.ok 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-destructive/5 border-destructive/20"
              }`}
            >
              {r.ok
                ? <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                : <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />}
              <div>
                <p className="font-medium">{r.label}</p>
                <p className="text-muted-foreground text-xs">
                  {r.ok ? `${r.count} registros` : r.error}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gráfico de Questionários */}
      <div className="mb-8">
        <QuestionarioChart questionarios={questionariosQuery.data || []} />
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s) => {
          const Icon = s.icon;
          let count = 0;
          
          if (s.entity === "Questionario") {
            count = totalProntuariosUnicos;
          } else {
            count = queriesMap[s.entity]?.data?.length || 0;
          }
          
          return (
            <Card key={s.label} className="relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${s.color} opacity-10 translate-x-6 -translate-y-6`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${s.color}/10`}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}