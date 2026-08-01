import { useEffect, useState } from "react";
import { Check, Gift, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { formatCurrency } from "../../lib/format";
import { getPlanByCode, plans } from "../../lib/plans";
import { supabase } from "../../lib/supabase";
import type { PlanCode } from "../../types/domain";

interface PendingProfile {
  id: string;
  full_name: string;
  email: string;
  approval_status: "pending" | "approved" | "rejected";
  role: "admin" | "lender";
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<PendingProfile[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, PlanCode>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadPendingUsers() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, approval_status")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (!error) {
      const pending = (data ?? []) as PendingProfile[];
      setUsers(pending);
      setSelectedPlans(
        pending.reduce<Record<string, PlanCode>>((acc, user) => {
          acc[user.id] = selectedPlans[user.id] ?? "plus";
          return acc;
        }, {})
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPendingUsers();
  }, []);

  async function approveUser(user: PendingProfile) {
    if (!supabase) return;

    const planCode = selectedPlans[user.id] ?? "plus";
    const plan = getPlanByCode(planCode);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ approval_status: "approved", role: "lender" })
      .eq("id", user.id);

    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    const { error: subscriptionError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_code: plan.code,
      plan_name: plan.name,
      plan_price: plan.monthlyPrice,
      client_limit: plan.clientLimit,
      included_collectors: plan.includedCollectors,
      collector_count: 0,
      extra_collector_count: 0,
      extra_collector_price: plan.extraCollectorPrice,
      monthly_total: plan.monthlyPrice,
      starts_at: new Date().toISOString().slice(0, 10),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      paid_at: new Date().toISOString().slice(0, 10),
      status: "active"
    });

    if (subscriptionError) {
      setMessage(subscriptionError.message);
      return;
    }

    setMessage(`Usuario ${user.email} aprobado.`);
    await loadPendingUsers();
  }

  async function approveTrialUser(user: PendingProfile) {
    if (!supabase) return;

    const plan = getPlanByCode("plus");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ approval_status: "approved", role: "lender" })
      .eq("id", user.id);

    if (profileError) {
      setMessage(profileError.message);
      return;
    }

    const { error: subscriptionError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_code: plan.code,
      plan_name: plan.name,
      plan_price: plan.monthlyPrice,
      client_limit: plan.clientLimit,
      included_collectors: plan.includedCollectors,
      collector_count: 0,
      extra_collector_count: 0,
      extra_collector_price: plan.extraCollectorPrice,
      monthly_total: 0,
      starts_at: new Date().toISOString().slice(0, 10),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      paid_at: null,
      status: "active"
    });

    if (subscriptionError) {
      setMessage(subscriptionError.message);
      return;
    }

    setMessage(`Usuario ${user.email} aprobado con prueba Plus gratis por 7 dias.`);
    await loadPendingUsers();
  }

  async function rejectUser(user: PendingProfile) {
    if (!supabase) return;

    const { error } = await supabase
      .from("profiles")
      .update({ approval_status: "rejected" })
      .eq("id", user.id);

    setMessage(error ? error.message : `Usuario ${user.email} rechazado.`);
    await loadPendingUsers();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Aprobacion de usuarios</h1>
        <p className="text-slate-500">Usuarios registrados que esperan aprobacion y asignacion de plan.</p>
      </div>

      {message ? <p className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">{message}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Cargando usuarios pendientes...</p> : null}
      {!loading && users.length === 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <p className="font-semibold">No hay usuarios pendientes.</p>
          <p className="text-sm text-slate-500">Cuando alguien se registre, aparecera en esta lista.</p>
        </section>
      ) : null}

      <section className="grid gap-4">
        {users.map((user) => {
          const selectedPlan = getPlanByCode(selectedPlans[user.id] ?? "plus");
          return (
          <article key={user.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="font-bold">{user.full_name}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>
                <label className="mt-3 block max-w-xs">
                  <span className="text-sm font-medium text-slate-700">Plan a asignar</span>
                  <select
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3"
                    value={selectedPlans[user.id] ?? "plus"}
                    onChange={(event) =>
                      setSelectedPlans((current) => ({ ...current, [user.id]: event.target.value as PlanCode }))
                    }
                  >
                    {plans.map((plan) => (
                      <option key={plan.code} value={plan.code}>
                        {plan.name} - {formatCurrency(plan.monthlyPrice)}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-2 text-sm text-slate-500">{selectedPlan.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => approveTrialUser(user)}>
                  <Gift className="h-4 w-4" />
                  Prueba Plus 7 dias
                </Button>
                <Button type="button" onClick={() => approveUser(user)}>
                  <Check className="h-4 w-4" />
                  Aprobar con pago
                </Button>
                <Button type="button" variant="danger" onClick={() => rejectUser(user)}>
                  <X className="h-4 w-4" />
                  Rechazar
                </Button>
              </div>
            </div>
          </article>
        )})}
      </section>
    </div>
  );
}
