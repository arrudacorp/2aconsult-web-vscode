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
      return 'https://api-teste.2aconsult.com.br';
    }
    
    // Escolhe a URL baseada no modo
    let url;
    if (data.modo === 'teste') {
      url = data.url_teste;
      console.log('🔧 Modo TESTE ativado');
    } else {
      url = data.url_producao;
      console.log('🔧 Modo PRODUÇÃO ativado');
    }
    
    cachedApiBaseUrl = url || 'https://api-teste.2aconsult.com.br';
    console.log(`🔧 API Client usando URL: ${cachedApiBaseUrl}`);
    return cachedApiBaseUrl;
  } catch (err) {
    console.warn('Erro ao buscar parâmetros, usando URL padrão:', err);
    return 'https://api-teste.2aconsult.com.br';
  }
}

// Função para fazer requisições diretamente (sem proxy)
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
    if (!text || text.trim() === '') {
      return { success: true };
    }
    
    try {
      return JSON.parse(text);
    } catch {
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
};

export default apiClient;