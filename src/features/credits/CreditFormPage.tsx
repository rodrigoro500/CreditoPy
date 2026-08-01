import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDataStore } from "../../app/DataProvider";
import { Button } from "../../components/ui/Button";
import { calculateCreditTotal, calculateInstallmentValue } from "../../lib/credit-calculator";
import { getWeekdayFromDate, todayInputValue } from "../../lib/date-utils";
import { formatCurrency, formatDate } from "../../lib/format";
import { createId } from "../../lib/id";
import { generateInstallments, generateInstallmentsFromPending, getFinalDueDate } from "../../lib/installments";
import { demoUserId } from "../../lib/mock-data";
import type { CreditFrequency } from "../../types/domain";

export function CreditFormPage() {
  const navigate = useNavigate();
  const { clients, addCredit } = useDataStore();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [amount, setAmount] = useState(1000000);
  const [interestPercent, setInterestPercent] = useState(20);
  const [installments, setInstallments] = useState(12);
  const [frequency, setFrequency] = useState<CreditFrequency>("weekly");
  const [startDate, setStartDate] = useState(todayInputValue());
  const [creditMode, setCreditMode] = useState<"new" | "existing">("new");
  const [paidInstallments, setPaidInstallments] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [nextDueDate, setNextDueDate] = useState(todayInputValue());

  const totals = useMemo(() => calculateCreditTotal(amount, interestPercent), [amount, interestPercent]);
  const installmentValue = useMemo(
    () => calculateInstallmentValue(totals.totalAmount, installments),
    [totals.totalAmount, installments]
  );
  const selectedClient = clients.find((client) => client.id === clientId);
  const balanceForExisting = currentBalance > 0 ? currentBalance : totals.totalAmount;
  const initialPaidAmount = Math.max(0, totals.totalAmount - balanceForExisting);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedClient || amount <= 0 || installments <= 0) return;
    const safePaidInstallments = Math.min(installments, Math.max(0, paidInstallments));

    const newCredit = {
      id: createId("CR"),
      userId: demoUserId,
      clientId: selectedClient.id,
      clientName: selectedClient.fullName,
      type: "loan_with_interest",
      amount,
      interestPercent,
      interestAmount: totals.interestAmount,
      totalAmount: totals.totalAmount,
      installments,
      installmentValue,
      frequency,
      collectionDay: getWeekdayFromDate(creditMode === "existing" ? nextDueDate : startDate),
      startDate: creditMode === "existing" ? nextDueDate : startDate,
      dueDate: "",
      status: "active"
    } as const;
    const generatedInstallments =
      creditMode === "existing"
        ? generateInstallmentsFromPending(newCredit, safePaidInstallments, nextDueDate)
        : generateInstallments(newCredit);
    const initialPayment =
      creditMode === "existing" && initialPaidAmount > 0
        ? {
            id: createId("pay"),
            userId: demoUserId,
            creditId: newCredit.id,
            clientName: selectedClient.fullName,
            amount: initialPaidAmount,
            method: "cash" as const,
            type: "installment" as const,
            paidAt: todayInputValue(),
            notes: "Pago inicial cargado por credito existente"
          }
        : undefined;

    await addCredit({
      ...newCredit,
      dueDate: getFinalDueDate(generatedInstallments)
    }, generatedInstallments, initialPayment);

    navigate("/creditos");
  }

  const previewCredit = {
    id: "preview",
    userId: demoUserId,
    clientId: selectedClient?.id ?? "preview",
    clientName: selectedClient?.fullName ?? "Cliente",
    type: "loan_with_interest",
    amount,
    interestPercent,
    interestAmount: totals.interestAmount,
    totalAmount: totals.totalAmount,
    installments,
    installmentValue,
    frequency,
    collectionDay: getWeekdayFromDate(creditMode === "existing" ? nextDueDate : startDate),
    startDate: creditMode === "existing" ? nextDueDate : startDate,
    dueDate: "",
    status: "active"
  } as const;
  const previewInstallments =
    creditMode === "existing"
      ? generateInstallmentsFromPending(previewCredit, Math.min(installments, Math.max(0, paidInstallments)), nextDueDate)
      : generateInstallments(previewCredit);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Nuevo credito</h1>
        <p className="text-slate-500">Calculo automatico de interes, total y valor de cuota.</p>
      </div>

      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:grid-cols-[1fr_320px]" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Tipo de carga</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <button
                className={`h-11 rounded-md border text-sm font-semibold ${
                  creditMode === "new" ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"
                }`}
                type="button"
                onClick={() => setCreditMode("new")}
              >
                Credito nuevo
              </button>
              <button
                className={`h-11 rounded-md border text-sm font-semibold ${
                  creditMode === "existing" ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"
                }`}
                type="button"
                onClick={() => {
                  setCreditMode("existing");
                  setCurrentBalance((value) => value || totals.totalAmount);
                }}
              >
                Credito ya activo
              </button>
            </div>
          </div>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Cliente</span>
            <select className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3" value={clientId} onChange={(event) => setClientId(event.target.value)}>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.fullName}</option>
              ))}
            </select>
          </label>
          <NumberField label="Monto entregado" value={amount} onChange={setAmount} />
          <NumberField label="Interes %" value={interestPercent} onChange={setInterestPercent} />
          <NumberField label="Cantidad de cuotas" value={installments} onChange={setInstallments} />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              {creditMode === "existing" ? "Siguiente vencimiento pendiente" : "Fecha de la primera cuota"}
            </span>
            <input
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3"
              type="date"
              value={creditMode === "existing" ? nextDueDate : startDate}
              onChange={(event) =>
                creditMode === "existing" ? setNextDueDate(event.target.value) : setStartDate(event.target.value)
              }
            />
          </label>
          {creditMode === "existing" ? (
            <>
              <NumberField label="Cuotas ya pagadas" value={paidInstallments} onChange={setPaidInstallments} />
              <NumberField label="Saldo actual pendiente" value={balanceForExisting} onChange={setCurrentBalance} />
            </>
          ) : null}
          <div className="md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Frecuencia</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["daily", "Diario"],
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
        </div>

        <aside className="rounded-lg bg-slate-50 p-4">
          <h2 className="font-bold">Resumen</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Monto" value={formatCurrency(amount)} />
            <Row label="Interes" value={formatCurrency(totals.interestAmount)} />
            <Row label="Total a cobrar" value={formatCurrency(totals.totalAmount)} strong />
            <Row label="Valor de cuota" value={formatCurrency(installmentValue)} strong />
            {creditMode === "existing" ? (
              <>
                <Row label="Ya pagado" value={formatCurrency(initialPaidAmount)} />
                <Row label="Saldo actual" value={formatCurrency(balanceForExisting)} strong />
                <Row label="Proxima cuota" value={`${Math.min(installments, paidInstallments + 1)}/${installments}`} />
              </>
            ) : null}
            <Row label="Ultimo vencimiento" value={formatDate(getFinalDueDate(previewInstallments) || startDate)} />
          </div>
          <Button className="mt-5 w-full" type="submit" disabled={!clients.length}>
            Confirmar credito
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
