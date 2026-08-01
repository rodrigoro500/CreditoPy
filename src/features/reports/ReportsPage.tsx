import { Link } from "react-router-dom";
import { Banknote, CalendarDays, CircleDollarSign, ClipboardList, TrendingUp, Users } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useDataStore } from "../../app/DataProvider";
import { formatCurrency } from "../../lib/format";

export function ReportsPage() {
  const { clients, credits, getPaidByCredit, resetDemoData } = useDataStore();
  const amountLent = credits.reduce((sum, credit) => sum + credit.amount, 0);
  const interest = credits.reduce((sum, credit) => sum + credit.interestAmount, 0);
  const paid = credits.reduce((sum, credit) => sum + getPaidByCredit(credit.id), 0);
  const pending = credits.reduce((sum, credit) => sum + credit.totalAmount, 0) - paid;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-slate-500">Indicadores base de cartera, recuperacion e intereses.</p>
        <button className="mt-2 text-sm font-semibold text-brand-700" type="button" onClick={resetDemoData}>
          Restaurar datos demo
        </button>
      </div>

      <div className="grid grid-cols-4 rounded-lg border border-slate-200 bg-white p-1 shadow-soft">
        {["Hoy", "Semana", "Mes", "Ano"].map((tab, index) => (
          <button
            key={tab}
            className={`h-10 rounded-md text-sm font-semibold ${index === 2 ? "bg-brand-600 text-white" : "text-slate-600"}`}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Dinero prestado" value={formatCurrency(amountLent)} icon={<Banknote className="h-5 w-5" />} />
        <StatCard label="Dinero recuperado" value={formatCurrency(paid)} icon={<CircleDollarSign className="h-5 w-5" />} tone="green" />
        <StatCard label="Intereses generados" value={formatCurrency(interest)} icon={<TrendingUp className="h-5 w-5" />} tone="yellow" />
        <StatCard label="Clientes activos" value={String(clients.length)} icon={<Users className="h-5 w-5" />} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="font-bold">Resumen de saldo</h2>
            <p className="text-sm text-slate-500">Tambien podes abrir planillas para cobrar o revisar toda la cartera.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/reportes/saldos">
              <Button variant="secondary">
                <ClipboardList className="h-4 w-4" />
                Saldos y cuotas
              </Button>
            </Link>
            <Link to="/reportes/cobranza">
              <Button variant="secondary">
                <CalendarDays className="h-4 w-4" />
                Reporte de cobranza
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-brand-600" style={{ width: `${Math.round((paid / (paid + pending)) * 100)}%` }} />
        </div>
        <div className="mt-3 flex justify-between text-sm text-slate-600">
          <span>Cobrado {formatCurrency(paid)}</span>
          <span>Pendiente {formatCurrency(pending)}</span>
        </div>
      </section>
    </div>
  );
}
