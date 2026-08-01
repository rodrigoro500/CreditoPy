import type { CreditFrequency, Weekday } from "../types/domain";

const weekdayValues: Weekday[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function getWeekdayFromDate(date: string): Weekday {
  return weekdayValues[new Date(`${date}T00:00:00`).getDay()];
}

export function addInstallmentPeriod(startDate: string, frequency: CreditFrequency, installments: number) {
  const date = new Date(`${startDate}T00:00:00`);
  const periods = Math.max(1, installments);

  if (frequency === "daily") date.setDate(date.getDate() + periods);
  if (frequency === "weekly") date.setDate(date.getDate() + periods * 7);
  if (frequency === "biweekly") date.setDate(date.getDate() + periods * 14);
  if (frequency === "monthly") date.setMonth(date.getMonth() + periods);

  return date.toISOString().slice(0, 10);
}

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}
