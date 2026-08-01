import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AdminSubscriptionsPage } from "../features/admin/AdminSubscriptionsPage";
import { AdminUsersPage } from "../features/admin/AdminUsersPage";
import { LoginPage } from "../features/auth/LoginPage";
import { PendingApprovalPage } from "../features/auth/PendingApprovalPage";
import { LenderRoute } from "../features/auth/LenderRoute";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { ClientsPage } from "../features/clients/ClientsPage";
import { ClientFormPage } from "../features/clients/ClientFormPage";
import { CreditFormPage } from "../features/credits/CreditFormPage";
import { CreditsPage } from "../features/credits/CreditsPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { DueDatesPage } from "../features/due-dates/DueDatesPage";
import { FixedSaleFormPage } from "../features/fixed-sales/FixedSaleFormPage";
import { FixedSalesPage } from "../features/fixed-sales/FixedSalesPage";
import { PaymentFormPage } from "../features/payments/PaymentFormPage";
import { PlansPage } from "../features/plans/PlansPage";
import { BalancesReportPage } from "../features/reports/BalancesReportPage";
import { CollectionReportPage } from "../features/reports/CollectionReportPage";
import { ReportsPage } from "../features/reports/ReportsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/pendiente-aprobacion", element: <PendingApprovalPage /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/inicio" replace /> },
          { path: "inicio", element: <DashboardPage /> },
          {
            element: <LenderRoute />,
            children: [
              { path: "clientes", element: <ClientsPage /> },
              { path: "clientes/nuevo", element: <ClientFormPage /> },
              { path: "creditos", element: <CreditsPage /> },
              { path: "creditos/nuevo", element: <CreditFormPage /> },
              { path: "ventas-cuotas", element: <FixedSalesPage /> },
              { path: "ventas-cuotas/nueva", element: <FixedSaleFormPage /> },
              { path: "pagos/nuevo", element: <PaymentFormPage /> },
              { path: "vencimientos", element: <DueDatesPage /> },
              { path: "reportes", element: <ReportsPage /> },
              { path: "reportes/saldos", element: <BalancesReportPage /> },
              { path: "reportes/cobranza", element: <CollectionReportPage /> }
            ]
          },
          { path: "planes", element: <PlansPage /> },
          { path: "admin/usuarios", element: <AdminUsersPage /> },
          { path: "admin/suscripciones", element: <AdminSubscriptionsPage /> }
        ]
      }
    ]
  }
]);
