import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDataStore } from "../../app/DataProvider";
import { todayInputValue } from "../../lib/date-utils";
import { paymentsOnDate } from "../../lib/payment-report";
import { formatCurrency, formatDate } from "../../lib/format";

export function CollectionReportPage() {
  const { credits, clients, payments, loading, error } = useDataStore();
  const [params] = useSearchParams();
  const requestedDate = params.get("fecha");
  const [selectedDate, setSelectedDate] = useState(requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : todayInputValue());
  const rows = paymentsOnDate(payments, selectedDate);
  const total = rows.reduce((sum, payment) => sum + payment.amount, 0);
  const installmentTotal = rows.filter((payment) => (payment.type ?? "installment") === "installment").reduce((sum, payment) => sum + payment.amount, 0);
  const clientIds = new Set(rows.map((payment) => credits.find((credit) => credit.id === payment.creditId)?.clientId ?? payment.creditId));

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Historial de cobros</h1><p className="text-slate-500">Pagos registrados según la fecha del cobro.</p></div>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
        <label className="block"><span className="text-sm font-semibold">Fecha de cobro</span>
          <input type="date" required className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3" value={selectedDate} onChange={(event) => { if (event.target.value) setSelectedDate(event.target.value); }} />
        </label>
        <button type="button" className="mt-3 min-h-11 font-bold text-brand-700" onClick={() => setSelectedDate(todayInputValue())}>Ver cobros de hoy</button>
      </section>
      {error && <p role="alert" className="text-red-700">No se pudieron cargar los cobros: {error}</p>}
      <section className="grid gap-3 sm:grid-cols-3">
        <Summary label="Total cobrado" value={formatCurrency(total)} />
        <Summary label="Clientes que pagaron" value={String(clientIds.size)} />
        <Summary label="Pagos registrados" value={String(rows.length)} />
      </section>
      <p className="text-sm text-slate-600">Cuotas: {formatCurrency(installmentTotal)} · Intereses de prórroga: {formatCurrency(total - installmentTotal)}</p>
      <h2 className="text-lg font-bold">Cobros del {formatDate(selectedDate)}</h2>
      <section className="grid gap-3">
        {rows.map((payment) => {
          const credit = credits.find((item) => item.id === payment.creditId);
          const client = clients.find((item) => item.id === credit?.clientId);
          return <article key={payment.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex justify-between gap-3"><h3 className="font-bold">{client?.fullName || credit?.clientName || payment.clientName || "Cliente"}</h3><p className="font-bold text-brand-700">{formatCurrency(payment.amount)}</p></div>
            <p className="mt-2 text-sm text-slate-600">Fecha de pago: {formatDate(payment.paidAt.slice(0, 10))}</p>
            <p className="text-sm text-slate-600">{payment.method === "transfer" ? "Transferencia" : "Efectivo"} · {payment.type === "extension_interest" ? "Interés de prórroga" : "Pago de cuota"}</p>
            <p className="mt-1 break-all text-xs text-slate-500">Crédito: {payment.creditId}</p>
            {payment.notes && <p className="mt-1 text-sm text-slate-600">{payment.notes}</p>}
          </article>;
        })}
        {!rows.length && <p className="rounded-xl border border-slate-200 bg-white p-5 text-center text-slate-500">{loading ? "Cargando cobros…" : "No hay pagos registrados en esta fecha."}</p>}
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>;
}
