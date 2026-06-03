// src/lib/base44-interceptor.js
import { 
  InstituicaoAPI,
  UnidadeAPI, 
  EquipeAPI, 
  AppUserAPI, 
  ParametrosAPI, 
  LinkAPI 
} from './supabase-entities'

export function setupBase44Interceptor() {
  console.log('🔧 Configurando interceptor sem dependência do Base44...')
  
  // Cria o objeto Base44 global se não existir
  window.Base44 = window.Base44 || {}
  
  // Define a Entity function
  window.Base44.Entity = (name) => {
    console.log(`📦 Entidade solicitada: ${name} → usando Supabase`)
    
    switch(name) {
      case 'Instituicao':
        return InstituicaoAPI
      case 'Unidade':
        return UnidadeAPI
      case 'Equipe':
        return EquipeAPI
      case 'AppUser':
        return AppUserAPI
      case 'Parametros':
        return ParametrosAPI
      case 'Link':
        return LinkAPI
      default:
        console.warn(`⚠️ Entidade "${name}" não mapeada, usando mock`)
        return {
          list: async () => {
            console.warn(`📋 ${name}.list() - Mock retornando []`)
            return []
          },
          get: async (id) => {
            console.warn(`🔍 ${name}.get(${id}) - Mock retornando null`)
            return null
          },
          create: async (data) => {
            console.warn(`✨ ${name}.create() - Mock salvando local`)
            return { ...data, id: Date.now() }
          },
          update: async (id, data) => {
            console.warn(`✏️ ${name}.update() - Mock atualizando`)
            return { ...data, id }
          },
          delete: async (id) => {
            console.warn(`🗑️ ${name}.delete() - Mock deletando`)
            return true
          }
        }
    }
  }
  
  // Sobrescreve o método functions para evitar erros
  window.Base44.functions = {
    invoke: async () => {
      console.warn('⚠️ Base44.functions.invoke chamado mas não implementado')
      return { data: [] }
    }
  }
  
  // Sobrescreve o método entities para evitar erros
  window.Base44.entities = {}
  
  // Desabilita WebSocket completamente
  if (typeof window !== 'undefined') {
    // Salva o WebSocket original
    const OriginalWebSocket = window.WebSocket
    
    // Substitui por uma versão que não faz nada
    window.WebSocket = function(...args) {
      const url = args[0]
      if (url && (url.includes('localhost') || url.includes('ws://'))) {
        console.log('🔌 WebSocket bloqueado:', url)
        // Retorna um objeto dummy que não faz nada
        return {
          addEventListener: () => {},
          removeEventListener: () => {},
          close: () => {},
          send: () => {},
          readyState: 3, // CLOSED
          CLOSED: 3
        }
      }
      return new OriginalWebSocket(...args)
    }
    
    // Copia as propriedades estáticas
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING
    window.WebSocket.OPEN = OriginalWebSocket.OPEN
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED
  }
  
  console.log('✅ Interceptor ativado! WebSocket bloqueado.')
  console.log('📋 Entidades mapeadas: Instituicao, Unidade, Equipe, AppUser, Parametros, Link')
}