// src/lib/apiClient.js
import { supabase } from './supabase';

let cachedApiBaseUrl = null;

async function getApiBaseUrl() {
  if (cachedApiBaseUrl) return cachedApiBaseUrl;
  
  try {
    const { data, error } = await supabase
      .from('parametros')
      .select('modo, url_producao, url_teste')
      .limit(1)
      .single();
    
    if (error) {
      console.warn('Erro ao buscar parâmetros:', error);
      return 'https://api-teste.2aconsult.com.br';
    }
    
    const url = data.modo === 'teste' ? data.url_teste : data.url_producao;
    cachedApiBaseUrl = url || 'https://api-teste.2aconsult.com.br';
    console.log(`🔧 API Client usando URL: ${cachedApiBaseUrl} (modo: ${data.modo})`);
    return cachedApiBaseUrl;
  } catch (err) {
    console.warn('Erro ao buscar parâmetros:', err);
    return 'https://api-teste.2aconsult.com.br';
  }
}

async function fetchFromApi(endpoint, options = {}) {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  console.log(`📡 Fetch: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    // Verifica se a resposta tem conteúdo
    const text = await response.text();
    
    // Se a resposta estiver vazia, retorna um objeto de sucesso
    if (!text || text.trim() === '') {
      console.log('✅ Resposta vazia (PUT/DELETE bem sucedido)');
      return { success: true };
    }
    
    // Tenta parsear como JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.warn('⚠️ Resposta não é JSON:', text);
      return { raw: text, success: true };
    }
  } catch (error) {
    console.error(`❌ Erro na requisição:`, error);
    throw error;
  }
}

export const apiClient = {
  async getInstituicoes() { return fetchFromApi('/instituicoes'); },
  async getUnidades() { return fetchFromApi('/unidades'); },
  async getEquipes() { return fetchFromApi('/equipes'); },
  async getUsers() { return fetchFromApi('/users'); },
  async getQuestionarios() { return fetchFromApi('/questionarios'); },
  
  async createInstituicao(data) { 
    return fetchFromApi('/instituicao', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }); 
  },
  
  async updateInstituicao(id, data) { 
    console.log(`✏️ Atualizando instituição ${id}:`, data);
    return fetchFromApi(`/instituicao/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }); 
  },
  
  async deleteInstituicao(id) { 
    return fetchFromApi(`/instituicao/${id}`, { 
      method: 'DELETE' 
    }); 
  },
  
  async createUnidade(data) { 
    return fetchFromApi('/unidade', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }); 
  },
  
  async updateUnidade(id, data) { 
    console.log(`✏️ Atualizando unidade ${id}:`, data);
    return fetchFromApi(`/unidade/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }); 
  },
  
  async deleteUnidade(id) { 
    return fetchFromApi(`/unidade/${id}`, { 
      method: 'DELETE' 
    }); 
  },
  
  async createEquipe(data) { 
    return fetchFromApi('/equipe', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }); 
  },
  
  async updateEquipe(id, data) { 
    console.log(`✏️ Atualizando equipe ${id}:`, data);
    return fetchFromApi(`/equipe/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }); 
  },
  
  async deleteEquipe(id) { 
    return fetchFromApi(`/equipe/${id}`, { 
      method: 'DELETE' 
    }); 
  },
  
  async createUser(data) { 
    return fetchFromApi('/users', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }); 
  },
  
  async updateUser(id, data) { 
    console.log(`✏️ Atualizando usuário ${id}:`, data);
    return fetchFromApi(`/users/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }); 
  },
  
  async deleteUser(id) { 
    return fetchFromApi(`/users/${id}`, { 
      method: 'DELETE' 
    }); 
  },
  
  async resetUserPassword(id, senha) { 
    return fetchFromApi(`/users/${id}/senha`, { 
      method: 'PUT', 
      body: JSON.stringify({ senha }) 
    }); 
  },
  
  async getQuestionariosByUser(userId) { 
    return fetchFromApi(`/users/${userId}/questionarios?limit=200`); 
  },
  
  async getQuestionariosByDate(date) { 
    return fetchFromApi(`/questionarios/data/${date}`); 
  },
};

export default apiClient;