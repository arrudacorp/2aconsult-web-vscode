// src/pages/Diagnostico.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Diagnostico() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runDiagnostico() {
      const logs = {};
      
      // 1. Testar Supabase
      try {
        const { data, error } = await supabase.from('system_users').select('count');
        logs.supabase = { ok: !error, data, error: error?.message };
      } catch (e) {
        logs.supabase = { ok: false, error: e.message };
      }
      
      // 2. Testar base44Client
      try {
        const { base44 } = await import('@/api/base44Client');
        logs.base44Client = { ok: !!base44 };
      } catch (e) {
        logs.base44Client = { ok: false, error: e.message };
      }
      
      // 3. Testar apiClient
      try {
        const { apiClient } = await import('@/lib/apiClient');
        logs.apiClient = { ok: !!apiClient };
      } catch (e) {
        logs.apiClient = { ok: false, error: e.message };
      }
      
      setResults(logs);
      setLoading(false);
    }
    
    runDiagnostico();
  }, []);

  if (loading) {
    return <div className="p-4">Carregando diagnóstico...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico do Sistema</h1>
      
      <div className="space-y-2">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className={`p-3 rounded ${value.ok ? 'bg-green-100' : 'bg-red-100'}`}>
            <strong>{key}:</strong> {value.ok ? '✅ OK' : `❌ Erro: ${value.error}`}
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gray-100 rounded">
        <strong>Informações:</strong>
        <pre className="text-sm mt-2">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  );
}