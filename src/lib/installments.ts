import type { Credit, Installment } from "../types/domain";

export function addPeriod(dateValue: string, frequency: Credit["frequency"], periods: number) {
  const date = new Date(`${dateValue}T00:00:00`);

  if (frequency === "daily") date.setDate(date.getDate() + periods);
  if (frequency === "weekly") date.setDate(date.getDate() + periods * 7);
  if (frequency === "biweekly") date.setDate(date.getDate() + periods * 14);
  if (frequency === "monthly") date.setMonth(date.getMonth() + periods);

  return date.toISOString().slice(0, 10);
}

export function addOnePeriod(dateValue: string, frequency: Credit["frequency"]) {
  return addPeriod(dateValue, frequency, 1);
}

export function generateInstallments(credit: Credit): Installment[] {
  return Array.from({ length: credit.installments }, (_, index) => ({
    id: `${credit.id}-quota-${index + 1}`,
    userId: credit.userId,
    creditId: credit.id,
    number: index + 1,
    amount: credit.installmentValue,
    dueDate: addPeriod(credit.startDate, credit.frequency, index),
    status: "pending"
  }));
}

export function generateInstallmentsFromPending(
  credit: Credit,
  paidInstallments: number,
  nextDueDate: string
): Installment[] {
  const nextPendingNumber = Math.min(credit.installments, Math.max(0, paidInstallments) + 1);

  return Array.from({ length: credit.installments }, (_, index) => {
    const number = index + 1;
    return {
      id: `${credit.id}-quota-${number}`,
      userId: credit.userId,
      creditId: credit.id,
      number,
      amount: credit.installmentValue,
      dueDate: addPeriod(nextDueDate, credit.frequency, number - nextPendingNumber),
      status: number <= paidInstallments ? ("paid" as const) : ("pending" as const)
    };
  });
}

export function getFinalDueDate(installments: Installment[]) {
  return installments[installments.length - 1]?.dueDate ?? "";
}

export function getPaidInstallmentCount(credit: Credit, paidAmount: number) {
  if (!credit.installmentValue) return 0;
  return Math.min(credit.installments, Math.floor(paidAmount / credit.installmentValue));
}

export function getNextInstallment(installments: Installment[], paidInstallmentCount: number) {
  return installments
    .filter((installment) => installment.number > paidInstallmentCount)
    .sort((a, b) => a.number - b.number)[0];
}

export function postponeInstallmentsFrom(
  installments: Installment[],
  credit: Credit,
  fromInstallmentNumber: number
) {
  return installments.map((installment) => {
    if (installment.creditId !== credit.id || installment.number < fromInstallmentNumber) {
      return installment;
    }

    return {
      ...installment,
      dueDate: addOnePeriod(installment.dueDate, credit.frequency),
      status: "pending" as const
    };
  });
}
