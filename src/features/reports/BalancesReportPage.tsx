import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useDataStore } from "../../app/DataProvider";
import { frequencyLabel } from "../../lib/credit-calculator";
import { formatCurrency, formatDate } from "../../lib/format";
import { getNextInstallment, getPaidInstallmentCount } from "../../lib/installments";

export function BalancesReportPage() {
  const { credits, getPaidByCredit, getInstallmentsByCredit } = useDataStore();
  const activeCredits = credits.filter((credit) => credit.status !== "paid");
  const totalPending = activeCredits.reduce(
    (sum, credit) => sum + Math.max(0, credit.totalAmount - getPaidByCredit(credit.id)),
    0
  );
  const totalInstallments = activeCredits.reduce((sum, credit) => sum + credit.installmentValue, 0);

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Saldos y cuotas pendientes</h1>
          <p className="text-slate-500">Planilla general de todos los clientes con creditos activos.</p>
        </div>
        <Link to="/reportes">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Summary label="Creditos activos" value={String(activeCredits.length)} />
        <Summary label="Total de cuotas" value={formatCurrency(totalInstallments)} />
        <Summary label="Saldo pendiente" value={formatCurrency(totalPending)} strong />
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Credito / producto</th>
                <th className="px-4 py-3">Frecuencia</th>
                <th className="px-4 py-3">Cuota pendiente</th>
                <th className="px-4 py-3">Monto cuota</th>
                <th className="px-4 py-3">Proximo vencimiento</th>
                <th className="px-4 py-3">Pagado</th>
                <th className="px-4 py-3">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeCredits.map((credit) => {
                const paid = getPaidByCredit(credit.id);
                const balance = Math.max(0, credit.totalAmount - paid);
                const paidInstallments = getPaidInstallmentCount(credit, paid);
                const nextInstallment = getNextInstallment(getInstallmentsByCredit(credit.id), paidInstallments);

                return (
                  <tr key={credit.id} className="align-top">
                    <td className="px-4 py-3 font-semibold">{credit.clientName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {credit.productName ?? credit.id}
                      <span className="block text-xs text-slate-400">Total {formatCurrency(credit.totalAmount)}</span>
                    </td>
                    <td className="px-4 py-3">{frequencyLabel(credit.frequency)}</td>
                    <td className="px-4 py-3 font-semibold">
                      {nextInstallment ? `${nextInstallment.number}/${credit.installments}` : "Sin pendiente"}
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(credit.installmentValue)}</td>
                    <td className="px-4 py-3">
                      {nextInstallment ? formatDate(nextInstallment.dueDate) : "Finalizado"}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(paid)}</td>
                    <td className="px-4 py-3 font-bold text-brand-700">{formatCurrency(balance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!activeCredits.length ? (
          <div className="p-6 text-center text-sm text-slate-500">Todavia no hay creditos activos para mostrar.</div>
        ) : null}
      </section>
    </div>
  );
}

function Summary({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${strong ? "text-brand-700" : ""}`}>{value}</p>
    </div>
  );
}
