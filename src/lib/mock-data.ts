import type { Client, Credit, Payment, UserProfile } from "../types/domain";

export const demoUserId = "demo-user";

export const currentUser: UserProfile = {
  id: demoUserId,
  fullName: "Rodrigo Roman",
  email: "rodrigo@creditopy.local",
  role: "lender",
  approvalStatus: "approved",
  planCode: "plus",
  planName: "Plus",
  planPrice: 50000,
  collectorCount: 0,
  extraCollectorCount: 0,
  extraCollectorPrice: 0,
  planStartedAt: "2026-07-06",
  planExpiresAt: "2026-08-05",
  createdAt: "2026-07-06"
};

export const pendingUsers: UserProfile[] = [
  {
    id: "user-pending-001",
    fullName: "Carlos Pereira",
    email: "carlos@example.com",
    role: "lender",
    approvalStatus: "pending",
    planCode: "plus",
    planName: "Plus",
    planPrice: 50000,
    collectorCount: 0,
    extraCollectorCount: 0,
    extraCollectorPrice: 0,
    planStartedAt: "2026-07-31",
    planExpiresAt: "2026-08-30",
    createdAt: "2026-07-31"
  },
  {
    id: "user-pending-002",
    fullName: "Roli Benitez",
    email: "roli@example.com",
    role: "lender",
    approvalStatus: "pending",
    planCode: "elite",
    planName: "Elite",
    planPrice: 200000,
    collectorCount: 4,
    extraCollectorCount: 1,
    extraCollectorPrice: 50000,
    planStartedAt: "2026-07-31",
    planExpiresAt: "2026-08-30",
    createdAt: "2026-07-31"
  }
];

export const clients: Client[] = [
  {
    id: "cli-001",
    userId: demoUserId,
    fullName: "Juan Lopez",
    documentNumber: "1.234.567",
    phone: "0981 000 000",
    address: "San Lorenzo",
    createdAt: "2026-07-01"
  },
  {
    id: "cli-002",
    userId: demoUserId,
    fullName: "Maria Gomez",
    documentNumber: "2.345.678",
    phone: "0982 111 111",
    address: "Fernando de la Mora",
    createdAt: "2026-07-05"
  },
  {
    id: "cli-003",
    userId: demoUserId,
    fullName: "Pedro Acosta",
    phone: "0983 222 222",
    address: "Luque",
    createdAt: "2026-07-10"
  }
];

export const credits: Credit[] = [
  {
    id: "CR-000124",
    userId: demoUserId,
    clientId: "cli-001",
    clientName: "Juan Lopez",
    type: "loan_with_interest",
    amount: 1000000,
    interestPercent: 20,
    interestAmount: 200000,
    totalAmount: 1200000,
    installments: 12,
    installmentValue: 100000,
    frequency: "weekly",
    collectionDay: "monday",
    startDate: "2026-07-01",
    dueDate: "2026-09-23",
    status: "active"
  },
  {
    id: "CR-000125",
    userId: demoUserId,
    clientId: "cli-002",
    clientName: "Maria Gomez",
    type: "loan_with_interest",
    amount: 800000,
    interestPercent: 15,
    interestAmount: 120000,
    totalAmount: 920000,
    installments: 8,
    installmentValue: 115000,
    frequency: "weekly",
    collectionDay: "monday",
    startDate: "2026-07-05",
    dueDate: "2026-08-30",
    status: "active"
  },
  {
    id: "CR-000126",
    userId: demoUserId,
    clientId: "cli-003",
    clientName: "Pedro Acosta",
    type: "fixed_price_sale",
    productName: "Cadena de oro 18k",
    productDescription: "Venta a cuotas con precio final fijo",
    amount: 600000,
    interestPercent: 0,
    interestAmount: 0,
    totalAmount: 600000,
    installments: 6,
    installmentValue: 100000,
    frequency: "weekly",
    collectionDay: "monday",
    startDate: "2026-06-01",
    dueDate: "2026-07-13",
    status: "late"
  }
];

export const payments: Payment[] = [
  {
    id: "pay-001",
    userId: demoUserId,
    creditId: "CR-000124",
    clientName: "Juan Lopez",
    amount: 500000,
    method: "cash",
    paidAt: "2026-07-25"
  },
  {
    id: "pay-002",
    userId: demoUserId,
    creditId: "CR-000125",
    clientName: "Maria Gomez",
    amount: 230000,
    method: "transfer",
    paidAt: "2026-07-28"
  },
  {
    id: "pay-004",
    userId: demoUserId,
    creditId: "CR-000125",
    clientName: "Maria Gomez",
    amount: 115000,
    method: "transfer",
    paidAt: "2026-07-27"
  },
  {
    id: "pay-003",
    userId: demoUserId,
    creditId: "CR-000126",
    clientName: "Pedro Acosta",
    amount: 120000,
    method: "cash",
    paidAt: "2026-06-10"
  }
];

export function getPaidByCredit(creditId: string) {
  return payments
    .filter((payment) => payment.creditId === creditId)
    .reduce((total, payment) => total + payment.amount, 0);
}
