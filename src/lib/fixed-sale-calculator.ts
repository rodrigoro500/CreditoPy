export function calculateInstallmentsFromFixedPayment(totalAmount: number, installmentValue: number) {
  if (!totalAmount || !installmentValue || installmentValue <= 0) return 0;
  return Math.ceil(totalAmount / installmentValue);
}

export function calculateFixedSaleBalance(totalAmount: number, paidAmount: number) {
  return Math.max(0, totalAmount - paidAmount);
}
