import type { Credit, CreditStatus, Installment } from "../types/domain";
import { getPaidInstallmentCount } from "./installments";

export function currentCreditStatus(credit: Credit, installments: Installment[], paid: number, today: string): CreditStatus {
  if (paid >= credit.totalAmount) return "paid";
  const paidCount = getPaidInstallmentCount(credit, paid);
  return installments.some((item) => item.number > paidCount && item.dueDate < today) ? "late" : "active";
}
