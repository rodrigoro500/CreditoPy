import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: "green" | "blue" | "yellow" | "red";
}

export function StatCard({ label, value, icon, tone = "blue" }: StatCardProps) {
  const tones = {
    green: "bg-brand-50 text-brand-700",
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{label}</p>
        {icon ? <div className={`rounded-md p-2 ${tones[tone]}`}>{icon}</div> : null}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-normal text-ink">{value}</p>
    </div>
  );
}
