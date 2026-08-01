import { CalendarDays, Printer, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { useDataStore } from "../../app/DataProvider";
import {
  getCollectionCreditsByWeekday,
  getExtensionInterestByCreditOnDate,
  getInstallmentPaidByCreditOnDate,
  getPaidByCreditOnDate,
  getPaidInstallments,
  weekdays
} from "../../lib/collection-report";
import { formatCurrency, formatDate } from "../../lib/format";
import type { Weekday } from "../../types/domain";

export function CollectionReportPage() {
  const { credits, payments, getPaidByCredit } = useDataStore();
  const [selectedDay, setSelectedDay] = useState<Weekday>("monday");
  const [selectedDate, setSelectedDate] = useState("2026-07-27");

  const rows = useMemo(() => getCollectionCreditsByWeekday(credits, selectedDay), [selectedDay]);
  const totalExpected = rows.reduce((sum, credit) => sum + credit.installmentValue, 0);
  const totalCollectedToday = rows.reduce(
    (sum, credit) => sum + getPaidByCreditOnDate(payments, credit.id, selectedDate),
    0
  );

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Reporte de cobranza</h1>
          <p className="text-slate-500">Planilla diaria para salir a cobrar a clientes segun el dia asignado.</p>
        </div>
        <Button type="button" variant="secondary">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </section>

      <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft lg:grid-cols-[1fr_220px]">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Dia de cobranza</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
            {weekdays.map((day) => (
              <button
                key={day.value}
                className={`h-10 rounded-md border text-sm font-semibold ${
                  selectedDay === day.value
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
                type="button"
                onClick={() => setSelectedDay(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Fecha del reporte</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Clientes a cobrar" value={String(rows.length)} icon={<CalendarDays className="h-5 w-5" />} />
        <SummaryCard label="Total esperado" value={formatCurrency(totalExpected)} icon={<WalletCards className="h-5 w-5" />} />
        <SummaryCard label="Cargado ese dia" value={formatCurrency(totalCollectedToday)} icon={<WalletCards className="h-5 w-5" />} />
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-bold">Planilla del {formatDate(selectedDate)}</h2>
          <p className="text-sm text-slate-500">Incluye solo creditos asignados al dia seleccionado.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Producto / credito</th>
                <th className="px-4 py-3">Cuotas</th>
                <th className="px-4 py-3">Monto cuota</th>
                <th className="px-4 py-3">Saldo actual</th>
                <th className="px-4 py-3">Pago cargado hoy</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((credit) => {
                const paid = getPaidByCredit(credit.id);
                const balance = credit.totalAmount - paid;
                const paidToday = getPaidByCreditOnDate(payments, credit.id, selectedDate);
                const installmentPaidToday = getInstallmentPaidByCreditOnDate(payments, credit.id, selectedDate);
                const extensionInterestToday = getExtensionInterestByCreditOnDate(payments, credit.id, selectedDate);
                const paidInstallments = getPaidInstallments(credit, paid);

                return (
                  <tr key={credit.id}>
                    <td className="px-4 py-3 font-semibold">{credit.clientName}</td>
                    <td className="px-4 py-3 text-slate-600">{credit.productName ?? credit.id}</td>
                    <td className="px-4 py-3">{paidInstallments}/{credit.installments}</td>
                    <td className="px-4 py-3">{formatCurrency(credit.installmentValue)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(balance)}</td>
                    <td className="px-4 py-3">
                      <span className={paidToday > 0 ? "font-bold text-brand-700" : "text-slate-400"}>
                        {paidToday > 0 ? formatCurrency(paidToday) : "Sin pago cargado"}
                      </span>
                      {extensionInterestToday > 0 ? (
                        <p className="text-xs text-amber-700">Incluye interes de prorroga</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          paidToday > 0 ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {installmentPaidToday > 0 ? "Pagado hoy" : extensionInterestToday > 0 ? "Prorrogado" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{label}</p>
        <div className="rounded-md bg-brand-50 p-2 text-brand-700">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
