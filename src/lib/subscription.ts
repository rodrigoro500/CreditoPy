import type { SubscriptionStatus, UserProfile } from "../types/domain";
import { calculateMonthlyPlanPrice } from "./plans";
import { formatCurrency } from "./format";

const oneDayMs = 24 * 60 * 60 * 1000;

export function getDaysUntilExpiration(expiresAt: string, today = new Date()) {
  const expirationDate = new Date(`${expiresAt}T23:59:59`);
  return Math.ceil((expirationDate.getTime() - today.getTime()) / oneDayMs);
}

export function getSubscriptionStatus(user: UserProfile, today = new Date()): SubscriptionStatus {
  const daysLeft = getDaysUntilExpiration(user.planExpiresAt, today);

  if (daysLeft < 0) return "expired";
  if (daysLeft <= 5) return "due_soon";
  return "active";
}

export function getSubscriptionMessage(user: UserProfile, today = new Date()) {
  const daysLeft = getDaysUntilExpiration(user.planExpiresAt, today);

  if (daysLeft < 0) {
    return `Tu plan ${user.planName} vencio. El costo mensual es de ${formatCurrency(calculateMonthlyPlanPrice(user))}.`;
  }

  if (daysLeft === 0) {
    return `Tu plan ${user.planName} vence hoy. El costo mensual es de ${formatCurrency(calculateMonthlyPlanPrice(user))}.`;
  }

  if (daysLeft <= 5) {
    return `Faltan ${daysLeft} dias para el vencimiento del pago del plan ${user.planName}. Monto: ${formatCurrency(calculateMonthlyPlanPrice(user))}.`;
  }

  return "";
}
