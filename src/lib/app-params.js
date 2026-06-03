// Parâmetros do aplicativo
export const appParams = {
  appId: import.meta.env.VITE_BASE44_APP_ID || 'local-dev',
  apiUrl: import.meta.env.VITE_SUPABASE_URL || 'http://localhost:5173',
  env: import.meta.env.MODE || 'development',
  version: '1.0.0',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY
}

export default appParams