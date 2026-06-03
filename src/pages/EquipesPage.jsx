import React, { useEffect, useState, useMemo } from "react";
import DataGrid from "@/components/shared/DataGrid";
import FormDialog from "@/components/shared/FormDialog";
import { useApiSync } from "@/lib/useApiSync";
import { base44 } from "@/api/base44Client";

export default function EquipesPage() {
  const { data, loading, loadFromApi, createItem, updateItem, deleteItem } = useApiSync("Equipe", "equipes", "equipe_id");
  const [unidades, setUnidades] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFromApi();
    base44.entities.Unidade.list().then(setUnidades);
  }, []);

  const cnesMap = useMemo(() => {
    const m = {};
    unidades.forEach((u) => { if (u.cnes) m[u.cnes] = u.nome_unidade; });
    return m;
  }, [unidades]);

  const cnesOptions = useMemo(() =>
    unidades
      .filter((u) => u.cnes)
      .map((u) => ({ value: u.cnes, label: `${u.cnes} - ${u.nome_unidade || ''}` })),
    [unidades]
  );

  const columns = [
    { key: "equipe_id", label: "ID" },
    { key: "cnes", label: "CNES", render: (v) => v ? `${v}${cnesMap[v] ? ` - ${cnesMap[v]}` : ''}` : "—" },
    { key: "ine", label: "INE" },
    { key: "descricao", label: "Descrição" },
  ];

  const formFields = [
    { key: "descricao", label: "Descrição", type: "text" },
    { key: "cnes", label: "CNES (Unidade)", type: "select", options: cnesOptions },
    { key: "ine", label: "INE", type: "text" },
  ];

  const handleAdd = () => { setEditing(null); setFormValues({}); setFormOpen(true); };
  const handleEdit = (row) => { setEditing(row); setFormValues({ ...row }); setFormOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Payload no formato da API — id do registro original (editing), não do form
      const payload = {
        id: editing ? Number(editing.equipe_id) : undefined,
        descricao: formValues.descricao || "",
        cnes: formValues.cnes || "",
        ine: formValues.ine || "",
      };
      if (editing) await updateItem(Number(editing.equipe_id), payload);
      else await createItem(payload);
      setFormOpen(false);
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Equipes</h2>
      <DataGrid
        title="Equipes de Saúde"
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={(row) => deleteItem(row.equipe_id)}
      />
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar Equipe" : "Nova Equipe"}
        fields={formFields}
        values={formValues}
        onChange={(key, val) => setFormValues((p) => ({ ...p, [key]: val }))}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}