import type { CreditFrequency } from "../types/domain";

export function calculateCreditTotal(amount: number, interestPercent: number) {
  const interestAmount = Math.round(amount * (interestPercent / 100));
  return {
    interestAmount,
    totalAmount: amount + interestAmount
  };
}

export function calculateInstallmentValue(totalAmount: number, installments: number) {
  if (!installments || installments <= 0) return 0;
  return Math.ceil(totalAmount / installments);
}

export function frequencyLabel(frequency: CreditFrequency) {
  const labels: Record<CreditFrequency, string> = {
    daily: "Diario",
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual"
  };

  return labels[frequency];
}
