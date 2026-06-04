// src/api/proxy.js
import { supabase } from '@/lib/supabase';

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    
    if (!path) {
      return new Response(JSON.stringify({ error: 'Path não informado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Busca a URL da API no Supabase
    const { data: params, error } = await supabase
      .from('parametros')
      .select('modo, url_producao, url_teste')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Erro ao buscar parâmetros:', error);
      return new Response(JSON.stringify({ error: 'Erro ao buscar configurações' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiBaseUrl = params.modo === 'teste' ? params.url_teste : params.url_producao;
    const targetUrl = `${apiBaseUrl}/${path}`;
    
    console.log(`🔄 Proxy GET: ${targetUrl}`);
    
    const response = await fetch(targetUrl);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    const body = await request.json();
    
    if (!path) {
      return new Response(JSON.stringify({ error: 'Path não informado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { data: params, error } = await supabase
      .from('parametros')
      .select('modo, url_producao, url_teste')
      .limit(1)
      .single();
    
    if (error) {
      return new Response(JSON.stringify({ error: 'Erro ao buscar configurações' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiBaseUrl = params.modo === 'teste' ? params.url_teste : params.url_producao;
    const targetUrl = `${apiBaseUrl}/${path}`;
    
    console.log(`🔄 Proxy POST: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request }) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    const body = await request.json();
    
    if (!path) {
      return new Response(JSON.stringify({ error: 'Path não informado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { data: params, error } = await supabase
      .from('parametros')
      .select('modo, url_producao, url_teste')
      .limit(1)
      .single();
    
    if (error) {
      return new Response(JSON.stringify({ error: 'Erro ao buscar configurações' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiBaseUrl = params.modo === 'teste' ? params.url_teste : params.url_producao;
    const targetUrl = `${apiBaseUrl}/${path}`;
    
    console.log(`🔄 Proxy PUT: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request }) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    
    if (!path) {
      return new Response(JSON.stringify({ error: 'Path não informado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { data: params, error } = await supabase
      .from('parametros')
      .select('modo, url_producao, url_teste')
      .limit(1)
      .single();
    
    if (error) {
      return new Response(JSON.stringify({ error: 'Erro ao buscar configurações' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const apiBaseUrl = params.modo === 'teste' ? params.url_teste : params.url_producao;
    const targetUrl = `${apiBaseUrl}/${path}`;
    
    console.log(`🔄 Proxy DELETE: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'DELETE'
    });
    
    if (response.status === 204) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}