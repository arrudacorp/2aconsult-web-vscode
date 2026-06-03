import { supabase } from './lib/supabase'

console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...')

if (supabase) {
  console.log('✅ Supabase configurado com sucesso!')
} else {
  console.log('❌ Erro: Supabase NÃO configurado')
}