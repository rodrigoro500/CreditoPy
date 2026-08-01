import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { formatCurrency, formatDate } from "../../lib/format";
import { supabase } from "../../lib/supabase";

interface SubscriptionRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  approval_status: string;
  plan_code: string;
  plan_name: string;
  plan_price: number;
  monthly_total: number;
  starts_at: string;
  expires_at: string;
  paid_at: string | null;
  status: "active" | "due_soon" | "expired";
}

const oneDayMs = 24 * 60 * 60 * 1000;

export function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  async function loadSubscriptions() {
    if (!supabase) return;
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("admin_subscription_overview")
      .select("*")
      .order("expires_at", { ascending: true });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setSubscriptions((data ?? []) as SubscriptionRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return subscriptions;

    return subscriptions.filter((subscription) => {
      const name = subscription.full_name?.toLowerCase() ?? "";
      const email = subscription.email?.toLowerCase() ?? "";
      const plan = subscription.plan_name.toLowerCase();
      return name.includes(search) || email.includes(search) || plan.includes(search);
    });
  }, [query, subscriptions]);

  async function renewSubscription(subscription: SubscriptionRow) {
    if (!supabase) return;

    const today = new Date();
    const nextExpiration = new Date(today.getTime() + 30 * oneDayMs).toISOString().slice(0, 10);

    const { error } = await supabase
      .from("subscriptions")
      .update({
        starts_at: today.toISOString().slice(0, 10),
        expires_at: nextExpiration,
        paid_at: today.toISOString().slice(0, 10),
        monthly_total: subscription.plan_price,
        status: "active"
      })
      .eq("id", subscription.id);

    setMessage(error ? error.message : `Plan renovado para ${subscription.email ?? "usuario"}.`);
    await loadSubscriptions();
  }

  const trialUsers = subscriptions.filter(isTrialSubscription).length;
  const paidUsers = subscriptions.filter((subscription) => !isTrialSubscription(subscription)).length;
  const dueSoon = subscriptions.filter(
    (subscription) => !isTrialSubscription(subscription) && getDaysLeft(subscription.expires_at) <= 5
  ).length;
  const expired = subscriptions.filter((subscription) => getDaysLeft(subscription.expires_at) < 0).length;

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Suscripciones</h1>
          <p className="text-slate-500">Usuarios aprobados, planes, vencimientos y pagos pendientes.</p>
        </div>
        <Button type="button" variant="secondary" onClick={loadSubscriptions}>
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </section>

      {message ? <p className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">{message}</p> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Summary label="Usuarios con plan" value={String(subscriptions.length)} />
        <Summary label="Prueba gratis" value={String(trialUsers)} tone="blue" />
        <Summary label="Planes pagados" value={String(paidUsers)} />
        <Summary label="Vencen en 5 dias" value={String(dueSoon)} tone="yellow" />
        <Summary label="Vencidos" value={String(expired)} tone="red" />
      </section>

      <label className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-soft">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          className="w-full outline-none"
          placeholder="Buscar por nombre, correo o plan"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Ultimo pago</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={7}>Cargando suscripciones...</td>
                </tr>
              ) : null}
              {!loading && filteredSubscriptions.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={7}>No hay suscripciones para mostrar.</td>
                </tr>
              ) : null}
              {filteredSubscriptions.map((subscription) => {
                const daysLeft = getDaysLeft(subscription.expires_at);
                return (
                  <tr key={subscription.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{subscription.full_name ?? "Sin nombre"}</p>
                      <p className="text-xs text-slate-500">{subscription.email}</p>
                    </td>
                    <td className="px-4 py-3">{subscription.plan_name}</td>
                    <td className="px-4 py-3">{formatCurrency(subscription.plan_price)}</td>
                    <td className="px-4 py-3">{subscription.paid_at ? formatDate(subscription.paid_at) : "Prueba gratis"}</td>
                    <td className="px-4 py-3">{formatDate(subscription.expires_at)}</td>
                    <td className="px-4 py-3">
                      <Status daysLeft={daysLeft} isTrial={isTrialSubscription(subscription)} />
                    </td>
                    <td className="px-4 py-3">
                      <Button type="button" variant="secondary" onClick={() => renewSubscription(subscription)}>
                        Renovar 30 dias
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function getDaysLeft(expiresAt: string) {
  const today = new Date();
  const expires = new Date(`${expiresAt}T23:59:59`);
  return Math.ceil((expires.getTime() - today.getTime()) / oneDayMs);
}

function isTrialSubscription(subscription: SubscriptionRow) {
  return !subscription.paid_at && Number(subscription.monthly_total) === 0;
}

function Status({ daysLeft, isTrial }: { daysLeft: number; isTrial: boolean }) {
  if (daysLeft < 0) {
    return <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Vencido</span>;
  }

  if (isTrial) {
    return <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Prueba: {daysLeft} dias</span>;
  }

  if (daysLeft <= 5) {
    return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Faltan {daysLeft} dias</span>;
  }

  return <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">Activo</span>;
}

function Summary({ label, value, tone = "green" }: { label: string; value: string; tone?: "green" | "yellow" | "red" | "blue" }) {
  const styles = {
    green: "text-brand-700 bg-brand-50",
    blue: "text-blue-700 bg-blue-50",
    yellow: "text-amber-700 bg-amber-50",
    red: "text-red-700 bg-red-50"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-3 inline-flex rounded-md px-3 py-1 text-2xl font-bold ${styles[tone]}`}>{value}</p>
    </div>
  );
}
