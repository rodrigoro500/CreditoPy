export type CreditFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type PaymentMethod = "cash" | "transfer";
export type PaymentType = "installment" | "extension_interest";
export type CreditStatus = "active" | "late" | "paid";
export type UserApprovalStatus = "pending" | "approved" | "rejected";
export type SubscriptionStatus = "active" | "due_soon" | "expired";
export type PlanCode = "plus" | "premium" | "elite";
export type CreditType = "loan_with_interest" | "fixed_price_sale";
export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface Client {
  id: string;
  userId: string;
  fullName: string;
  documentNumber?: string;
  phone: string;
  address?: string;
  city?: string;
  notes?: string;
  createdAt: string;
}

export interface Credit {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  type: CreditType;
  productName?: string;
  productDescription?: string;
  amount: number;
  interestPercent: number;
  interestAmount: number;
  totalAmount: number;
  installments: number;
  installmentValue: number;
  frequency: CreditFrequency;
  collectionDay?: Weekday;
  startDate: string;
  dueDate: string;
  status: CreditStatus;
}

export interface Installment {
  id: string;
  userId: string;
  creditId: string;
  number: number;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "late";
}

export interface Payment {
  id: string;
  userId: string;
  creditId: string;
  installmentId?: string;
  clientName: string;
  amount: number;
  method: PaymentMethod;
  type?: PaymentType;
  paidAt: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "lender";
  approvalStatus: UserApprovalStatus;
  planCode: PlanCode;
  planName: string;
  planPrice: number;
  collectorCount: number;
  extraCollectorCount: number;
  extraCollectorPrice: number;
  planStartedAt: string;
  planExpiresAt: string;
  createdAt: string;
}

export interface PlanDefinition {
  code: PlanCode;
  name: string;
  monthlyPrice: number;
  clientLimit: number | null;
  includedCollectors: number;
  extraCollectorPrice: number;
  requiresAdminApprovalForExtraCollectors: boolean;
  description: string;
}
