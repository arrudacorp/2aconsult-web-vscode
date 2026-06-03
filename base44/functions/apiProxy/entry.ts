import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DEFAULT_API_BASE = 'http://179.0.177.138:8091';

async function getApiBase(base44) {
  try {
    const params = await base44.asServiceRole.entities.Parametros.list();
    if (params.length > 0) {
      const p = params[0];
      if (p.modo === 'teste' && p.url_teste) return p.url_teste;
      if (p.url_producao) return p.url_producao;
    }
  } catch {}
  return DEFAULT_API_BASE;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, entity, id, data } = body;

    const API_BASE = await getApiBase(base44);

    let url = '';
    let method = 'GET';
    let fetchBody = null;

    switch (entity) {
      case 'equipes':
        if (action === 'list') { url = `${API_BASE}/equipes`; method = 'GET'; }
        else if (action === 'create') { url = `${API_BASE}/equipe`; method = 'POST'; fetchBody = JSON.stringify(data); }
        else if (action === 'update') { url = `${API_BASE}/equipe/${id}`; method = 'PUT'; fetchBody = JSON.stringify(data); }
        else if (action === 'delete') { url = `${API_BASE}/equipe/${id}`; method = 'DELETE'; }
        break;

      case 'unidades':
        if (action === 'list') { url = `${API_BASE}/unidades`; method = 'GET'; }
        else if (action === 'create') { url = `${API_BASE}/unidade`; method = 'POST'; fetchBody = JSON.stringify(data); }
        else if (action === 'update') { url = `${API_BASE}/unidade/${id}`; method = 'PUT'; fetchBody = JSON.stringify(data); }
        else if (action === 'delete') { url = `${API_BASE}/unidade/${id}`; method = 'DELETE'; }
        break;

      case 'instituicoes':
        if (action === 'list') { url = `${API_BASE}/instituicoes`; method = 'GET'; }
        else if (action === 'create') { url = `${API_BASE}/instituicao`; method = 'POST'; fetchBody = JSON.stringify(data); }
        else if (action === 'update') { url = `${API_BASE}/instituicao/${id}`; method = 'PUT'; fetchBody = JSON.stringify(data); }
        else if (action === 'delete') { url = `${API_BASE}/instituicao/${id}`; method = 'DELETE'; }
        break;

      case 'users':
        if (action === 'list') { url = `${API_BASE}/users`; method = 'GET'; }
        else if (action === 'create') { url = `${API_BASE}/users`; method = 'POST'; fetchBody = JSON.stringify(data); }
        else if (action === 'update') { url = `${API_BASE}/users/${id}`; method = 'PUT'; fetchBody = JSON.stringify(data); }
        else if (action === 'resetSenha') { url = `${API_BASE}/users/${id}/senha`; method = 'PUT'; fetchBody = JSON.stringify({ senha: data.senha }); }
        else if (action === 'delete') { url = `${API_BASE}/users/${id}`; method = 'DELETE'; }
        break;

      case 'questionarios':
        if (action === 'list') { url = `${API_BASE}/questionarios`; method = 'GET'; }
        else if (action === 'listByUser') { url = `${API_BASE}/users/${id}/questionarios?limit=200`; method = 'GET'; }
        else if (action === 'listByDate') { url = `${API_BASE}/questionarios/data/${data.date}`; method = 'GET'; }
        // 'list' já lida com isso acima
        
        break;

      default:
        return Response.json({ error: 'Entidade não reconhecida' }, { status: 400 });
    }

    const fetchOptions = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (fetchBody && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = fetchBody;
    }

    const response = await fetch(url, fetchOptions);

    if (method === 'DELETE' && (response.status === 200 || response.status === 204)) {
      return Response.json({ success: true });
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const result = await response.json();
      return Response.json(result);
    } else {
      const text = await response.text();
      return Response.json({ raw: text, status: response.status });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});