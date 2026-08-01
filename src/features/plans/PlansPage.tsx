import { CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { plans, getClientLimitLabel, getCollectorLimitLabel } from "../../lib/plans";
import { formatCurrency } from "../../lib/format";

export function PlansPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Planes</h1>
        <p className="text-slate-500">Oferta inicial para cobrar suscripcion mensual en CreditoPy.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.code} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
              </div>
              {plan.code === "elite" ? (
                <div className="rounded-md bg-brand-50 p-2 text-brand-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              ) : null}
            </div>

            <p className="mt-5 text-3xl font-bold text-ink">{formatCurrency(plan.monthlyPrice)}</p>
            <p className="text-sm text-slate-500">por mes</p>

            <div className="mt-5 space-y-3 text-sm">
              <PlanItem text={getClientLimitLabel(plan)} icon={<Users className="h-4 w-4" />} />
              <PlanItem text={getCollectorLimitLabel(plan)} />
              {plan.extraCollectorPrice > 0 ? (
                <PlanItem text={`${formatCurrency(plan.extraCollectorPrice)} por cada cobrador desde el cuarto`} />
              ) : null}
              {plan.requiresAdminApprovalForExtraCollectors ? (
                <PlanItem text="Cobradores extra aprobados solamente desde tu admin" />
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function PlanItem({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon ?? <CheckCircle2 className="h-4 w-4 text-brand-700" />}
      <span>{text}</span>
    </div>
  );
}
