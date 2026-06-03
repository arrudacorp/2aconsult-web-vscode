// api/proxy.js
export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Busca os parâmetros do Supabase para saber qual URL usar
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    // Se não tiver as variáveis, usa URL padrão
    let apiBaseUrl = 'http://179.0.177.138:8091';
    
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data: params } = await supabase
          .from('parametros')
          .select('modo, url_producao, url_teste')
          .limit(1)
          .single();
        
        if (params) {
          apiBaseUrl = params.modo === 'teste' ? params.url_teste : params.url_producao;
        }
      } catch (e) {
        console.error('Erro ao buscar parâmetros:', e);
      }
    }
    
    // Obtém o caminho da requisição
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path || '';
    const targetUrl = `${apiBaseUrl}/${apiPath}`;
    
    console.log(`🔄 Proxying: ${req.method} ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}