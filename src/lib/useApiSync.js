// src/lib/useApiSync.js
import { useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { mapApiFields } from "@/lib/mapApiFields";

// Mutex simples para evitar sync concorrente por entidade
const syncLocks = {};

// Função de sincronização: busca da API e substitui no local
async function syncWithApi(entityName, apiEntity) {
  if (syncLocks[entityName]) return;
  syncLocks[entityName] = true;
  
  try {
    console.log(`🔄 Sincronizando ${entityName} com a API...`);
    
    // 1. Busca dados da API externa
    const res = await base44.functions.invoke("apiProxy", { 
      action: "list", 
      entity: apiEntity 
    });
    const apiData = Array.isArray(res.data) ? res.data : [];
    
    if (apiData.length === 0) {
      console.log(`⚠️ Nenhum dado encontrado na API para ${entityName}`);
      return [];
    }
    
    // 2. Mapeia os dados
    const mapped = apiData.map((item) => mapApiFields(apiEntity, item));
    
    // 3. Apaga todos os dados locais do Supabase
    await base44.entities[entityName].deleteMany({});
    
    // 4. Insere os novos dados em lotes de 50
    const BATCH = 50;
    for (let i = 0; i < mapped.length; i += BATCH) {
      await base44.entities[entityName].bulkCreate(mapped.slice(i, i + BATCH));
    }
    
    console.log(`✅ Sincronizado ${mapped.length} registros de ${entityName}`);
    return mapped;
    
  } catch (err) {
    console.error(`Erro ao sincronizar ${entityName}:`, err);
    throw err;
  } finally {
    syncLocks[entityName] = false;
  }
}

export function useApiSync(entityName, apiEntity, idField) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega dados do Supabase (local)
  const loadFromApi = useCallback(async () => {
    setLoading(true);
    try {
      const localData = await base44.entities[entityName].list();
      setData(localData || []);
    } catch (err) {
      console.error(`Erro ao carregar ${entityName}:`, err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [entityName]);

  // Sincronização completa (usado no Dashboard)
  const syncFromApi = useCallback(async () => {
    setLoading(true);
    try {
      const syncedData = await syncWithApi(entityName, apiEntity);
      setData(syncedData || []);
      toast.success(`${entityName} sincronizado com sucesso!`);
      return syncedData;
    } catch (err) {
      toast.error(`Erro ao sincronizar ${entityName}: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityName, apiEntity]);

  // Criar: primeiro na API, depois sincroniza local
  const createItem = useCallback(async (itemData) => {
    setLoading(true);
    try {
      // 1. Envia para API externa primeiro
      await base44.functions.invoke("apiProxy", {
        action: "create",
        entity: apiEntity,
        data: itemData,
      });
      toast.success("Registro salvo na API!");
      
      // 2. Sincroniza local (apaga tudo e recarrega da API)
      const syncedData = await syncWithApi(entityName, apiEntity);
      setData(syncedData);
      
    } catch (err) {
      toast.error(`Erro ao criar registro: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityName, apiEntity]);

  // Atualizar: primeiro na API, depois sincroniza local
  const updateItem = useCallback(async (apiId, itemData) => {
    setLoading(true);
    try {
      // 1. Atualiza na API externa primeiro
      await base44.functions.invoke("apiProxy", {
        action: "update",
        entity: apiEntity,
        id: apiId,
        data: itemData,
      });
      toast.success("Registro atualizado na API!");
      
      // 2. Sincroniza local (apaga tudo e recarrega da API)
      const syncedData = await syncWithApi(entityName, apiEntity);
      setData(syncedData);
      
    } catch (err) {
      toast.error(`Erro ao atualizar registro: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityName, apiEntity]);

  // Deletar: primeiro na API, depois sincroniza local
  const deleteItem = useCallback(async (apiId) => {
    setLoading(true);
    try {
      // 1. Remove da API externa primeiro
      await base44.functions.invoke("apiProxy", {
        action: "delete",
        entity: apiEntity,
        id: apiId,
      });
      toast.success("Registro removido da API!");
      
      // 2. Sincroniza local (apaga tudo e recarrega da API)
      const syncedData = await syncWithApi(entityName, apiEntity);
      setData(syncedData);
      
    } catch (err) {
      toast.error(`Erro ao excluir registro: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityName, apiEntity]);

  return { 
    data, 
    loading, 
    loadFromApi, 
    syncFromApi,
    createItem, 
    updateItem, 
    deleteItem 
  };
}