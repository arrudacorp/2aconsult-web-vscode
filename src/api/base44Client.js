// src/api/base44Client.js
import { supabase } from '@/lib/supabase';

// Mapeamento de entidades para tabelas no Supabase
const entityToTable = {
  'AppUser': 'app_users',
  'Unidade': 'unidades',
  'Equipe': 'equipes',
  'Instituicao': 'instituicoes',
  'Questionario': 'questionarios',
  'Link': 'links',
  'Parametros': 'parametros',
  'User': 'app_users',
};

// Função segura para executar queries
const safeQuery = async (queryFn, entityName, defaultValue = []) => {
  try {
    return await queryFn();
  } catch (error) {
    console.warn(`⚠️ Erro para ${entityName}:`, error.message);
    return defaultValue;
  }
};

// Funções base para cada entidade
const createEntityAPI = (entityName, tableName) => {
  return {
    list: async () => {
      return safeQuery(async () => {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) throw error;
        return data || [];
      }, entityName, []);
    },
    
    get: async (id) => {
      return safeQuery(async () => {
        const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
        if (error) throw error;
        return data;
      }, entityName, null);
    },
    
    create: async (item) => {
      try {
        const { data, error } = await supabase.from(tableName).insert(item).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.warn(`⚠️ Erro ao criar em ${entityName}:`, error.message);
        return { ...item, id: Date.now() };
      }
    },
    
    update: async (id, updates) => {
      try {
        const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.warn(`⚠️ Erro ao atualizar em ${entityName}:`, error.message);
        return { ...updates, id };
      }
    },
    
    delete: async (id) => {
      try {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (error) {
        console.warn(`⚠️ Erro ao deletar em ${entityName}:`, error.message);
        return true;
      }
    },
    
    deleteMany: async (filter = {}) => {
      try {
        const { data: records, error: selectError } = await supabase.from(tableName).select('id');
        if (selectError) throw selectError;
        
        if (!records || records.length === 0) return true;
        
        for (const record of records) {
          await supabase.from(tableName).delete().eq('id', record.id);
        }
        return true;
      } catch (error) {
        console.warn(`⚠️ Erro ao deletar todos de ${entityName}:`, error.message);
        return true;
      }
    },
    
    bulkCreate: async (items) => {
      if (!items.length) return [];
      try {
        const { data, error } = await supabase.from(tableName).insert(items).select();
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.warn(`⚠️ Erro ao inserir em ${entityName}:`, error.message);
        return items;
      }
    },
  };
};

// Constroi o objeto entities
const entities = {};
for (const [entityName, tableName] of Object.entries(entityToTable)) {
  entities[entityName] = createEntityAPI(entityName, tableName);
}

// API Proxy
const functions = {
  invoke: async (name, params) => {
    if (name === 'apiProxy') {
      const { action, entity, id, data } = params;
      
      try {
        const { default: apiClient } = await import('@/lib/apiClient');
        
        if (action === 'list') {
          let result;
          switch (entity) {
            case 'users': result = await apiClient.getUsers(); break;
            case 'unidades': result = await apiClient.getUnidades(); break;
            case 'instituicoes': result = await apiClient.getInstituicoes(); break;
            case 'equipes': result = await apiClient.getEquipes(); break;
            case 'questionarios': result = await apiClient.getQuestionarios(); break;
            default: return { data: [] };
          }
          return { data: result || [] };
        }
        
        if (action === 'create') {
          let result;
          switch (entity) {
            case 'users': result = await apiClient.createUser(data); break;
            case 'unidades': result = await apiClient.createUnidade(data); break;
            case 'instituicoes': result = await apiClient.createInstituicao(data); break;
            case 'equipes': result = await apiClient.createEquipe(data); break;
            default: return { data: {} };
          }
          return { data: result || {} };
        }
        
        if (action === 'update') {
          let result;
          switch (entity) {
            case 'users': result = await apiClient.updateUser(id, data); break;
            case 'unidades': result = await apiClient.updateUnidade(id, data); break;
            case 'instituicoes': result = await apiClient.updateInstituicao(id, data); break;
            case 'equipes': result = await apiClient.updateEquipe(id, data); break;
            default: return { data: {} };
          }
          return { data: result || {} };
        }
        
        if (action === 'delete') {
          switch (entity) {
            case 'users': await apiClient.deleteUser(id); break;
            case 'unidades': await apiClient.deleteUnidade(id); break;
            case 'instituicoes': await apiClient.deleteInstituicao(id); break;
            case 'equipes': await apiClient.deleteEquipe(id); break;
            default: return { data: {} };
          }
          return { data: { success: true } };
        }
        
        if (action === 'resetSenha') {
          await apiClient.resetUserPassword(id, data);
          return { data: { success: true } };
        }
        
      } catch (error) {
        console.warn(`⚠️ Erro no apiProxy:`, error.message);
        return { data: [] };
      }
      
      return { data: [] };
    }
    return { data: [] };
  }
};

// Autenticação
const auth = {
  me: async () => {
    try {
      const storedUser = localStorage.getItem('system_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar usuário:', error.message);
      return null;
    }
  },
  logout: (redirectTo) => {
    localStorage.removeItem('system_user');
    window.location.href = redirectTo || '/login';
  }
};

// Usuários
const users = {
  list: async () => {
    try {
      const { data, error } = await supabase.from('system_users').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('⚠️ Erro ao listar usuários:', error.message);
      return [];
    }
  },
  inviteUser: async (email, role) => {
    try {
      const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
      const { data, error } = await supabase
        .from('system_users')
        .insert({
          email: email,
          nome: email.split('@')[0],
          password: tempPassword,
          role: role || 'user'
        })
        .select()
        .single();
      
      if (error) throw error;
      console.log(`Usuário criado: ${email}`);
      return { success: true, tempPassword };
    } catch (error) {
      console.warn('⚠️ Erro ao criar usuário:', error.message);
      throw error;
    }
  }
};

export const base44 = {
  entities,
  functions,
  auth,
  users,
  Entity: (name) => entities[name],
};

export const base44Client = base44;
export default base44;