import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Gem, PackageCheck } from "lucide-react";
import { useDataStore } from "../../app/DataProvider";
import { Button } from "../../components/ui/Button";
import { getWeekdayFromDate, todayInputValue } from "../../lib/date-utils";
import { calculateInstallmentsFromFixedPayment } from "../../lib/fixed-sale-calculator";
import { formatCurrency, formatDate } from "../../lib/format";
import { createId } from "../../lib/id";
import { generateInstallments, getFinalDueDate } from "../../lib/installments";
import { demoUserId } from "../../lib/mock-data";
import type { CreditFrequency } from "../../types/domain";

export function FixedSaleFormPage() {
  const navigate = useNavigate();
  const { clients, addCredit } = useDataStore();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [productName, setProductName] = useState("Anillo de oro");
  const [productReference, setProductReference] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState(1200000);
  const [installmentValue, setInstallmentValue] = useState(150000);
  const [frequency, setFrequency] = useState<CreditFrequency>("weekly");
  const [startDate, setStartDate] = useState(todayInputValue());

  const installments = useMemo(
    () => calculateInstallmentsFromFixedPayment(totalAmount, installmentValue),
    [totalAmount, installmentValue]
  );
  const selectedClient = clients.find((client) => client.id === clientId);
  const previewCredit = {
    id: "preview",
    userId: demoUserId,
    clientId: selectedClient?.id ?? "preview",
    clientName: selectedClient?.fullName ?? "Cliente",
    type: "fixed_price_sale",
    productName,
    productDescription,
    amount: totalAmount,
    interestPercent: 0,
    interestAmount: 0,
    totalAmount,
    installments,
    installmentValue,
    frequency,
    collectionDay: getWeekdayFromDate(startDate),
    startDate,
    dueDate: "",
    status: "active"
  } as const;
  const finalDueDate = getFinalDueDate(generateInstallments(previewCredit));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedClient || !productName.trim() || totalAmount <= 0 || installmentValue <= 0) return;

    const newCredit = {
      id: createId("SALE"),
      userId: demoUserId,
      clientId: selectedClient.id,
      clientName: selectedClient.fullName,
      type: "fixed_price_sale",
      productName: productName.trim(),
      productDescription: productDescription.trim() || productReference.trim() || undefined,
      amount: totalAmount,
      interestPercent: 0,
      interestAmount: 0,
      totalAmount,
      installments,
      installmentValue,
      frequency,
      collectionDay: getWeekdayFromDate(startDate),
      startDate,
      dueDate: "",
      status: "active"
    } as const;

    await addCredit({
      ...newCredit,
      dueDate: getFinalDueDate(generateInstallments(newCredit))
    });

    navigate("/ventas-cuotas");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-brand-50 p-3 text-brand-700">
          <Gem className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Venta a cuotas con precio fijo</h1>
          <p className="text-slate-500">
            Para joyas, productos o mercaderias donde no se usa porcentaje de interes.
          </p>
        </div>
      </div>

      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:grid-cols-[1fr_320px]" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Cliente</span>
            <select className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3" value={clientId} onChange={(event) => setClientId(event.target.value)}>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.fullName}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Producto</span>
            <input className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3" value={productName} onChange={(event) => setProductName(event.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Codigo o referencia</span>
            <input className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3" placeholder="Opcional" value={productReference} onChange={(event) => setProductReference(event.target.value)} />
          </label>

          <NumberField label="Precio final del producto" value={totalAmount} onChange={setTotalAmount} />
          <NumberField label="Monto de cuota" value={installmentValue} onChange={setInstallmentValue} />

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Primera fecha de pago</span>
            <input className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>

          <div className="md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Frecuencia de pago</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                ["weekly", "Semanal"],
                ["biweekly", "Quincenal"],
                ["monthly", "Mensual"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={`h-11 rounded-md border text-sm font-semibold ${
                    frequency === value ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"
                  }`}
                  type="button"
                  onClick={() => setFrequency(value as CreditFrequency)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Observacion</span>
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Detalle del producto, garantia, condicion de entrega u otra nota"
              value={productDescription}
              onChange={(event) => setProductDescription(event.target.value)}
            />
          </label>
        </div>

        <aside className="rounded-lg bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-brand-700" />
            <h2 className="font-bold">Resumen</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Precio final" value={formatCurrency(totalAmount)} strong />
            <Row label="Cuota" value={formatCurrency(installmentValue)} />
            <Row label="Cantidad estimada" value={`${installments} cuotas`} />
            <Row label="Ultimo vencimiento" value={formatDate(finalDueDate || startDate)} />
            <Row label="Interes por porcentaje" value="No aplica" />
          </div>
          <Button className="mt-5 w-full" type="submit" disabled={!clients.length}>
            Guardar venta a cuotas
          </Button>
        </aside>
      </form>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3"
        min="0"
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "font-bold text-brand-700" : "font-semibold"}>{value}</span>
    </div>
  );
}
