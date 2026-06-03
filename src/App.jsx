// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { useSystemAuth } from "@/hooks/useSystemAuth";
import LoginPage from "@/pages/LoginPage";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import InstituicoesPage from "@/pages/InstituicoesPage";
import UnidadesPage from "@/pages/UnidadesPage";
import EquipesPage from "@/pages/EquipesPage";
import UsuariosPage from "@/pages/UsuariosPage";
import UsuariosAppPage from "@/pages/UsuariosAppPage";
import QuestionariosPage from "@/pages/QuestionariosPage";
import LinksPage from "@/pages/LinksPage";
import ParametrosPage from "@/pages/ParametrosPage";
import RelatorioAgente from "./components/relatorios/RelatorioAgente";
import RelatoriosPage from "@/pages/RelatoriosPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useSystemAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/instituicoes" element={<InstituicoesPage />} />
      <Route path="/unidades" element={<UnidadesPage />} />
      <Route path="/equipes" element={<EquipesPage />} />
      <Route path="/usuarios" element={<UsuariosPage />} />
      <Route path="/usuarios-api" element={<UsuariosAppPage />} />
      <Route path="/questionarios" element={<QuestionariosPage />} />
      
      <Route path="/parametros" element={<ParametrosPage />} />
      <Route path="/relatorios" element={<RelatoriosPage />}/>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <BrowserRouter>
        <Routes>
          <Route path="/links" element={<LinksPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout>
                <AppRoutes />
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;