import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function FormDialog({ open, onClose, title, fields, values, onChange, onSave, saving }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key} className="text-sm font-medium">{field.label}</Label>
              {field.type === "boolean" ? (
                <Switch
                  id={field.key}
                  checked={!!values[field.key]}
                  onCheckedChange={(v) => onChange(field.key, v)}
                />
              ) : field.type === "select" ? (
                <Select
                  value={values[field.key] != null ? String(values[field.key]) : ""}
                  onValueChange={(v) => onChange(field.key, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || `Selecione ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options || []).map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.key}
                  type={field.type === "number" ? "number" : "text"}
                  value={values[field.key] ?? ""}
                  onChange={(e) => onChange(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                  placeholder={field.placeholder || field.label}
                  disabled={field.disabled}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={onSave} disabled={saving} className="bg-primary hover:bg-primary/90 gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}