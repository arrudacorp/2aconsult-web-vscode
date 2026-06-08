// src/lib/prontuarioUtils.js

// Extrai a base do prontuário (parte antes do "/")
export function getProntuarioBase(prontuario) {
  if (!prontuario) return "";
  const str = String(prontuario);
  const idx = str.indexOf("/");
  return idx === -1 ? str.trim() : str.substring(0, idx).trim();
}

// Extrai a versão do prontuário (número depois do "/") - maior número = mais recente
// Se não tiver "/", versão = 0 (base, mais antigo)
export function getProntuarioVersion(prontuario) {
  if (!prontuario) return 0;
  const str = String(prontuario);
  const idx = str.indexOf("/");
  if (idx === -1) return 0;
  const num = parseInt(str.substring(idx + 1).trim(), 10);
  return isNaN(num) ? 0 : num;
}

// Deduplica array de questionários, mantendo apenas o mais recente por prontuário base
export function deduplicarQuestionarios(questionarios) {
  if (!questionarios || questionarios.length === 0) return [];
  
  const mapa = {};
  for (const q of questionarios) {
    // Usa id_user_app como campo do prontuário
    const prontuario = q.id_user_app || q.prontuario;
    if (!prontuario) continue;
    
    const base = getProntuarioBase(prontuario);
    const versao = getProntuarioVersion(prontuario);
    
    // Se não tem registro para esta base, ou a versão atual é maior, substitui
    if (!mapa[base] || versao > mapa[base].versao) {
      mapa[base] = { ...q, versao, prontuarioBase: base };
    }
  }
  
  // Retorna apenas os registros (sem o campo versao auxiliar)
  return Object.values(mapa).map(({ versao, prontuarioBase, ...rest }) => rest);
}

// Conta quantos prontuários únicos (considerando a versão mais recente)
export function countProntuariosUnicos(questionarios) {
  if (!questionarios || questionarios.length === 0) return 0;
  
  const mapa = {};
  for (const q of questionarios) {
    const prontuario = q.id_user_app || q.prontuario;
    if (!prontuario) continue;
    
    const base = getProntuarioBase(prontuario);
    const versao = getProntuarioVersion(prontuario);
    
    // Sempre mantém a MAIOR versão
    if (!mapa[base] || versao > mapa[base]) {
      mapa[base] = versao;
    }
  }
  
  console.log('🔍 countProntuariosUnicos - Total de bases únicas:', Object.keys(mapa).length);
  console.log('🔍 countProntuariosUnicos - Amostra das bases:', Object.keys(mapa).slice(0, 10));
  
  return Object.keys(mapa).length;
}