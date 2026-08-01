import type { Credit, Payment, Weekday } from "../types/domain";

export const weekdays: { value: Weekday; label: string }[] = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miercoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sabado" },
  { value: "sunday", label: "Domingo" }
];

export function getPaidByCreditOnDate(payments: Payment[], creditId: string, date: string) {
  return payments
    .filter((payment) => payment.creditId === creditId && payment.paidAt === date)
    .reduce((total, payment) => total + payment.amount, 0);
}

export function getInstallmentPaidByCreditOnDate(payments: Payment[], creditId: string, date: string) {
  return payments
    .filter(
      (payment) =>
        payment.creditId === creditId &&
        payment.paidAt === date &&
        (payment.type ?? "installment") === "installment"
    )
    .reduce((total, payment) => total + payment.amount, 0);
}

export function getExtensionInterestByCreditOnDate(payments: Payment[], creditId: string, date: string) {
  return payments
    .filter(
      (payment) =>
        payment.creditId === creditId &&
        payment.paidAt === date &&
        payment.type === "extension_interest"
    )
    .reduce((total, payment) => total + payment.amount, 0);
}

export function getPaidInstallments(credit: Credit, paidAmount: number) {
  if (!credit.installmentValue) return 0;
  return Math.min(credit.installments, Math.floor(paidAmount / credit.installmentValue));
}

export function getCollectionCreditsByWeekday(credits: Credit[], weekday: Weekday) {
  return credits.filter((credit) => credit.collectionDay === weekday && credit.status !== "paid");
}
