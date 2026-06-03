import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Settings } from "lucide-react";
import { toast } from "sonner";

export default function ParametrosPage() {
  const [parametros, setParametros] = useState(null);
  const [form, setForm] = useState({ modo: "producao", url_producao: "", url_teste: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Parametros.list().then((list) => {
      if (list.length > 0) {
        setParametros(list[0]);
        setForm({ modo: list[0].modo || "producao", url_producao: list[0].url_producao || "", url_teste: list[0].url_teste || "" });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (parametros) {
        await base44.entities.Parametros.update(parametros.id, form);
      } else {
        const novo = await base44.entities.Parametros.create(form);
        setParametros(novo);
      }
      toast.success("Parâmetros salvos com sucesso!");
    } catch (e) {
      toast.error("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const setModo = (modo) => setForm((p) => ({ ...p, modo }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Parâmetros do Sistema</h2>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-4 h-4" />
            Configuração da API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Modo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Modo de Operação</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setModo("producao")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                  form.modo === "producao"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                🟢 Produção
                {form.modo === "producao" && (
                  <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs">Ativo</Badge>
                )}
              </button>
              <button
                onClick={() => setModo("teste")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                  form.modo === "teste"
                    ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                    : "border-border text-muted-foreground hover:border-yellow-400"
                }`}
              >
                🟡 Teste
                {form.modo === "teste" && (
                  <Badge className="ml-2 bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">Ativo</Badge>
                )}
              </button>
            </div>
            {form.modo === "teste" && (
              <p className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
                ⚠️ O sistema está em modo de teste. As operações serão realizadas na API de teste.
              </p>
            )}
          </div>

          {/* URL Produção */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">URL da API de Produção</Label>
            <Input
              value={form.url_producao}
              onChange={(e) => setForm((p) => ({ ...p, url_producao: e.target.value }))}
              placeholder="http://179.0.177.138:8091"
            />
          </div>

          {/* URL Teste */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">URL da API de Teste</Label>
            <Input
              value={form.url_teste}
              onChange={(e) => setForm((p) => ({ ...p, url_teste: e.target.value }))}
              placeholder="http://..."
            />
          </div>

          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Parâmetros
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}