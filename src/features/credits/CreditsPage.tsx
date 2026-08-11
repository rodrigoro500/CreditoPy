import { Link, useSearchParams } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useDataStore } from "../../app/DataProvider";
import { formatCurrency, formatDate } from "../../lib/format";
import { frequencyLabel } from "../../lib/credit-calculator";
import { getNextInstallment, getPaidInstallmentCount } from "../../lib/installments";
import type { CreditFrequency } from "../../types/domain";

type FrequencyFilter = CreditFrequency | "all";

const frequencyFilters: { value: FrequencyFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "daily", label: "Diarios" },
  { value: "weekly", label: "Semanales" },
  { value: "biweekly", label: "Quincenales" },
  { value: "monthly", label: "Mensuales" }
];

export function CreditsPage() {
  const { credits, getPaidByCredit, getInstallmentsByCredit } = useDataStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFrequency = normalizeFrequency(searchParams.get("frecuencia"));
  const filteredCredits =
    selectedFrequency === "all" ? credits : credits.filter((credit) => credit.frequency === selectedFrequency);

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Creditos</h1>
          <p className="text-slate-500">Creditos activos, atrasados y finalizados.</p>
        </div>
        <Link to="/creditos/nuevo">
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo credito
          </Button>
        </Link>
      </section>

      <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-soft">
        <div className="grid min-w-[560px] grid-cols-5 gap-1">
          {frequencyFilters.map((filter) => {
            const count = filter.value === "all" ? credits.length : credits.filter((credit) => credit.frequency === filter.value).length;
            return (
              <button
                key={filter.value}
                className={`min-h-11 rounded-md px-2 text-sm font-semibold ${
                  selectedFrequency === filter.value ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
                type="button"
                onClick={() =>
                  setSearchParams(filter.value === "all" ? {} : { frecuencia: filter.value })
                }
              >
                {filter.label}
                <span className="ml-1 text-xs opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4">
        {filteredCredits.map((credit) => {
          const paid = getPaidByCredit(credit.id);
          const balance = credit.totalAmount - paid;
          const progress = Math.min(100, Math.round((paid / credit.totalAmount) * 100));
          const paidInstallments = getPaidInstallmentCount(credit, paid);
          const installments = getInstallmentsByCredit(credit.id);
          const nextInstallment = getNextInstallment(installments, paidInstallments);

          return (
            <article key={credit.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{credit.id}</p>
                  <h2 className="text-lg font-bold">{credit.clientName}</h2>
                  <p className="text-sm text-slate-500">
                    {frequencyLabel(credit.frequency)} - proximo vencimiento{" "}
                    {nextInstallment ? formatDate(nextInstallment.dueDate) : "sin cuotas pendientes"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Vencimiento final: {formatDate(credit.dueDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/creditos/${credit.id}/editar`}>
                    <Button variant="secondary">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <StatusBadge status={credit.status === "late" ? "late" : "active"} />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <Amount label="Entregado" value={credit.amount} />
                <Amount label="Interes" value={credit.interestAmount} />
                <Amount label="Pagado" value={paid} />
                <Amount label="Saldo" value={balance} strong />
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-sm text-slate-500">
                  <span>{progress}% pagado</span>
                  <span>
                    {paidInstallments}/{credit.installments} cuotas de {formatCurrency(credit.installmentValue)}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="mt-4 rounded-md border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Proximas cuotas</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {installments.slice(0, 6).map((installment) => (
                    <div key={installment.id} className="flex justify-between rounded-md bg-white px-3 py-2 text-sm">
                      <span>Cuota {installment.number}</span>
                      <span className="font-semibold">{formatDate(installment.dueDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
        {!filteredCredits.length ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
            No hay creditos para este filtro.
          </div>
        ) : null}
      </section>
    </div>
  );
}

function normalizeFrequency(value: string | null): FrequencyFilter {
  if (value === "daily" || value === "weekly" || value === "biweekly" || value === "monthly") return value;
  return "all";
}

function Amount({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className={`mt-1 ${strong ? "text-lg font-bold text-brand-700" : "font-semibold"}`}>{formatCurrency(value)}</p>
    </div>
  );
}
