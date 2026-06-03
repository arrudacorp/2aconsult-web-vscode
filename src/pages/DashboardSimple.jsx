import React from "react";

export default function DashboardSimple() {
  console.log('✅ Dashboard SIMPLES está renderizando');
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-green-600">Dashboard SIMPLES</h1>
      <p className="mt-4">Se você está vendo isso, o problema está nas dependências das páginas originais.</p>
      <p className="mt-2">Teste as outras páginas uma por uma para identificar qual está causando o erro.</p>
    </div>
  );
}