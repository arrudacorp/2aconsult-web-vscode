import { supabase } from './supabase'

// ============================================
// API: Instituicao
// ============================================
export const InstituicaoAPI = {
  list: async (filters = {}) => {
    let query = supabase.from('instituicoes').select('*').order('nome')
    
    if (filters.nome) {
      query = query.ilike('nome', `%${filters.nome}%`)
    }
    if (filters.instituicao_id) {
      query = query.eq('instituicao_id', filters.instituicao_id)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    return data.map(item => ({
      instituicao_id: item.instituicao_id,
      nome: item.nome,
      telefone: item.telefone,
      email: item.email,
      endereco: item.endereco,
      id: item.id
    }))
  },
  
  get: async (id) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('instituicoes').select('*')
    
    if (isOldId) {
      query = query.eq('instituicao_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { data, error } = await query.single()
    if (error) throw error
    
    return {
      instituicao_id: data.instituicao_id,
      nome: data.nome,
      telefone: data.telefone,
      email: data.email,
      endereco: data.endereco,
      id: data.id
    }
  },
  
  create: async (instituicao) => {
    const instituicao_id = instituicao.instituicao_id || Date.now()
    
    const { data, error } = await supabase
      .from('instituicoes')
      .insert({
        instituicao_id: instituicao_id,
        nome: instituicao.nome,
        telefone: instituicao.telefone || null,
        email: instituicao.email || null,
        endereco: instituicao.endereco || null
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      instituicao_id: data.instituicao_id,
      nome: data.nome,
      telefone: data.telefone,
      email: data.email,
      endereco: data.endereco,
      id: data.id
    }
  },
  
  update: async (id, updates) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('instituicoes').update({ ...updates, updated_at: new Date() })
    
    if (isOldId) {
      query = query.eq('instituicao_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { data, error } = await query.select().single()
    if (error) throw error
    
    return {
      instituicao_id: data.instituicao_id,
      nome: data.nome,
      telefone: data.telefone,
      email: data.email,
      endereco: data.endereco,
      id: data.id
    }
  },
  
  delete: async (id) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('instituicoes').delete()
    
    if (isOldId) {
      query = query.eq('instituicao_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { error } = await query
    if (error) throw error
    return true
  },
  
  searchByNome: async (searchTerm) => {
    const { data, error } = await supabase
      .from('instituicoes')
      .select('*')
      .ilike('nome', `%${searchTerm}%`)
      .limit(10)
    
    if (error) throw error
    
    return data.map(item => ({
      instituicao_id: item.instituicao_id,
      nome: item.nome,
      telefone: item.telefone,
      email: item.email,
      endereco: item.endereco,
      id: item.id
    }))
  }
}

// ============================================
// API: Unidade
// ============================================
export const UnidadeAPI = {
  list: async (filters = {}) => {
    let query = supabase.from('unidades').select('*').order('nome_unidade')
    
    if (filters.id_instituicao) {
      query = query.eq('id_instituicao', filters.id_instituicao)
    }
    if (filters.cnes) {
      query = query.eq('cnes', filters.cnes)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    return data.map(item => ({
      unidade_id: item.unidade_id,
      id_instituicao: item.id_instituicao,
      cnes: item.cnes,
      nome_unidade: item.nome_unidade,
      id_unidade_api: item.id_unidade_api,
      id: item.id
    }))
  },
  
  get: async (id) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('unidades').select('*')
    
    if (isOldId) {
      query = query.eq('unidade_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { data, error } = await query.single()
    if (error) throw error
    
    return {
      unidade_id: data.unidade_id,
      id_instituicao: data.id_instituicao,
      cnes: data.cnes,
      nome_unidade: data.nome_unidade,
      id_unidade_api: data.id_unidade_api,
      id: data.id
    }
  },
  
  create: async (unidade) => {
    const unidade_id = unidade.unidade_id || Date.now()
    
    const { data, error } = await supabase
      .from('unidades')
      .insert({
        unidade_id: unidade_id,
        id_instituicao: unidade.id_instituicao || null,
        cnes: unidade.cnes || null,
        nome_unidade: unidade.nome_unidade,
        id_unidade_api: unidade.id_unidade_api || null
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  update: async (id, updates) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('unidades').update({ ...updates, updated_at: new Date() })
    
    if (isOldId) {
      query = query.eq('unidade_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { data, error } = await query.select().single()
    if (error) throw error
    return data
  },
  
  delete: async (id) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('unidades').delete()
    
    if (isOldId) {
      query = query.eq('unidade_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { error } = await query
    if (error) throw error
    return true
  }
}

// ============================================
// API: Equipe
// ============================================
export const EquipeAPI = {
  list: async (filters = {}) => {
    let query = supabase.from('equipes').select('*').order('descricao')
    
    if (filters.cnes) {
      query = query.eq('cnes', filters.cnes)
    }
    if (filters.ine) {
      query = query.eq('ine', filters.ine)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    return data.map(item => ({
      equipe_id: item.equipe_id,
      cnes: item.cnes,
      ine: item.ine,
      descricao: item.descricao,
      id: item.id
    }))
  },
  
  get: async (id) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('equipes').select('*')
    
    if (isOldId) {
      query = query.eq('equipe_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { data, error } = await query.single()
    if (error) throw error
    
    return {
      equipe_id: data.equipe_id,
      cnes: data.cnes,
      ine: data.ine,
      descricao: data.descricao,
      id: data.id
    }
  },
  
  create: async (equipe) => {
    const equipe_id = equipe.equipe_id || Date.now()
    
    const { data, error } = await supabase
      .from('equipes')
      .insert({
        equipe_id: equipe_id,
        cnes: equipe.cnes || null,
        ine: equipe.ine || null,
        descricao: equipe.descricao
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  update: async (id, updates) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('equipes').update({ ...updates, updated_at: new Date() })
    
    if (isOldId) {
      query = query.eq('equipe_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { data, error } = await query.select().single()
    if (error) throw error
    return data
  },
  
  delete: async (id) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('equipes').delete()
    
    if (isOldId) {
      query = query.eq('equipe_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { error } = await query
    if (error) throw error
    return true
  }
}

// ============================================
// API: AppUser
// ============================================
export const AppUserAPI = {
  list: async (filters = {}) => {
    let query = supabase.from('app_users').select('*').order('home_user')
    
    if (filters.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo)
    }
    if (filters.ine) {
      query = query.eq('ine', filters.ine)
    }
    if (filters.teste !== undefined) {
      query = query.eq('teste', filters.teste)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    return data.map(item => ({
      user_app_id: item.user_app_id,
      home_user: item.home_user,
      ativo: item.ativo,
      senha: item.senha,
      id_user_api: item.id_user_api,
      ine: item.ine,
      cpf: item.cpf,
      teste: item.teste,
      id: item.id
    }))
  },
  
  get: async (id) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('app_users').select('*')
    
    if (isOldId) {
      query = query.eq('user_app_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { data, error } = await query.single()
    if (error) throw error
    
    return {
      user_app_id: data.user_app_id,
      home_user: data.home_user,
      ativo: data.ativo,
      senha: data.senha,
      id_user_api: data.id_user_api,
      ine: data.ine,
      cpf: data.cpf,
      teste: data.teste,
      id: data.id
    }
  },
  
  create: async (user) => {
    const user_app_id = user.user_app_id || Date.now()
    
    const { data, error } = await supabase
      .from('app_users')
      .insert({
        user_app_id: user_app_id,
        home_user: user.home_user,
        ativo: user.ativo !== undefined ? user.ativo : true,
        senha: user.senha,
        id_user_api: user.id_user_api || null,
        ine: user.ine || null,
        cpf: user.cpf || null,
        teste: user.teste || false
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  update: async (id, updates) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('app_users').update({ ...updates, updated_at: new Date() })
    
    if (isOldId) {
      query = query.eq('user_app_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { data, error } = await query.select().single()
    if (error) throw error
    return data
  },
  
  delete: async (id) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('app_users').delete()
    
    if (isOldId) {
      query = query.eq('user_app_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { error } = await query
    if (error) throw error
    return true
  },
  
  // Autenticação
  login: async (cpf, senha) => {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('cpf', cpf)
      .eq('senha', senha)  // Idealmente use hash
      .single()
    
    if (error) throw error
    return data
  }
}

// ============================================
// API: Parametros
// ============================================
export const ParametrosAPI = {
  get: async () => {
    const { data, error } = await supabase
      .from('parametros')
      .select('*')
      .limit(1)
      .single()
    
    if (error) throw error
    return {
      modo: data.modo,
      url_producao: data.url_producao,
      url_teste: data.url_teste,
      id: data.id
    }
  },
  
  update: async (updates) => {
    const { data, error } = await supabase
      .from('parametros')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', updates.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  getUrl: () => {
    // Método utilitário para pegar a URL correta baseada no modo
    return async () => {
      const params = await ParametrosAPI.get()
      return params.modo === 'producao' ? params.url_producao : params.url_teste
    }
  }
}

// ============================================
// API: Link
// ============================================
export const LinkAPI = {
  list: async () => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('desc_link')
    
    if (error) throw error
    
    return data.map(item => ({
      links_id: item.links_id,
      desc_link: item.desc_link,
      link: item.link,
      id: item.id
    }))
  },
  
  get: async (id) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('links').select('*')
    
    if (isOldId) {
      query = query.eq('links_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { data, error } = await query.single()
    if (error) throw error
    
    return {
      links_id: data.links_id,
      desc_link: data.desc_link,
      link: data.link,
      id: data.id
    }
  },
  
  create: async (link) => {
    const links_id = link.links_id || Date.now()
    
    const { data, error } = await supabase
      .from('links')
      .insert({
        links_id: links_id,
        desc_link: link.desc_link,
        link: link.link
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  update: async (id, updates) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('links').update({ ...updates, updated_at: new Date() })
    
    if (isOldId) {
      query = query.eq('links_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { data, error } = await query.select().single()
    if (error) throw error
    return data
  },
  
  delete: async (id) => {
    const isOldId = typeof id === 'number' || !isNaN(parseInt(id))
    let query = supabase.from('links').delete()
    
    if (isOldId) {
      query = query.eq('links_id', parseInt(id))
    } else {
      query = query.eq('id', id)
    }
    
    const { error } = await query
    if (error) throw error
    return true
  }
}