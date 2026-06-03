// src/lib/apiClient.js
import { supabase } from './supabase';

let cachedApiBaseUrl = null;

// Busca a URL da API dos parâmetros no Supabase
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
      return '/api-proxy-producao';
    }
    
    let proxyPath;
    if (data.modo === 'teste') {
      proxyPath = '/api-proxy-teste';
      console.log('🔧 Modo TESTE ativado');
    } else {
      proxyPath = '/api-proxy-producao';
      console.log('🔧 Modo PRODUÇÃO ativado');
    }
    
    cachedApiBaseUrl = proxyPath;
    console.log(`🔧 API Client usando proxy: ${cachedApiBaseUrl}`);
    return cachedApiBaseUrl;
  } catch (err) {
    console.warn('Erro ao buscar parâmetros:', err);
    return '/api-proxy-producao';
  }
}

// Função para fazer requisições com a URL correta
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Verifica se a resposta tem conteúdo antes de tentar parsear JSON
    const text = await response.text();
    
    // Se a resposta estiver vazia, retorna um objeto vazio ou null
    if (!text || text.trim() === '') {
      console.log('⚠️ Resposta vazia da API');
      return { success: true };
    }
    
    // Tenta parsear o JSON
    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.warn('⚠️ Resposta não é JSON válido:', text.substring(0, 100));
      return { raw: text, success: true };
    }
  } catch (error) {
    console.error(`❌ Erro na requisição para ${url}:`, error);
    throw error;
  }
}

// Limpa o cache da URL
export function clearApiUrlCache() {
  cachedApiBaseUrl = null;
  console.log('🗑️ Cache da URL da API limpo');
}

// Cria o objeto apiClient
const apiClient = {
  // Instituições
  async getInstituicoes() {
    return fetchFromApi('/instituicoes');
  },
  
  async createInstituicao(data) {
    return fetchFromApi('/instituicao', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async updateInstituicao(id, data) {
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

  // Unidades
  async getUnidades() {
    return fetchFromApi('/unidades');
  },
  
  async createUnidade(data) {
    return fetchFromApi('/unidade', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async updateUnidade(id, data) {
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

  // Equipes
  async getEquipes() {
    return fetchFromApi('/equipes');
  },
  
  async createEquipe(data) {
    return fetchFromApi('/equipe', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async updateEquipe(id, data) {
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

  // Usuários
  async getUsers() {
    return fetchFromApi('/users');
  },
  
  async createUser(data) {
    return fetchFromApi('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async updateUser(id, data) {
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

  // Questionários
  async getQuestionarios() {
    const data = await fetchFromApi('/questionarios');
    console.log(`📊 API retornou ${Array.isArray(data) ? data.length : '?'} questionários`);
    return data;
  },
  
  async getQuestionariosByUser(userId) {
    return fetchFromApi(`/users/${userId}/questionarios?limit=200`);
  },
  
  async getQuestionariosByDate(date) {
    return fetchFromApi(`/questionarios/data/${date}`);
  },
  
  async createQuestionario(data) {
    return fetchFromApi('/questionarios', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async updateQuestionario(id, data) {
    return fetchFromApi(`/questionarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  async deleteQuestionario(id) {
    return fetchFromApi(`/questionarios/${id}`, {
      method: 'DELETE'
    });
  }
};

// Exporta como default e como named export
export default apiClient;
export { apiClient };