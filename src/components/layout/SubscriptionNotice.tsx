import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "../../features/auth/AuthProvider";
import { getDaysUntilExpiration } from "../../lib/subscription";
import { formatCurrency, formatDate } from "../../lib/format";
import { supabase } from "../../lib/supabase";

interface Subscription {
  plan_name: string;
  plan_price: number;
  monthly_total: number;
  expires_at: string;
  paid_at: string | null;
}

export function SubscriptionNotice() {
  const { profile, user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      if (!supabase || !user || profile?.role === "admin") return;

      const { data } = await supabase
        .from("subscriptions")
        .select("plan_name, plan_price, monthly_total, expires_at, paid_at")
        .eq("user_id", user.id)
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setSubscription(data as Subscription | null);
    }

    loadSubscription();
  }, [profile?.role, user?.id]);

  if (profile?.role === "admin") return null;

  if (!subscription) return null;

  const daysLeft = getDaysUntilExpiration(subscription.expires_at);
  const isTrial = !subscription.paid_at && Number(subscription.monthly_total) === 0;
  const isExpired = daysLeft < 0;
  const shouldShow = isTrial || isExpired || daysLeft <= 5;

  if (!shouldShow) return null;

  const message = getMessage(subscription, daysLeft, isTrial);

  const styles =
    isExpired
      ? "border-red-200 bg-red-50 text-red-800"
      : isTrial
      ? "border-blue-200 bg-blue-50 text-blue-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <section className={`mb-5 rounded-lg border p-4 ${styles}`}>
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="font-bold">{isTrial ? "Prueba gratis activa" : "Aviso de vencimiento del plan"}</h2>
          <p className="mt-1 text-sm">{message}</p>
          <p className="mt-1 text-xs">Fecha de vencimiento: {formatDate(subscription.expires_at)}</p>
        </div>
      </div>
    </section>
  );
}

function getMessage(subscription: Subscription, daysLeft: number, isTrial: boolean) {
  if (daysLeft < 0) {
    return isTrial
      ? `Tu prueba gratis del plan ${subscription.plan_name} vencio.`
      : `Tu plan ${subscription.plan_name} vencio. Monto mensual: ${formatCurrency(subscription.plan_price)}.`;
  }

  if (isTrial) {
    return `Te quedan ${daysLeft} dias de prueba gratis del plan ${subscription.plan_name}.`;
  }

  if (daysLeft === 0) {
    return `Tu plan ${subscription.plan_name} vence hoy. Monto mensual: ${formatCurrency(subscription.plan_price)}.`;
  }

  return `Faltan ${daysLeft} dias para el vencimiento del pago del plan ${subscription.plan_name}. Monto: ${formatCurrency(subscription.plan_price)}.`;
}
