import { Link } from "react-router-dom";
import { useState } from "react";
import { Banknote, CalendarDays, CircleDollarSign, ClipboardList, TrendingUp, Users } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useDataStore } from "../../app/DataProvider";
import { useToday } from "../../lib/use-today";
import { reportRange } from "../../lib/payment-report";
import { formatCurrency } from "../../lib/format";

type ReportPeriod = "today" | "week" | "month" | "year";

const periodTabs: { value: ReportPeriod; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Ano" }
];

export function ReportsPage() {
  const { clients, credits, payments, getPaidByCredit, isDemoMode, resetDemoData } = useDataStore();
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const today = useToday();
  const { startDate, endDate } = reportRange(period, today);
  const periodCredits = credits.filter((credit) => isDateInRange(credit.startDate, startDate, endDate));
  const periodPayments = payments.filter((payment) => isDateInRange(payment.paidAt.slice(0, 10), startDate, endDate));
  const activeClientIds = new Set(credits.filter((credit) => credit.status !== "paid").map((credit) => credit.clientId));
  const amountLent = periodCredits.reduce((sum, credit) => sum + credit.amount, 0);
  const interest = periodCredits.reduce((sum, credit) => sum + credit.interestAmount, 0);
  const paid = periodPayments
    .filter((payment) => (payment.type ?? "installment") === "installment")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalPortfolio = credits.reduce((sum, credit) => sum + credit.totalAmount, 0);
  const totalPaid = credits.reduce((sum, credit) => sum + getPaidByCredit(credit.id), 0);
  const pending = totalPortfolio - totalPaid;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-slate-500">Indicadores base de cartera, recuperacion e intereses.</p>
        {isDemoMode ? (
          <button className="mt-2 text-sm font-semibold text-brand-700" type="button" onClick={resetDemoData}>
            Restaurar datos demo
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-4 rounded-lg border border-slate-200 bg-white p-1 shadow-soft">
        {periodTabs.map((tab) => (
          <button
            key={tab.value}
            className={`h-10 rounded-md text-sm font-semibold ${period === tab.value ? "bg-brand-600 text-white" : "text-slate-600"}`}
            type="button"
            onClick={() => setPeriod(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Link to={`/reportes/cobranza?fecha=${today}`} className="flex min-h-12 items-center justify-center rounded-lg bg-brand-600 px-4 py-3 font-bold text-white">Ver quién pagó y cuánto · Elegir fecha de cobro</Link>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Dinero prestado" value={formatCurrency(amountLent)} icon={<Banknote className="h-5 w-5" />} />
        <StatCard label="Dinero recuperado" value={formatCurrency(paid)} icon={<CircleDollarSign className="h-5 w-5" />} tone="green" />
        <StatCard label="Intereses generados" value={formatCurrency(interest)} icon={<TrendingUp className="h-5 w-5" />} tone="yellow" />
        <StatCard label="Clientes activos" value={String(clients.filter((client) => activeClientIds.has(client.id)).length)} icon={<Users className="h-5 w-5" />} />
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
                Historial de cobros
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-brand-600" style={{ width: `${paid + pending > 0 ? Math.round((paid / (paid + pending)) * 100) : 0}%` }} />
        </div>
        <div className="mt-3 flex justify-between text-sm text-slate-600">
          <span>Cobrado {formatCurrency(paid)}</span>
          <span>Pendiente {formatCurrency(pending)}</span>
        </div>
      </section>
    </div>
  );
}

function isDateInRange(value: string, startDate: string, endDate: string) {
  return value >= startDate && value <= endDate;
}
