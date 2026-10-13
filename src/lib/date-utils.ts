import type { CreditFrequency, Weekday } from "../types/domain";

const weekdayValues: Weekday[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function localDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

  return localDateValue(date);
}

export function todayInputValue() {
  return localDateValue(new Date());
}
