import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Button } from "../../components/ui/Button";

export function ProfilePage() {
  const { profile, user, updateDisplayName, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { setName(profile?.full_name ?? ""); }, [profile?.full_name]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await updateDisplayName(name);
      setMessage("Tu perfil se actualizó correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el perfil. Intentá nuevamente.");
    } finally { setBusy(false); }
  }

  async function logout() {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try { await signOut(); navigate("/login", { replace: true }); }
    catch { setError("No se pudo cerrar sesión. Revisá tu conexión e intentá nuevamente."); }
    finally { setBusy(false); }
  }

  return (
    <section className="mx-auto max-w-xl space-y-5">
      <div><h1 className="text-2xl font-bold">Mi perfil</h1><p className="text-slate-500">Datos de tu cuenta de CréditoPy.</p></div>
      <form onSubmit={save} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
        <p className="font-semibold text-brand-700">{profile?.role === "admin" ? "Administrador" : "Usuario"}</p>
        <label className="block"><span className="text-sm font-medium">Nombre para mostrar</span>
          <input className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} disabled={busy} autoComplete="name" />
        </label>
        <label className="block"><span className="text-sm font-medium">Correo de acceso</span>
          <input className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-600" type="email" value={user?.email ?? profile?.email ?? ""} readOnly />
        </label>
        {message && <p role="status" className="text-sm font-semibold text-green-700">{message}</p>}
        {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
        <Button className="w-full" type="submit" disabled={busy}>{busy ? "Procesando…" : "Guardar cambios"}</Button>
        <Button className="w-full" type="button" variant="danger" disabled={busy} onClick={logout}>Cerrar sesión</Button>
      </form>
    </section>
  );
}
