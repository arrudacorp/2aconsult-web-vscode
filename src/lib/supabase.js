import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

console.log('🔍 Verificando configuração Supabase:')
console.log('URL:', supabaseUrl)
console.log('Key existe?', !!supabaseAnonKey)
console.log('Key (primeiros 20 chars):', supabaseAnonKey?.substring(0, 20))

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis do Supabase não encontradas!')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ Supabase cliente criado com sucesso!')