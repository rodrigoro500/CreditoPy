import { Link } from "react-router-dom";
import { AlertTriangle, Banknote, CircleDollarSign, Gem, ShieldCheck, UserPlus, Users, WalletCards } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useDataStore } from "../../app/DataProvider";
import { formatCurrency } from "../../lib/format";

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const { credits, getPaidByCredit } = useDataStore();
  const totalPortfolio = credits.reduce((sum, credit) => sum + credit.totalAmount, 0);
  const totalPaid = credits.reduce((sum, credit) => sum + getPaidByCredit(credit.id), 0);
  const pendingBalance = totalPortfolio - totalPaid;
  const lateCount = credits.filter((credit) => credit.status === "late").length;

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-ink">Panel administrativo</h1>
            <p className="text-slate-500">Gestiona usuarios, aprobaciones y planes de CreditoPy.</p>
          </div>
          <Link to="/admin/usuarios">
            <Button>
              <ShieldCheck className="h-4 w-4" />
              Ver usuarios pendientes
            </Button>
          </Link>
          <Link to="/admin/suscripciones">
            <Button variant="secondary">
              <WalletCards className="h-4 w-4" />
              Ver suscripciones
            </Button>
          </Link>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-bold">Tu usuario administrador</h2>
            <p className="mt-2 text-sm text-slate-500">
              Este usuario no necesita plan y no carga clientes propios. Sirve para aprobar cuentas y asignar planes.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-bold">Usuarios clientes</h2>
            <p className="mt-2 text-sm text-slate-500">
              Los negocios aprobados son los que cargan clientes, creditos, ventas, pagos y reportes.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Buenas noches, Rodrigo</h1>
          <p className="text-slate-500">Resumen de cartera, cobros y vencimientos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/clientes/nuevo">
            <Button variant="secondary">
              <UserPlus className="h-4 w-4" />
              Nuevo cliente
            </Button>
          </Link>
          <Link to="/creditos/nuevo">
            <Button>
              <CircleDollarSign className="h-4 w-4" />
              Nuevo credito
            </Button>
          </Link>
          <Link to="/ventas-cuotas/nueva">
            <Button variant="secondary">
              <Gem className="h-4 w-4" />
              Venta a cuotas
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cartera activa" value={formatCurrency(totalPortfolio)} icon={<Banknote className="h-5 w-5" />} tone="green" />
        <StatCard label="Cobrado" value={formatCurrency(totalPaid)} icon={<WalletCards className="h-5 w-5" />} />
        <StatCard label="Saldo pendiente" value={formatCurrency(pendingBalance)} icon={<CircleDollarSign className="h-5 w-5" />} tone="yellow" />
        <StatCard label="Clientes atrasados" value={String(lateCount)} icon={<AlertTriangle className="h-5 w-5" />} tone="red" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Cobros recientes</h2>
            <Link className="text-sm font-semibold text-brand-700" to="/pagos/nuevo">
              Registrar pago
            </Link>
          </div>
          <div className="space-y-3">
            {credits.map((credit) => {
              const paid = getPaidByCredit(credit.id);
              return (
                <div key={credit.id} className="flex items-center justify-between gap-4 rounded-md border border-slate-100 p-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{credit.clientName}</p>
                    <p className="text-sm text-slate-500">Cuota {formatCurrency(credit.installmentValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(credit.totalAmount - paid)}</p>
                    <StatusBadge status={credit.status === "late" ? "late" : "active"} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="mb-4 font-bold">Accesos rapidos</h2>
          <div className="grid gap-2">
            <Link to="/clientes">
              <Button className="w-full" variant="secondary">
                <Users className="h-4 w-4" />
                Ver clientes
              </Button>
            </Link>
            <Link to="/vencimientos">
              <Button className="w-full" variant="secondary">
                <AlertTriangle className="h-4 w-4" />
                Vencimientos
              </Button>
            </Link>
            <Link to="/ventas-cuotas">
              <Button className="w-full" variant="secondary">
                <Gem className="h-4 w-4" />
                Ventas a cuotas
              </Button>
            </Link>
            <Link to="/reportes">
              <Button className="w-full" variant="secondary">
                <Banknote className="h-4 w-4" />
                Reportes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
