import React, { useEffect, useState, useMemo } from "react";
import DataGrid from "@/components/shared/DataGrid";
import FormDialog from "@/components/shared/FormDialog";
import { useApiSync } from "@/lib/useApiSync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SENHA_PADRAO = "1234";

export default function UsuariosPage() {
  const { data, loading, loadFromApi, createItem, updateItem, deleteItem } = useApiSync("AppUser", "users", "user_app_id");
  const [equipes, setEquipes] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Reset senha state
  const [resetUser, setResetUser] = useState(null);
  const [novaSenha, setNovaSenha] = useState(SENHA_PADRAO);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadFromApi();
    base44.entities.Equipe.list().then(setEquipes);
  }, []);

  const ineMap = useMemo(() => {
    const m = {};
    equipes.forEach((e) => { if (e.ine) m[e.ine] = e.descricao; });
    return m;
  }, [equipes]);

  const ineOptions = useMemo(() =>
    equipes
      .filter((e) => e.ine)
      .map((e) => ({ value: e.ine, label: `${e.ine} - ${e.descricao || ''}` })),
    [equipes]
  );

  const columns = [
    { key: "user_app_id", label: "ID" },
    { key: "home_user", label: "Nome" },
    { key: "ativo", label: "Ativo", render: (v) => (
      <Badge className={v ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
        {v ? "Sim" : "Não"}
      </Badge>
    )},
    { key: "ine", label: "INE", render: (v) => v ? `${v}${ineMap[v] ? ` - ${ineMap[v]}` : ''}` : "—" },
    { key: "cpf", label: "CPF" },
    { key: "id_user_api", label: "ID API" },
    { key: "teste", label: "Teste", render: (v) => v ? "Sim" : "Não" },
  ];

  const formFields = [
    { key: "home_user", label: "Nome", type: "text" },
    { key: "ativo", label: "Ativo", type: "boolean" },
    { key: "senha", label: "Senha", type: "text" },
    { key: "ine", label: "INE (Equipe)", type: "select", options: ineOptions },
    { key: "cpf", label: "CPF", type: "text" },
    { key: "teste", label: "Teste", type: "boolean" },
  ];

  const handleAdd = () => { setEditing(null); setFormValues({ ativo: true, teste: false }); setFormOpen(true); };
  const handleEdit = (row) => { setEditing(row); setFormValues({ ...row, ine: row.ine ? String(row.ine) : "" }); setFormOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
          await updateItem(editing.user_app_id, {
          nome: formValues.home_user,
          senha: formValues.senha,
          ine: formValues.ine ? Number(formValues.ine) : 0,
          ativo: formValues.ativo ?? true,
          cpf: formValues.cpf || '',
          teste: formValues.teste ?? false,
          home_user: formValues.home_user,
        });
      } else {
        await createItem({
          nome: formValues.home_user,
          senha: formValues.senha || SENHA_PADRAO,
          ine: formValues.ine ? Number(formValues.ine) : 0,
          ativo: formValues.ativo ?? true,
          cpf: formValues.cpf || '',
          teste: formValues.teste ?? false,
          home_user: formValues.home_user,
        });
      }
      setFormOpen(false);
    } finally { setSaving(false); }
  };

  const handleResetSenha = async () => {
    setResetting(true);
    try {
      await base44.functions.invoke("apiProxy", {
        action: "resetSenha",
        entity: "users",
        id: resetUser.user_app_id,
        data: { senha: novaSenha },
      });
      toast.success(`Senha de ${resetUser.home_user} redefinida com sucesso!`);
      setResetUser(null);
    } catch (e) {
      toast.error("Erro ao redefinir senha: " + e.message);
    } finally { setResetting(false); }
  };

  const columnsWithReset = [
    ...columns,
    {
      key: "_reset",
      label: "Senha",
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 h-7 text-xs"
          onClick={(e) => { e.stopPropagation(); setNovaSenha(SENHA_PADRAO); setResetUser(row); }}
        >
          <KeyRound className="w-3 h-3" /> Resetar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Usuários</h2>
      <DataGrid
        title="Usuários do Sistema"
        columns={columnsWithReset}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={(row) => deleteItem(row.user_app_id)}
      />
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar Usuário" : "Novo Usuário"}
        fields={formFields}
        values={formValues}
        onChange={(key, val) => setFormValues((p) => ({ ...p, [key]: val }))}
        onSave={handleSave}
        saving={saving}
      />

      {/* Reset Senha Dialog */}
      <Dialog open={!!resetUser} onOpenChange={() => setResetUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Senha</DialogTitle>
            <DialogDescription>
              Redefina a senha do usuário <strong>{resetUser?.home_user}</strong> na API.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Nova Senha</Label>
            <Input
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite a nova senha"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUser(null)}>Cancelar</Button>
            <Button onClick={handleResetSenha} disabled={resetting || !novaSenha} className="gap-2">
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Confirmar Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}