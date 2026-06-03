import React, { useEffect, useState, useMemo } from "react";
import DataGrid from "@/components/shared/DataGrid";
import FormDialog from "@/components/shared/FormDialog";
import { useApiSync } from "@/lib/useApiSync";
import { base44 } from "@/api/base44Client";

export default function UnidadesPage() {
  const { data, loading, loadFromApi, createItem, updateItem, deleteItem } = useApiSync("Unidade", "unidades", "unidade_id");
  const [instituicoes, setInstituicoes] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFromApi();
    base44.entities.Instituicao.list().then(setInstituicoes);
  }, []);

  const instMap = useMemo(() => {
    const m = {};
    instituicoes.forEach((i) => { m[i.instituicao_id] = i.nome; });
    return m;
  }, [instituicoes]);

  const instOptions = useMemo(() =>
    instituicoes.map((i) => ({ value: i.instituicao_id, label: i.nome || `ID ${i.instituicao_id}` })),
    [instituicoes]
  );

  const columns = [
    { key: "unidade_id", label: "ID" },
    { key: "cnes", label: "CNES" },
    { key: "nome_unidade", label: "Nome" },
    { key: "id_instituicao", label: "Instituição", render: (v) => instMap[v] || (v ? `ID: ${v}` : "—") },
  ];

  const formFields = [
    { key: "nome_unidade", label: "Nome da Unidade", type: "text" },
    { key: "cnes", label: "CNES", type: "text" },
    { key: "id_instituicao", label: "Instituição", type: "select", options: instOptions },
  ];

  const handleAdd = () => { setEditing(null); setFormValues({}); setFormOpen(true); };
  const handleEdit = (row) => { setEditing(row); setFormValues({ ...row }); setFormOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Payload no formato esperado pela API externa
      const payload = {
        nome: formValues.nome_unidade,
        cnes: formValues.cnes,
        idInstuicao: formValues.id_instituicao ? Number(formValues.id_instituicao) : null,
        id: editing ? Number(editing.unidade_id) : undefined,
      };
      if (editing) await updateItem(Number(editing.unidade_id), payload);
      else await createItem(payload);
      setFormOpen(false);
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Unidades</h2>
      <DataGrid
        title="Unidades de Saúde"
        columns={columns}
        data={data}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={(row) => deleteItem(row.unidade_id)}
      />
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar Unidade" : "Nova Unidade"}
        fields={formFields}
        values={formValues}
        onChange={(key, val) => setFormValues((p) => ({ ...p, [key]: val }))}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}