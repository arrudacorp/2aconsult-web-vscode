import React, { useEffect, useState } from "react";
import DataGrid from "@/components/shared/DataGrid";
import FormDialog from "@/components/shared/FormDialog";
import { useApiSync } from "@/lib/useApiSync";

const columns = [
  { key: "instituicao_id", label: "ID" },
  { key: "nome", label: "Nome" },
  { key: "telefone", label: "Telefone" },
  { key: "email", label: "Email" },
  { key: "endereco", label: "Endereço" },
];

const formFields = [
  { key: "instituicao_id", label: "ID", type: "number" },
  { key: "nome", label: "Nome", type: "text" },
  { key: "telefone", label: "Telefone", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "endereco", label: "Endereço", type: "text" },
];

export default function InstituicoesPage() {
  const { data, loading, loadFromApi, createItem, updateItem, deleteItem } = useApiSync("Instituicao", "instituicoes", "instituicao_id");
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadFromApi(); }, []);

  const handleAdd = () => { setEditing(null); setFormValues({}); setFormOpen(true); };
  const handleEdit = (row) => { setEditing(row); setFormValues({ ...row }); setFormOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Payload no formato da API — usa o id do registro original (editing), não do form
      const payload = {
        id: editing ? Number(editing.instituicao_id) : undefined,
        nome: formValues.nome,
        telefone: formValues.telefone || "",
        email: formValues.email || "",
        endereco: formValues.endereco || "",
      };
      if (editing) await updateItem(Number(editing.instituicao_id), payload);
      else await createItem(payload);
      setFormOpen(false);
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Instituições</h2>
      <DataGrid
        title="Instituições"
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={(row) => deleteItem(row.instituicao_id)}
      />
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar Instituição" : "Nova Instituição"}
        fields={formFields}
        values={formValues}
        onChange={(key, val) => setFormValues((p) => ({ ...p, [key]: val }))}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}