import { Link } from "react-router-dom";
import { Gem, Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useDataStore } from "../../app/DataProvider";
import { formatCurrency, formatDate } from "../../lib/format";

export function FixedSalesPage() {
  const { credits, getPaidByCredit } = useDataStore();
  const fixedSales = credits.filter((credit) => credit.type === "fixed_price_sale");

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Ventas a cuotas</h1>
          <p className="text-slate-500">Productos con precio final fijo, sin calculo de porcentaje.</p>
        </div>
        <Link to="/ventas-cuotas/nueva">
          <Button>
            <Plus className="h-4 w-4" />
            Nueva venta
          </Button>
        </Link>
      </section>

      <section className="grid gap-4">
        {fixedSales.map((sale) => {
          const paid = getPaidByCredit(sale.id);
          const balance = sale.totalAmount - paid;

          return (
            <article key={sale.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="flex gap-3">
                  <div className="rounded-md bg-brand-50 p-3 text-brand-700">
                    <Gem className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold">{sale.productName ?? "Producto a cuotas"}</h2>
                    <p className="text-sm text-slate-500">{sale.clientName}</p>
                    <p className="text-sm text-slate-500">Vence {formatDate(sale.dueDate)}</p>
                  </div>
                </div>
                <StatusBadge status={sale.status === "late" ? "late" : "active"} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Amount label="Precio final" value={sale.totalAmount} />
                <Amount label="Cuota" value={sale.installmentValue} />
                <Amount label="Saldo" value={balance} strong />
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Amount({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className={`mt-1 ${strong ? "text-lg font-bold text-brand-700" : "font-semibold"}`}>{formatCurrency(value)}</p>
    </div>
  );
}
