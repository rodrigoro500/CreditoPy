import type { Payment } from "../types/domain";

export function paymentsOnDate(payments: Payment[], date: string) {
  return payments.filter((payment) => payment.paidAt.slice(0, 10) === date);
}

export function reportRange(period: "today" | "week" | "month" | "year", today: string) {
  const start = new Date(`${today}T00:00:00`);
  if (period === "week") start.setDate(start.getDate() - 6);
  if (period === "month") start.setDate(1);
  if (period === "year") start.setMonth(0, 1);
  const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  return { startDate, endDate: today };
}
