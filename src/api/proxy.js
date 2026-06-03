// api/proxy.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Conecta ao Supabase para buscar as URLs
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    // Busca os parâmetros
    const { data: params, error } = await supabase
      .from('parametros')
      .select('modo, url_producao, url_teste')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Erro ao buscar parâmetros:', error);
      return res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
    
    // Escolhe a URL baseada no modo
    const baseUrl = params.modo === 'teste' ? params.url_teste : params.url_producao;
    
    if (!baseUrl) {
      return res.status(500).json({ error: 'URL da API não configurada' });
    }
    
    // Extrai o caminho da requisição
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path || '';
    const targetUrl = `${baseUrl}/${apiPath}`;
    
    console.log(`🔄 Proxying: ${req.method} ${targetUrl} (modo: ${params.modo})`);
    
    // Prepara os headers da requisição
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Adiciona body se houver
    if (req.method !== 'GET' && req.method !== 'DELETE' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    // Faz a requisição para a API externa
    const response = await fetch(targetUrl, fetchOptions);
    
    // Tenta parsear como JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { success: true };
    }
    
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}