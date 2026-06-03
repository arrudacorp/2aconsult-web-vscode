// src/hooks/useSystemAuth.js
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useSystemAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('system_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔍 Buscando usuário:', email);
      
      // Busca o usuário pelo email primeiro
      const { data: userData, error: userError } = await supabase
        .from('system_users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError);
        if (userError.code === 'PGRST116') {
          return { success: false, error: 'Usuário não encontrado' };
        }
        return { success: false, error: userError.message };
      }
      
      if (!userData) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      console.log('✅ Usuário encontrado:', userData.email);
      
      // Verifica se está ativo
      if (!userData.ativo) {
        return { success: false, error: 'Usuário desativado' };
      }
      
      // Verifica a senha (comparação direta por enquanto)
      if (userData.password !== password) {
        console.log('❌ Senha incorreta');
        return { success: false, error: 'Senha incorreta' };
      }
      
      console.log('✅ Login bem sucedido!');
      
      // Remove a senha antes de salvar
      const { password: _, ...userWithoutPassword } = userData;
      
      localStorage.setItem('system_user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
      return { success: true, user: userWithoutPassword };
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('system_user');
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = user?.role === 'admin';

  return { user, loading, login, logout, isAdmin };
}