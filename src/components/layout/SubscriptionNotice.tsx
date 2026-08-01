import { AlertTriangle } from "lucide-react";
import { useAuth } from "../../features/auth/AuthProvider";
import { currentUser } from "../../lib/mock-data";
import { getSubscriptionMessage, getSubscriptionStatus } from "../../lib/subscription";
import { formatDate } from "../../lib/format";

export function SubscriptionNotice() {
  const { profile } = useAuth();

  if (profile?.role === "admin") return null;

  const message = getSubscriptionMessage(currentUser);
  const status = getSubscriptionStatus(currentUser);

  if (!message) return null;

  const styles =
    status === "expired"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <section className={`mb-5 rounded-lg border p-4 ${styles}`}>
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="font-bold">Aviso de vencimiento del plan</h2>
          <p className="mt-1 text-sm">{message}</p>
          <p className="mt-1 text-xs">Fecha de vencimiento: {formatDate(currentUser.planExpiresAt)}</p>
        </div>
      </div>
    </section>
  );
}
