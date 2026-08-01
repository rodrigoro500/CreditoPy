import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, CalendarDays, CreditCard, Gem, Home, LogOut, Menu, ReceiptText, ShieldCheck, Sparkles, Users, WalletCards } from "lucide-react";
import { useAuth } from "../../features/auth/AuthProvider";
import { SubscriptionNotice } from "./SubscriptionNotice";

const navigation = [
  { label: "Inicio", href: "/inicio", icon: Home },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Creditos", href: "/creditos", icon: CreditCard },
  { label: "Ventas", href: "/ventas-cuotas", icon: Gem },
  { label: "Cobros", href: "/pagos/nuevo", icon: WalletCards },
  { label: "Vencimientos", href: "/vencimientos", icon: CalendarDays },
  { label: "Reportes", href: "/reportes", icon: BarChart3 },
  { label: "Planes", href: "/planes", icon: Sparkles },
  { label: "Admin", href: "/admin/usuarios", icon: ShieldCheck },
  { label: "Suscripciones", href: "/admin/suscripciones", icon: ReceiptText }
];

export function AppLayout() {
  const navigate = useNavigate();
  const { profile, isAdmin, signOut } = useAuth();
  const adminRoutes = new Set(["/inicio", "/planes", "/admin/usuarios", "/admin/suscripciones"]);
  const visibleNavigation = navigation.filter((item) =>
    isAdmin ? adminRoutes.has(item.href) : item.href !== "/admin/usuarios"
  );

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-600 font-bold text-white">
            CP
          </div>
          <div>
            <p className="text-lg font-bold">CreditoPy</p>
            <p className="text-xs text-slate-500">Control de creditos</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {visibleNavigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Menu className="h-5 w-5 lg:hidden" />
            <div>
              <p className="font-bold">CreditoPy</p>
              <p className="text-xs text-slate-500">
                {profile ? `${profile.full_name} - ${profile.role === "admin" ? "Administrador" : "Usuario"}` : "Cuenta privada"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
              {profile?.role === "admin" ? "Admin" : "Plan"}
            </div>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              type="button"
              title="Cerrar sesion"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 lg:px-8">
          <SubscriptionNotice />
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white lg:hidden">
        {visibleNavigation.slice(0, 5).map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium ${
                isActive ? "text-brand-700" : "text-slate-500"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
