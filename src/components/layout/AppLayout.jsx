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
      <AppHeader onToggleSidebar={toggleSidebar} />
      
      <div className="flex relative">
        <AppSidebar open={sidebarOpen} onClose={closeSidebar} />
        
        <main className="flex-1 p-4 lg:p-6 transition-all duration-300 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}