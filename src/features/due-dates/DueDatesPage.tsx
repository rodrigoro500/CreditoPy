import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useDataStore } from "../../app/DataProvider";
import { formatCurrency, formatDate } from "../../lib/format";
import { getNextInstallment, getPaidInstallmentCount } from "../../lib/installments";

type DueFilter = "today" | "upcoming" | "late";

const dueTabs: { value: DueFilter; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "upcoming", label: "Proximos" },
  { value: "late", label: "Atrasados" }
];

export function DueDatesPage() {
  const { credits, getPaidByCredit, getInstallmentsByCredit } = useDataStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFilter = normalizeFilter(searchParams.get("estado"));
  const today = new Date().toISOString().slice(0, 10);
  const rows = credits
    .map((credit) => {
      const paid = getPaidByCredit(credit.id);
      const paidInstallments = getPaidInstallmentCount(credit, paid);
      const nextInstallment = getNextInstallment(getInstallmentsByCredit(credit.id), paidInstallments);
      return {
        credit,
        paid,
        balance: Math.max(0, credit.totalAmount - paid),
        nextInstallment
      };
    })
    .filter((row) => row.nextInstallment && row.balance > 0)
    .filter((row) => {
      const dueDate = row.nextInstallment!.dueDate;
      if (selectedFilter === "today") return dueDate === today;
      if (selectedFilter === "late") return dueDate < today;
      return dueDate > today;
    })
    .sort((a, b) => a.nextInstallment!.dueDate.localeCompare(b.nextInstallment!.dueDate));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Vencimientos</h1>
        <p className="text-slate-500">Vista base para cobros de hoy, proximos y atrasados.</p>
      </div>

      <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-white p-1 shadow-soft">
        {dueTabs.map((tab) => (
          <button
            key={tab.value}
            className={`h-10 rounded-md text-sm font-semibold ${selectedFilter === tab.value ? "bg-brand-600 text-white" : "text-slate-600"}`}
            type="button"
            onClick={() => setSearchParams(tab.value === "today" ? {} : { estado: tab.value === "late" ? "atrasados" : "proximos" })}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="grid gap-4">
        {rows.map(({ credit, balance, nextInstallment }) => {
          return (
            <article key={credit.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="font-bold">{credit.clientName}</h2>
                  <p className="text-sm text-slate-500">
                    Vence {formatDate(nextInstallment!.dueDate)} - cuota {formatCurrency(nextInstallment!.amount)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Cuota {nextInstallment!.number}/{credit.installments}
                  </p>
                  <p className="mt-1 text-sm font-semibold">Saldo {formatCurrency(balance)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={nextInstallment!.dueDate < today ? "late" : "soon"} />
                  <Link to="/pagos/nuevo">
                    <Button>Registrar pago</Button>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
        {!rows.length ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
            No hay vencimientos para este filtro.
          </div>
        ) : null}
      </section>
    </div>
  );
}

function normalizeFilter(value: string | null): DueFilter {
  if (value === "atrasados" || value === "late") return "late";
  if (value === "proximos" || value === "upcoming") return "upcoming";
  return "today";
}
