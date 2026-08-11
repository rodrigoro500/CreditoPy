import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import {
  Banknote,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FolderPlus,
  Gem,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useDataStore } from "../../app/DataProvider";
import { formatCurrency } from "../../lib/format";

export function DashboardPage() {
  const { isAdmin, profile } = useAuth();
  const { credits, getPaidByCredit } = useDataStore();
  const totalPortfolio = credits.reduce((sum, credit) => sum + credit.totalAmount, 0);
  const totalPaid = credits.reduce((sum, credit) => sum + getPaidByCredit(credit.id), 0);
  const pendingBalance = totalPortfolio - totalPaid;
  const lateCount = credits.filter((credit) => credit.status === "late").length;
  const displayName = profile?.full_name?.split(" ")[0] || "Usuario";
  const todayLabel = new Intl.DateTimeFormat("es-PY", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date());
  const recentCredits = credits.slice(0, 3);

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
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-[26px] font-extrabold leading-tight text-ink md:text-2xl">Buenas tardes, {displayName}!</h1>
          <p className="mt-1 text-sm capitalize text-slate-500 md:text-base">{todayLabel}</p>
        </div>
        <div className="hidden flex-wrap gap-2 md:flex">
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

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MobileMetric label="Cartera activa" value={formatCurrency(totalPortfolio)} detail="Ver detalles" icon={<WalletCards className="h-7 w-7" />} tone="green" />
        <MobileMetric label="Cobrado este mes" value={formatCurrency(totalPaid)} detail="Ver detalles" icon={<CircleDollarSign className="h-7 w-7" />} tone="blue" />
        <MobileMetric label="Saldo pendiente" value={formatCurrency(pendingBalance)} detail="Ver detalles" icon={<CalendarDays className="h-7 w-7" />} tone="yellow" />
        <MobileMetric label="Clientes atrasados" value={String(lateCount)} detail="Ver detalles" icon={<Users className="h-7 w-7" />} tone="red" />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-extrabold">Accesos rapidos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction to="/clientes/nuevo" label="Nuevo cliente" icon={<UserPlus className="h-9 w-9" />} tone="green" />
          <QuickAction to="/creditos/nuevo" label="Nuevo credito" icon={<FolderPlus className="h-9 w-9" />} tone="blue" />
          <QuickAction to="/pagos/nuevo" label="Registrar pago" icon={<Banknote className="h-9 w-9" />} tone="green" />
          <QuickAction to="/vencimientos" label="Ver vencimientos" icon={<CalendarDays className="h-9 w-9" />} tone="yellow" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Cobros de hoy</h2>
            <Link className="inline-flex items-center gap-1 text-sm font-bold text-brand-700" to="/reportes/cobranza">
              Ver todos <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
            {recentCredits.map((credit) => {
              const paid = getPaidByCredit(credit.id);
              const initials = credit.clientName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div key={credit.id} className="flex items-center justify-between gap-3 bg-white p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-extrabold leading-tight">{credit.clientName}</p>
                      <p className="truncate text-sm text-slate-500">Credito N. {credit.id}</p>
                      <p className={`mt-1 flex items-center gap-1 text-sm font-semibold ${credit.status === "late" ? "text-red-600" : "text-slate-500"}`}>
                        <Clock3 className="h-4 w-4" />
                        {credit.status === "late" ? "Atrasado" : "Vence hoy"}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-extrabold">{formatCurrency(credit.installmentValue)}</p>
                    <StatusBadge status={credit.status === "late" ? "late" : "active"} />
                    <p className="mt-1 text-xs text-slate-400">Saldo {formatCurrency(credit.totalAmount - paid)}</p>
                  </div>
                </div>
              );
            })}
            {!recentCredits.length ? (
              <div className="p-5 text-center text-sm text-slate-500">Todavia no hay cobros cargados.</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-soft">
          <Link className="flex items-center justify-between gap-4" to="/vencimientos">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-extrabold">Resumen rapido</h2>
                <p className="mt-1 text-sm text-slate-500">Tienes {lateCount} clientes con pagos pendientes.</p>
                <p className="mt-1 text-sm font-bold text-brand-700">Ver vencimientos</p>
              </div>
            </div>
            <ChevronRight className="h-7 w-7 text-ink" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function MobileMetric({
  label,
  value,
  detail,
  icon,
  tone
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: "green" | "blue" | "yellow" | "red";
}) {
  const tones = {
    green: "border-brand-100 bg-brand-50 text-brand-700",
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    yellow: "border-amber-100 bg-amber-50 text-amber-700",
    red: "border-red-100 bg-red-50 text-red-600"
  };

  return (
    <div className={`min-h-[150px] rounded-xl border p-3 shadow-sm ${tones[tone]}`}>
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/70">{icon}</div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-1 break-words text-[17px] font-extrabold leading-tight text-ink">{value}</p>
      <p className={`mt-2 inline-flex items-center gap-1 text-sm font-bold ${tone === "red" ? "text-red-600" : "text-brand-700"}`}>
        {detail} <ChevronRight className="h-4 w-4" />
      </p>
    </div>
  );
}

function QuickAction({
  to,
  label,
  icon,
  tone
}: {
  to: string;
  label: string;
  icon: ReactNode;
  tone: "green" | "blue" | "yellow";
}) {
  const tones = {
    green: "text-brand-600",
    blue: "text-blue-700",
    yellow: "text-amber-600"
  };

  return (
    <Link
      className="flex min-h-[126px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-soft"
      to={to}
    >
      <div className={tones[tone]}>{icon}</div>
      <span className="text-base font-extrabold leading-tight text-ink">{label}</span>
    </Link>
  );
}
