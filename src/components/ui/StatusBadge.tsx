interface StatusBadgeProps {
  status: "active" | "late" | "paid" | "soon";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    active: "bg-brand-50 text-brand-700 ring-brand-100",
    late: "bg-red-50 text-red-700 ring-red-100",
    paid: "bg-slate-100 text-slate-600 ring-slate-200",
    soon: "bg-amber-50 text-amber-700 ring-amber-100"
  };
  const labels = {
    active: "Al dia",
    late: "Atrasado",
    paid: "Finalizado",
    soon: "Vence pronto"
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config[status]}`}>
      {labels[status]}
    </span>
  );
}
