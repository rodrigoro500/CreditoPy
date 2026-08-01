import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export function PendingApprovalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-amber-50 text-amber-700">
          <Clock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink">Cuenta pendiente de aprobacion</h1>
        <p className="mt-2 text-sm text-slate-500">
          El administrador debe aprobar este usuario antes de que pueda usar CreditoPy.
        </p>
        <Link className="mt-5 block" to="/login">
          <Button className="w-full" variant="secondary">
            Volver al ingreso
          </Button>
        </Link>
      </section>
    </main>
  );
}
