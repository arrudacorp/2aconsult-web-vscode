// src/pages/LinksPage.jsx
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataGrid from "@/components/shared/DataGrid";
import FormDialog from "@/components/shared/FormDialog";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useSystemAuth } from "@/hooks/useSystemAuth";

const columns = [
  { key: "links_id", label: "ID" },
  { key: "desc_link", label: "Descrição" },
  {
    key: "link", label: "URL", render: (val) => val ? (
      <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
        <ExternalLink className="w-3.5 h-3.5" />
        Abrir
      </a>
    ) : "—"
  },
];

const formFields = [
  { key: "desc_link", label: "Descrição", type: "text" },
  { key: "link", label: "URL", type: "text", placeholder: "https://..." },
];

export default function LinksPage() {
  const queryClient = useQueryClient();
  const { isAdmin } = useSystemAuth(); // ← Usa o hook, sem declarar novamente
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["links"],
    queryFn: () => base44.entities.Link.list(),
  });

  const createMut = useMutation({
    mutationFn: (d) => base44.entities.Link.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["links"] }); toast.success("Link criado!"); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Link.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["links"] }); toast.success("Link atualizado!"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Link.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["links"] }); toast.success("Link excluído!"); },
  });

  const handleAdd = () => { setEditing(null); setFormValues({}); setFormOpen(true); };
  const handleEdit = (row) => { setEditing(row); setFormValues({ ...row }); setFormOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: formValues });
      } else {
        const maxId = links.reduce((max, l) => Math.max(max, l.links_id || 0), 0);
        await createMut.mutateAsync({ ...formValues, links_id: maxId + 1 });
      }
      setFormOpen(false);
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Links Úteis</h2>
      <DataGrid        
        columns={columns}
        data={links}
        loading={isLoading}
        onAdd={isAdmin ? handleAdd : undefined}
        onEdit={isAdmin ? handleEdit : undefined}
        onDelete={isAdmin ? (row) => deleteMut.mutate(row.id) : undefined}
        readOnly={!isAdmin}
      />
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar Link" : "Novo Link"}
        fields={formFields}
        values={formValues}
        onChange={(key, val) => setFormValues((p) => ({ ...p, [key]: val }))}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}