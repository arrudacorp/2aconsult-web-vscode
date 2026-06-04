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
    
    const url = data.modo === 'teste' ? data.url_teste : data.url_producao;
    cachedApiBaseUrl = url || 'https://api-teste.2aconsult.com.br';
    console.log(`🔧 API Client usando URL: ${cachedApiBaseUrl} (modo: ${data.modo})`);
    return cachedApiBaseUrl;
  } catch (err) {
    console.warn('Erro ao buscar parâmetros:', err);
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
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Erro na requisição:`, error);
    throw error;
  }
}

// Resto do código...
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
    return fetchFromApi('/questionarios');
  },
  // ... outros métodos
};

export default apiClient;