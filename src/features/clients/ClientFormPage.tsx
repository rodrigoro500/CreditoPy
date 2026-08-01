import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDataStore } from "../../app/DataProvider";
import { Button } from "../../components/ui/Button";
import { demoUserId } from "../../lib/mock-data";
import { createId } from "../../lib/id";

export function ClientFormPage() {
  const navigate = useNavigate();
  const { addClient } = useDataStore();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    documentNumber: "",
    city: "",
    address: "",
    notes: ""
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) return;

    await addClient({
      id: createId("cli"),
      userId: demoUserId,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      documentNumber: form.documentNumber.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString().slice(0, 10)
    });

    navigate("/clientes");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Nuevo cliente</h1>
        <p className="text-slate-500">Formulario base. Nombre y telefono seran los campos principales.</p>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre completo" required value={form.fullName} onChange={(value) => updateField("fullName", value)} />
          <Field label="Telefono" required value={form.phone} onChange={(value) => updateField("phone", value)} />
          <Field label="Cedula" value={form.documentNumber} onChange={(value) => updateField("documentNumber", value)} />
          <Field label="Ciudad" value={form.city} onChange={(value) => updateField("city", value)} />
          <Field label="Direccion" className="md:col-span-2" value={form.address} onChange={(value) => updateField("address", value)} />
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Observaciones</span>
            <textarea
              className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit">Guardar cliente</Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  className = "",
  value,
  onChange
}: {
  label: string;
  required?: boolean;
  className?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-slate-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <input
        className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
