// src/lib/apiClient.js
import { supabase } from './supabase';

let cachedApiBaseUrl = null;

// Busca a URL da API dos parâmetros no Supabase
async function getApiBaseUrl() {
  // Em produção (Vercel), usa o proxy serverless
  if (import.meta.env.PROD) {
    console.log('🔧 Produção: usando proxy serverless');
    return '/api/proxy';
  }
  
  // Em desenvolvimento, usa o proxy do Vite
  if (import.meta.env.DEV && cachedApiBaseUrl === null) {
    console.log('🔧 Desenvolvimento: usando proxy local');
    return '/api-proxy';
  }
  
  if (cachedApiBaseUrl) return cachedApiBaseUrl;
  
  try {
    const { data, error } = await supabase
      .from('parametros')
      .select('modo, url_producao, url_teste')
      .limit(1)
      .single();
    
    if (error) throw error;
    
    const url = data.modo === 'teste' ? data.url_teste : data.url_producao;
    cachedApiBaseUrl = url || 'http://179.0.177.138:8091';
    
    console.log(`🔧 API Client usando URL: ${cachedApiBaseUrl} (modo: ${data.modo})`);
    return cachedApiBaseUrl;
  } catch (err) {
    console.warn('Erro ao buscar parâmetros, usando URL padrão:', err);
    return import.meta.env.DEV ? '/api-proxy' : '/api/proxy';
  }
}

// Função para fazer requisições com a URL correta
async function fetchFromApi(endpoint, options = {}) {
  const baseUrl = await getApiBaseUrl();
  
  let url;
  let fetchOptions = { ...options };
  
  // Se estiver usando o proxy (em produção ou dev)
  if (baseUrl.includes('/api/proxy') || baseUrl.includes('/api-proxy')) {
    // Remove a barra inicial do endpoint
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    url = `${baseUrl}?path=${cleanEndpoint}`;
  } else {
    // URL direta
    url = `${baseUrl}${endpoint}`;
  }
  
  console.log(`📡 Fetch: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data;
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

// Resto do apiClient continua igual...
export const apiClient = {
  async getInstituicoes() {
    return fetchFromApi('/instituicoes');
  },
  async getUnidades() {
    return fetchFromApi('/unidades');
  },
  async getEquipes() {
    return fetchFromApi('/equipes');
  },
  async getUsers() {
    return fetchFromApi('/users');
  },
  async getQuestionarios() {
    const data = await fetchFromApi('/questionarios');
    console.log(`📊 API retornou ${Array.isArray(data) ? data.length : '?'} questionários`);
    return data;
  },
  async createInstituicao(data) {
    return fetchFromApi('/instituicao', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateInstituicao(id, data) {
    return fetchFromApi(`/instituicao/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteInstituicao(id) {
    return fetchFromApi(`/instituicao/${id}`, { method: 'DELETE' });
  },
  async createUnidade(data) {
    return fetchFromApi('/unidade', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateUnidade(id, data) {
    return fetchFromApi(`/unidade/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteUnidade(id) {
    return fetchFromApi(`/unidade/${id}`, { method: 'DELETE' });
  },
  async createEquipe(data) {
    return fetchFromApi('/equipe', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateEquipe(id, data) {
    return fetchFromApi(`/equipe/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteEquipe(id) {
    return fetchFromApi(`/equipe/${id}`, { method: 'DELETE' });
  },
  async createUser(data) {
    return fetchFromApi('/users', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateUser(id, data) {
    return fetchFromApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteUser(id) {
    return fetchFromApi(`/users/${id}`, { method: 'DELETE' });
  },
  async resetUserPassword(id, senha) {
    return fetchFromApi(`/users/${id}/senha`, { method: 'PUT', body: JSON.stringify({ senha }) });
  },
  async getQuestionariosByUser(userId) {
    return fetchFromApi(`/users/${userId}/questionarios?limit=200`);
  },
  async getQuestionariosByDate(date) {
    return fetchFromApi(`/questionarios/data/${date}`);
  },
};

export default apiClient;