import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useDataStore } from "../../app/DataProvider";
import { formatCurrency, formatDate } from "../../lib/format";

export function DueDatesPage() {
  const { credits, getPaidByCredit } = useDataStore();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Vencimientos</h1>
        <p className="text-slate-500">Vista base para cobros de hoy, proximos y atrasados.</p>
      </div>

      <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-white p-1 shadow-soft">
        {["Hoy", "Proximos", "Atrasados"].map((tab, index) => (
          <button
            key={tab}
            className={`h-10 rounded-md text-sm font-semibold ${index === 0 ? "bg-brand-600 text-white" : "text-slate-600"}`}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="grid gap-4">
        {credits.map((credit) => {
          const paid = getPaidByCredit(credit.id);
          const balance = credit.totalAmount - paid;
          return (
            <article key={credit.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="font-bold">{credit.clientName}</h2>
                  <p className="text-sm text-slate-500">
                    Vence {formatDate(credit.dueDate)} - cuota {formatCurrency(credit.installmentValue)}
                  </p>
                  <p className="mt-1 text-sm font-semibold">Saldo {formatCurrency(balance)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={credit.status === "late" ? "late" : "soon"} />
                  <Link to="/pagos/nuevo">
                    <Button>Registrar pago</Button>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
