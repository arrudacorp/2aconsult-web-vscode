// src/components/layout/AppHeader.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSystemAuth } from "@/hooks/useSystemAuth";

export default function AppHeader({ onToggleSidebar }) {
  const location = useLocation();
  const { user, logout } = useSystemAuth();
  const isPublic = location.pathname === "/links";

  return (
    <header className="h-16 bg-primary flex items-center px-4 shadow-md z-50 relative">
      <div className="flex items-center gap-3">
        {!isPublic && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-white hover:bg-white/10 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/69efa75166ba9be29f82f74c/f05ca0312_image.png"
            alt="2A Consultoria"
            className="w-9 h-9 object-contain rounded"
          />
          <h1 className="text-white font-semibold text-lg tracking-tight hidden sm:block">
            2A Consultoria
          </h1>
        </Link>
      </div>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-4">
        {/* Nome do usuário logado */}
        {user && !isPublic && (
          <div className="hidden md:flex items-center gap-2 text-white">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{user.nome || user.email}</span>
          </div>
        )}
        
        {!isPublic && (
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-white hover:bg-white/10"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        )}
      </div>
    </header>
  );
}