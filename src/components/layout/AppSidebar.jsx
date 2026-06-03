// src/components/layout/AppSidebar.jsx
import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Building2, MapPin, UsersRound, FileText, LinkIcon, Settings, UserCog, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Usuários (API)", path: "/usuarios", icon: Users },  //FICOU INVERTIDO AS PAGINAS MAS O CONTEUDO ESTÁ CORRETO
  { label: "Usuários (SISTEMA)", path: "/usuarios-api", icon: UserCog }, //FICOU INVERTIDO AS PAGINAS MAS O CONTEUDO ESTÁ CORRETO
  { label: "Unidades", path: "/unidades", icon: MapPin },
  { label: "Instituições", path: "/instituicoes", icon: Building2 },
  { label: "Equipes", path: "/equipes", icon: UsersRound },
  { label: "Questionários", path: "/questionarios", icon: FileText },
  { label: "Relatórios", path: "/relatorios", icon: BarChart2 },
  { label: "Links", path: "/links", icon: LinkIcon },
  { label: "Parâmetros", path: "/parametros", icon: Settings },
];

export default function AppSidebar({ open, onClose }) {
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Fecha ao clicar fora (apenas mobile)
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Delay para evitar que o clique que abriu o sidebar feche ele
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:top-16 lg:h-[calc(100%-4rem)]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b lg:hidden">
          <h2 className="text-lg font-semibold text-primary">Menu</h2>
        </div>
        
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}