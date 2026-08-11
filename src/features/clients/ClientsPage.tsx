import { Link } from "react-router-dom";
import { Search, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useDataStore } from "../../app/DataProvider";
import { formatCurrency } from "../../lib/format";

export function ClientsPage() {
  const { clients, credits, getPaidByCredit } = useDataStore();

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-slate-500">Lista inicial preparada para conectarse a Supabase.</p>
        </div>
        <Link to="/clientes/nuevo">
          <Button>
            <UserPlus className="h-4 w-4" />
            Nuevo cliente
          </Button>
        </Link>
      </section>

      <label className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-soft">
        <Search className="h-5 w-5 text-slate-400" />
        <input className="w-full outline-none" placeholder="Buscar por nombre, cedula o telefono" />
      </label>

      <section className="grid gap-4 md:grid-cols-2">
        {clients.map((client) => {
          const clientCredits = credits.filter((credit) => credit.clientId === client.id);
          const activeCredit = clientCredits.find((credit) => credit.totalAmount - getPaidByCredit(credit.id) > 0);
          const lastCredit = activeCredit ?? clientCredits[0];
          const paid = lastCredit ? getPaidByCredit(lastCredit.id) : 0;
          const balance = lastCredit ? Math.max(0, lastCredit.totalAmount - paid) : 0;
          const status = activeCredit?.status === "late" ? "late" : activeCredit ? "active" : "paid";
          const creditLabel = activeCredit
            ? formatCurrency(activeCredit.totalAmount)
            : lastCredit
              ? "Credito finalizado"
              : "Sin credito creado";

          return (
            <article key={client.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold">{client.fullName}</h2>
                  <p className="text-sm text-slate-500">{client.phone}</p>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="grid gap-2 text-sm">
                <p>
                  <span className="text-slate-500">Credito activo:</span>{" "}
                  {creditLabel}
                </p>
                <p>
                  <span className="text-slate-500">Saldo:</span> {formatCurrency(balance)}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                {activeCredit ? (
                  <>
                    <Link className="flex-1" to="/creditos">
                      <Button className="w-full" variant="secondary">
                        Ver credito
                      </Button>
                    </Link>
                    <Link className="flex-1" to="/pagos/nuevo">
                      <Button className="w-full">Registrar pago</Button>
                    </Link>
                  </>
                ) : (
                  <Link className="flex-1" to="/creditos/nuevo">
                    <Button className="w-full">
                      Crear credito
                    </Button>
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
