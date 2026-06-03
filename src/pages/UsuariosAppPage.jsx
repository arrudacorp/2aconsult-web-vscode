// src/pages/UsuariosAppPage.jsx
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DataGrid from "@/components/shared/DataGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";

const columns = [
  { key: "nome", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "role", label: "Perfil", render: (v) => (
    <Badge className={v === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"}>
      {v === "admin" ? "Admin" : "Usuário"}
    </Badge>
  )},
  { key: "ativo", label: "Status", render: (v) => (
    <Badge className={v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
      {v ? "Ativo" : "Inativo"}
    </Badge>
  )},
  { key: "created_at", label: "Criado em", render: (v) => v ? new Date(v).toLocaleDateString("pt-BR") : "—" },
];

export default function UsuariosAppPage() {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ email: "", nome: "", password: "", role: "user" });
  const [saving, setSaving] = useState(false);

  // Buscar usuários da tabela system_users
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["system_users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleCreateUser = async () => {
    if (!form.email || !form.nome || !form.password) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    setSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('system_users')
        .insert({
          email: form.email,
          nome: form.nome,
          password: form.password,
          role: form.role,
          ativo: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success(`Usuário ${form.email} criado com sucesso!`);
      toast.info(`Senha: ${form.password}`, { duration: 10000 });
      
      setInviteOpen(false);
      setForm({ email: "", nome: "", password: "", role: "user" });
      refetch();
      
    } catch (e) {
      toast.error("Erro ao criar usuário: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (user) => {
    const newPass = Math.random().toString(36).slice(-8) + "Aa1!";
    
    try {
      const { error } = await supabase
        .from('system_users')
        .update({ password: newPass })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(`Senha redefinida para ${user.email}`);
      alert(`Nova senha para ${user.email}: ${newPass}\n\nRecomende que o usuário troque a senha no primeiro acesso.`);
      
      refetch();
    } catch (e) {
      toast.error("Erro ao redefinir senha: " + e.message);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const { error } = await supabase
        .from('system_users')
        .update({ ativo: !user.ativo })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(`Usuário ${user.email} ${!user.ativo ? 'ativado' : 'desativado'}`);
      refetch();
    } catch (e) {
      toast.error("Erro ao alterar status: " + e.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.email}?`)) return;
    
    try {
      const { error } = await supabase
        .from('system_users')
        .delete()
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(`Usuário ${user.email} excluído com sucesso!`);
      refetch();
    } catch (e) {
      toast.error("Erro ao excluir usuário: " + e.message);
    }
  };

  // Colunas com ações
  const columnsWithActions = [
    ...columns,
    {
      key: "_actions",
      label: "Ações",
      render: (_, row) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 h-7 text-xs"
            onClick={() => handleResetPassword(row)}
          >
            <KeyRound className="w-3 h-3" /> Resetar Senha
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`gap-1 h-7 text-xs ${row.ativo ? 'text-yellow-600' : 'text-green-600'}`}
            onClick={() => handleToggleActive(row)}
          >
            {row.ativo ? 'Desativar' : 'Ativar'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => handleDeleteUser(row)}
          >
            <Trash2 className="w-3 h-3" /> Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Usuários do Sistema</h2>
        <Button onClick={() => setInviteOpen(true)} className="bg-primary hover:bg-primary/90 gap-2">
          <UserPlus className="w-4 h-4" /> Novo Usuário
        </Button>
      </div>

      <DataGrid
        title="Usuários com acesso ao sistema"
        columns={columnsWithActions}
        data={users}
        loading={isLoading}
        readOnly={false}
      />

      {/* Dialog para criar novo usuário */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Crie um novo usuário para acessar o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input
                placeholder="Nome completo"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Senha *</Label>
              <Input
                type="text"
                placeholder="Senha inicial"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">O usuário pode alterar a senha depois</p>
            </div>
            <div className="space-y-1.5">
              <Label>Perfil</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={saving || !form.email || !form.nome || !form.password} className="bg-primary hover:bg-primary/90 gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}