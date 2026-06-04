// src/components/layout/AppLayout.jsx
import React, { useState } from "react";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo no topo */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AppHeader onToggleSidebar={toggleSidebar} />
      </div>
      
      {/* Espaçador para compensar o header fixo */}
      <div className="h-16" />
      
      <div className="flex relative">
        <AppSidebar open={sidebarOpen} onClose={closeSidebar} />
        
        <main className="flex-1 p-4 lg:p-6 transition-all duration-300 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}