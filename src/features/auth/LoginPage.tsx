import { useState } from "react";
import type { FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAuth } from "./AuthProvider";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
        navigate("/inicio");
      } else {
        await signUp(fullName, email, password);
        setMessage("Cuenta creada. Queda pendiente de aprobacion del administrador.");
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "No se pudo completar la operacion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-md bg-brand-600 p-3 text-white">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Ingresar a CreditoPy</h1>
            <p className="text-sm text-slate-500">
              {mode === "login" ? "Acceso con usuario aprobado." : "Registro pendiente de aprobacion."}
            </p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            className={`h-10 rounded-md text-sm font-semibold ${mode === "login" ? "bg-white text-brand-700 shadow-sm" : "text-slate-600"}`}
            type="button"
            onClick={() => setMode("login")}
          >
            Ingresar
          </button>
          <button
            className={`h-10 rounded-md text-sm font-semibold ${mode === "register" ? "bg-white text-brand-700 shadow-sm" : "text-slate-600"}`}
            type="button"
            onClick={() => setMode("register")}
          >
            Registrarse
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Nombre completo</span>
              <input
                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </label>
          ) : null}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Correo</span>
            <input
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Contrasena</span>
            <input
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3"
              minLength={6}
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">{message}</p> : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </Button>
        </form>
      </section>
    </main>
  );
}
