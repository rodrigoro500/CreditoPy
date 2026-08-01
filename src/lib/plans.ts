import type { PlanCode, PlanDefinition, UserProfile } from "../types/domain";

export const plans: PlanDefinition[] = [
  {
    code: "plus",
    name: "Plus",
    monthlyPrice: 50000,
    clientLimit: 100,
    includedCollectors: 0,
    extraCollectorPrice: 0,
    requiresAdminApprovalForExtraCollectors: false,
    description: "Para negocios que estan empezando a controlar creditos. Incluye prueba gratis de 7 dias y luego cuesta 50.000 Gs. al mes."
  },
  {
    code: "premium",
    name: "Premium",
    monthlyPrice: 100000,
    clientLimit: null,
    includedCollectors: 0,
    extraCollectorPrice: 0,
    requiresAdminApprovalForExtraCollectors: false,
    description: "Para control de creditos con clientes ilimitados y operacion individual."
  },
  {
    code: "elite",
    name: "Elite",
    monthlyPrice: 200000,
    clientLimit: null,
    includedCollectors: 3,
    extraCollectorPrice: 50000,
    requiresAdminApprovalForExtraCollectors: true,
    description: "Para equipos con administrador y cobradores internos."
  }
];

export function getPlanByCode(code: PlanCode) {
  return plans.find((plan) => plan.code === code) ?? plans[0];
}

export function calculateMonthlyPlanPrice(user: UserProfile) {
  const plan = getPlanByCode(user.planCode);
  const extraCollectorTotal = Math.max(0, user.extraCollectorCount) * plan.extraCollectorPrice;

  return plan.monthlyPrice + extraCollectorTotal;
}

export function getClientLimitLabel(plan: PlanDefinition) {
  return plan.clientLimit === null ? "Clientes ilimitados" : `Hasta ${plan.clientLimit} clientes`;
}

export function getCollectorLimitLabel(plan: PlanDefinition) {
  if (plan.includedCollectors === 0) return "Sin cobradores internos";
  return `Incluye ${plan.includedCollectors} cobradores`;
}
