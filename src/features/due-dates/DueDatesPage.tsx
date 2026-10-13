import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useDataStore } from "../../app/DataProvider";
import { useToday } from "../../lib/use-today";
import { formatCurrency, formatDate } from "../../lib/format";
import { getPaidInstallmentCount } from "../../lib/installments";

type DueFilter = "today" | "upcoming" | "late";
const dueTabs: { value: DueFilter; label: string }[] = [
  { value: "today", label: "Cobros de hoy" },
  { value: "upcoming", label: "Próximos" },
  { value: "late", label: "En mora" }
];

function daysBetween(from: string, to: string) {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.max(0, Math.round((end - start) / 86400000));
}

export function DueDatesPage() {
  const { credits, getPaidByCredit, getInstallmentsByCredit } = useDataStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFilter = normalizeFilter(searchParams.get("estado"));
  const today = useToday();

  const rows = credits.flatMap((credit) => {
    const paid = getPaidByCredit(credit.id);
    const balance = Math.max(0, credit.totalAmount - paid);
    if (balance <= 0) return [];
    const installments = getInstallmentsByCredit(credit.id);
    const paidCount = getPaidInstallmentCount(credit, paid);
    const pending = installments.filter((item) => item.number > paidCount);
    const overdue = pending.filter((item) => item.dueDate < today);
    const todayDue = pending.filter((item) => item.dueDate === today);
    const upcoming = pending.filter((item) => item.dueDate > today);
    const next = pending[0];
    if (!next) return [];
    // Un crédito atrasado también debe aparecer en el recorrido de cobro del día
    // si tiene una cuota que vence hoy.
    const show = selectedFilter === "late" ? overdue.length > 0
      : selectedFilter === "today" ? todayDue.length > 0
      : overdue.length === 0 && todayDue.length === 0 && upcoming.length > 0;
    if (!show) return [];
    const oldestOverdue = overdue[0];
    return [{
      credit, balance, paidCount, overdueCount: overdue.length,
      dueTodayCount: todayDue.length,
      daysLate: oldestOverdue ? daysBetween(oldestOverdue.dueDate, today) : 0,
      nextDue: selectedFilter === "today" ? todayDue[0] : selectedFilter === "upcoming" ? upcoming[0] : oldestOverdue ?? next
    }];
  }).sort((a, b) => a.nextDue.dueDate.localeCompare(b.nextDue.dueDate));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Cobranza y vencimientos</h1>
        <p className="text-slate-500">Consultá los cobros del día y los créditos atrasados.</p>
      </div>
      <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-white p-1 shadow-soft">
        {dueTabs.map((tab) => (
          <button key={tab.value} type="button"
            className={`min-h-11 rounded-md px-1 text-xs font-semibold sm:text-sm ${selectedFilter === tab.value ? "bg-brand-600 text-white" : "text-slate-600"}`}
            onClick={() => setSearchParams(tab.value === "today" ? {} : { estado: tab.value === "late" ? "atrasados" : "proximos" })}>
            {tab.label}
          </button>
        ))}
      </div>
      <p className="text-sm font-semibold text-slate-600">{rows.length} crédito(s) en esta vista</p>
      <section className="grid gap-4">
        {rows.map(({ credit, balance, paidCount, overdueCount, dueTodayCount, daysLate, nextDue }) => (
          <article key={credit.id} className={`rounded-xl border p-4 shadow-soft ${overdueCount ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">{credit.clientName}</h2>
                {overdueCount > 0 && <p className="font-bold text-red-700">En mora · {daysLate} día(s) · {overdueCount} cuota(s) vencida(s)</p>}
                {dueTodayCount > 0 && <p className="font-semibold text-amber-800">{dueTodayCount} cuota(s) vencen hoy</p>}
                <p className="text-sm text-slate-600">Cuota: {formatCurrency(credit.installmentValue)}</p>
                <p className="text-sm text-slate-600">Pagadas: {paidCount} de {credit.installments}</p>
                <p className="text-sm text-slate-600">Próximo vencimiento: {formatDate(nextDue.dueDate)} (cuota {nextDue.number})</p>
                <p className="font-bold text-slate-900">Saldo pendiente: {formatCurrency(balance)}</p>
              </div>
              <Link to={`/pagos/nuevo?creditId=${encodeURIComponent(credit.id)}`}>
                <Button>Registrar pago</Button>
              </Link>
            </div>
          </article>
        ))}
        {!rows.length && <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-soft">No hay cobros para este filtro.</div>}
      </section>
    </div>
  );
}

function normalizeFilter(value: string | null): DueFilter {
  if (value === "atrasados" || value === "late") return "late";
  if (value === "proximos" || value === "upcoming") return "upcoming";
  return "today";
}
