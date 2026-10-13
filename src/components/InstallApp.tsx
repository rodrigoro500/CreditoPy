import { useEffect, useState } from "react";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      if (!window.matchMedia("(display-mode: standalone)").matches) {
        setPrompt(event as InstallPrompt);
      }
    };
    const installed = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  async function install() {
    if (!prompt) return;
    setInstalling(true);
    setError("");
    try {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    } catch {
      setPrompt(null);
      setError("Abrí CréditoPy en Chrome y elegí Instalar aplicación en el menú.");
    } finally {
      setInstalling(false);
    }
  }

  if (error) return <p role="status" className="fixed bottom-28 right-4 z-30 max-w-xs rounded-lg bg-white p-4 text-sm text-slate-700 shadow-lg lg:bottom-5">{error}</p>;
  if (!prompt) return null;
  return (
    <button type="button" onClick={install} disabled={installing}
      className="fixed bottom-28 right-4 z-30 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg lg:bottom-5">
      {installing ? "Instalando…" : "Instalar CréditoPy"}
    </button>
  );
}
