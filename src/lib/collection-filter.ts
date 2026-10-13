export function chooseCollectionFilter(pendingDates: string[], today: string): "today" | "late" | "upcoming" {
  if (pendingDates.some((date) => date === today)) return "today";
  if (pendingDates.some((date) => date < today)) return "late";
  return pendingDates.length ? "upcoming" : "today";
}
