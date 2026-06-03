import React, { createContext, useContext, useState, useEffect } from 'react'
import { base44Client } from '@/api/base44Client'
import { appParams } from '@/lib/app-params'

const AuthContext = createContext()

// Mock do axios client - redireciona para Supabase
const createAxiosClient = () => {
  return {
    get: async (url) => {
      console.log(`📡 GET (mock): ${url}`)
      return { data: null }
    },
    post: async (url, data) => {
      console.log(`📡 POST (mock): ${url}`, data)
      return { data: { success: true } }
    },
    put: async (url, data) => {
      console.log(`📡 PUT (mock): ${url}`, data)
      return { data: { success: true } }
    },
    delete: async (url) => {
      console.log(`📡 DELETE (mock): ${url}`)
      return { data: { success: true } }
    },
    interceptors: {
      request: { use: () => {}, eject: () => {} },
      response: { use: () => {}, eject: () => {} }
    }
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Tenta recuperar usuário do Supabase via base44Client
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        // Tenta pegar usuário do mock/Supabase
        if (base44Client?.auth?.getUser) {
          const userData = await base44Client.auth.getUser()
          setUser(userData)
        }
      } catch (err) {
        console.error('Erro ao carregar usuário:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      // Implementar login com Supabase
      const { data, error } = await base44Client?.auth?.signInWithPassword?.(email, password) || {}
      
      if (error) throw error
      
      setUser(data?.user)
      return { success: true, user: data?.user }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await base44Client?.auth?.signOut?.()
      setUser(null)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext