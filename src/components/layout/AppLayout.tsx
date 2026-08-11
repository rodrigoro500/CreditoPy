import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Bell, CalendarDays, CreditCard, Gem, Home, LogOut, Menu, ReceiptText, ShieldCheck, Sparkles, Users, WalletCards } from "lucide-react";
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
  const mobileNavigation = isAdmin
    ? visibleNavigation.slice(0, 5)
    : [
        navigation[0],
        navigation[1],
        navigation[4],
        navigation[2],
        { label: "Mas", href: "/reportes", icon: Sparkles }
      ];

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
        <header className="sticky top-0 z-10 flex h-[86px] items-center justify-between border-b border-slate-100 bg-white px-5 shadow-sm lg:h-16 lg:px-8">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink lg:hidden" type="button" title="Menu">
            <Menu className="h-7 w-7" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center lg:static lg:translate-x-0 lg:text-left">
            <p className="text-3xl font-extrabold leading-tight tracking-normal lg:text-base lg:font-bold">CreditoPy</p>
            <p className="text-sm text-slate-500 lg:text-xs">
              <span className="lg:hidden">Control de Creditos</span>
              <span className="hidden lg:inline">
                {profile ? `${profile.full_name} - ${profile.role === "admin" ? "Administrador" : "Usuario"}` : "Cuenta privada"}
              </span>
            </p>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
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

          <div className="relative lg:hidden">
            <Bell className="h-7 w-7 text-ink" />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
              3
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 lg:px-8">
          <SubscriptionNotice />
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid h-[82px] grid-cols-5 rounded-t-md bg-ink px-2 pb-2 pt-2 text-white shadow-[0_-12px_30px_rgba(20,33,61,0.18)] lg:hidden">
        {mobileNavigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold ${
                item.href === "/pagos/nuevo"
                  ? "-mt-8"
                  : isActive
                    ? "text-brand-500"
                    : "text-slate-300"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={
                    item.href === "/pagos/nuevo"
                      ? "flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg"
                      : ""
                  }
                >
                  <item.icon className={`${item.href === "/pagos/nuevo" ? "h-8 w-8" : "h-6 w-6"} ${isActive && item.href !== "/pagos/nuevo" ? "fill-current" : ""}`} />
                </span>
                <span className={item.href === "/pagos/nuevo" ? "mt-1 text-slate-200" : ""}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
