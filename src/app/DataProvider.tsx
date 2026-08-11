import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../features/auth/AuthProvider";
import { clients as initialClients, credits as initialCredits, payments as initialPayments } from "../lib/mock-data";
import { supabase } from "../lib/supabase";
import { generateInstallments, getFinalDueDate, postponeInstallmentsFrom } from "../lib/installments";
import type { Client, Credit, Installment, Payment } from "../types/domain";

interface DataState {
  clients: Client[];
  credits: Credit[];
  payments: Payment[];
  installments: Installment[];
}

interface DataContextValue extends DataState {
  loading: boolean;
  error: string;
  isDemoMode: boolean;
  addClient: (client: Client) => Promise<void>;
  addCredit: (credit: Credit, customInstallments?: Installment[], initialPayment?: Payment) => Promise<void>;
  updateCredit: (credit: Credit, installments: Installment[]) => Promise<void>;
  addPayment: (payment: Payment) => Promise<void>;
  addExtensionInterestPayment: (payment: Payment, fromInstallmentNumber: number) => Promise<void>;
  getPaidByCredit: (creditId: string) => number;
  getInstallmentsByCredit: (creditId: string) => Installment[];
  resetDemoData: () => void;
  reloadData: () => Promise<void>;
}

const storageKey = "creditopy-local-data";

const defaultData: DataState = {
  clients: initialClients,
  credits: initialCredits,
  payments: initialPayments,
  installments: initialCredits.flatMap(generateInstallments)
};

const emptyData: DataState = {
  clients: [],
  credits: [],
  payments: [],
  installments: []
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [data, setData] = useState<DataState>(() => {
    if (supabase) return emptyData;

    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return defaultData;

    const parsed = JSON.parse(saved) as Partial<DataState>;
    const credits = parsed.credits ?? initialCredits;

    return {
      clients: parsed.clients ?? initialClients,
      credits,
      payments: parsed.payments ?? initialPayments,
      installments: parsed.installments?.length ? parsed.installments : credits.flatMap(generateInstallments)
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shouldUseSupabase = Boolean(supabase && user && profile?.approval_status === "approved");

  function persistLocal(nextData: DataState) {
    setData(nextData);
    window.localStorage.setItem(storageKey, JSON.stringify(nextData));
  }

  async function reloadData() {
    if (!shouldUseSupabase || !supabase || !user) return;

    if (profile?.role === "admin") {
      setData(emptyData);
      return;
    }

    setLoading(true);
    setError("");

    const [clientsResult, creditsResult, paymentsResult, installmentsResult] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("credits").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("installments").select("*").order("number", { ascending: true })
    ]);

    const firstError =
      clientsResult.error || creditsResult.error || paymentsResult.error || installmentsResult.error;

    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    const mappedClients = (clientsResult.data ?? []).map(mapClientFromDb);
    const mappedCredits = (creditsResult.data ?? []).map((row) => {
      const credit = mapCreditFromDb(row);
      const client = mappedClients.find((item) => item.id === credit.clientId);
      return { ...credit, clientName: client?.fullName ?? credit.clientName };
    });

    setData({
      clients: mappedClients,
      credits: mappedCredits,
      payments: (paymentsResult.data ?? []).map(mapPaymentFromDb),
      installments: (installmentsResult.data ?? []).map(mapInstallmentFromDb)
    });
    setLoading(false);
  }

  useEffect(() => {
    if (shouldUseSupabase) {
      setData(emptyData);
      reloadData();
    }
  }, [shouldUseSupabase, user?.id, profile?.role]);

  const value = useMemo<DataContextValue>(
    () => ({
      ...data,
      loading,
      error,
      isDemoMode: !shouldUseSupabase,
      addClient: async (client) => {
        if (shouldUseSupabase && supabase && user) {
          const { data: inserted, error: insertError } = await supabase
            .from("clients")
            .insert({
              user_id: user.id,
              full_name: client.fullName,
              document_number: client.documentNumber ?? null,
              phone: client.phone,
              address: client.address ?? null,
              city: client.city ?? null,
              notes: client.notes ?? null
            })
            .select("*")
            .single();

          if (insertError) throw insertError;
          setData((current) => ({ ...current, clients: [mapClientFromDb(inserted), ...current.clients] }));
          return;
        }

        persistLocal({ ...data, clients: [client, ...data.clients] });
      },
      addCredit: async (credit, customInstallments, initialPayment) => {
        if (shouldUseSupabase && supabase && user) {
          const { data: insertedCredit, error: creditError } = await supabase
            .from("credits")
            .insert({
              user_id: user.id,
              client_id: credit.clientId,
              type: credit.type,
              product_name: credit.productName ?? null,
              product_description: credit.productDescription ?? null,
              amount: credit.amount,
              interest_percent: credit.interestPercent,
              interest_amount: credit.interestAmount,
              total_amount: credit.totalAmount,
              installments: credit.installments,
              installment_value: credit.installmentValue,
              frequency: credit.frequency,
              collection_day: credit.collectionDay ?? null,
              start_date: credit.startDate,
              due_date: credit.dueDate,
              status: credit.status
            })
            .select("*")
            .single();

          if (creditError) throw creditError;

          const savedCredit = { ...mapCreditFromDb(insertedCredit), clientName: credit.clientName };
          const generated = (customInstallments ?? generateInstallments({ ...savedCredit, userId: user.id })).map(
            (installment) => ({
              ...installment,
              userId: user.id,
              creditId: savedCredit.id,
              id: `${savedCredit.id}-quota-${installment.number}`
            })
          );

          const { data: insertedInstallments, error: installmentsError } = await supabase
            .from("installments")
            .insert(
              generated.map((installment) => ({
                user_id: user.id,
                credit_id: savedCredit.id,
                number: installment.number,
                amount: installment.amount,
                due_date: installment.dueDate,
                status: installment.status
              }))
            )
            .select("*");

          if (installmentsError) throw installmentsError;

          let insertedInitialPayment: Payment | null = null;
          if (initialPayment && initialPayment.amount > 0) {
            const { data: insertedPayment, error: paymentError } = await supabase
              .from("payments")
              .insert({
                user_id: user.id,
                credit_id: savedCredit.id,
                installment_id: null,
                amount: initialPayment.amount,
                method: initialPayment.method,
                type: "installment",
                paid_at: initialPayment.paidAt,
                notes: initialPayment.notes ?? "Pago inicial cargado por credito existente"
              })
              .select("*")
              .single();

            if (paymentError) throw paymentError;
            insertedInitialPayment = mapPaymentFromDb(insertedPayment);
          }

          setData((current) => ({
            ...current,
            credits: [savedCredit, ...current.credits],
            installments: [...(insertedInstallments ?? []).map(mapInstallmentFromDb), ...current.installments],
            payments: insertedInitialPayment ? [insertedInitialPayment, ...current.payments] : current.payments
          }));
          return;
        }

        persistLocal({
          ...data,
          credits: [credit, ...data.credits],
          installments: [...(customInstallments ?? generateInstallments(credit)), ...data.installments],
          payments: initialPayment ? [initialPayment, ...data.payments] : data.payments
        });
      },
      updateCredit: async (credit, installments) => {
        if (shouldUseSupabase && supabase && user) {
          const { data: updatedCredit, error: creditError } = await supabase
            .from("credits")
            .update({
              client_id: credit.clientId,
              type: credit.type,
              product_name: credit.productName ?? null,
              product_description: credit.productDescription ?? null,
              amount: credit.amount,
              interest_percent: credit.interestPercent,
              interest_amount: credit.interestAmount,
              total_amount: credit.totalAmount,
              installments: credit.installments,
              installment_value: credit.installmentValue,
              frequency: credit.frequency,
              collection_day: credit.collectionDay ?? null,
              start_date: credit.startDate,
              due_date: credit.dueDate,
              status: credit.status
            })
            .eq("id", credit.id)
            .select("*")
            .single();

          if (creditError) throw creditError;

          const normalizedInstallments = installments.map((installment) => ({
            ...installment,
            userId: user.id,
            creditId: credit.id,
            id: `${credit.id}-quota-${installment.number}`
          }));

          const { data: upsertedInstallments, error: installmentsError } = await supabase
            .from("installments")
            .upsert(
              normalizedInstallments.map((installment) => ({
                id: installment.id,
                user_id: user.id,
                credit_id: credit.id,
                number: installment.number,
                amount: installment.amount,
                due_date: installment.dueDate,
                status: installment.status
              })),
              { onConflict: "id" }
            )
            .select("*");

          if (installmentsError) throw installmentsError;

          setData((current) => {
            const nextCredit = {
              ...mapCreditFromDb(updatedCredit),
              clientName: credit.clientName
            };
            const otherInstallments = current.installments.filter((item) => item.creditId !== credit.id);

            return {
              ...current,
              credits: current.credits.map((item) => (item.id === credit.id ? nextCredit : item)),
              installments: [...(upsertedInstallments ?? []).map(mapInstallmentFromDb), ...otherInstallments]
            };
          });
          return;
        }

        persistLocal({
          ...data,
          credits: data.credits.map((item) => (item.id === credit.id ? credit : item)),
          installments: [...installments, ...data.installments.filter((item) => item.creditId !== credit.id)]
        });
      },
      addPayment: async (payment) => {
        if (shouldUseSupabase && supabase && user) {
          const { data: inserted, error: insertError } = await supabase
            .from("payments")
            .insert({
              user_id: user.id,
              credit_id: payment.creditId,
              installment_id: payment.installmentId ?? null,
              amount: payment.amount,
              method: payment.method,
              type: payment.type ?? "installment",
              paid_at: payment.paidAt,
              notes: payment.notes ?? null
            })
            .select("*")
            .single();

          if (insertError) throw insertError;
          setData((current) => ({ ...current, payments: [mapPaymentFromDb(inserted), ...current.payments] }));
          return;
        }

        persistLocal({ ...data, payments: [payment, ...data.payments] });
      },
      addExtensionInterestPayment: async (payment, fromInstallmentNumber) => {
        const credit = data.credits.find((item) => item.id === payment.creditId);
        if (!credit) return;

        const nextInstallments = postponeInstallmentsFrom(data.installments, credit, fromInstallmentNumber);
        const creditInstallments = nextInstallments.filter((installment) => installment.creditId === credit.id);
        const nextDueDate = getFinalDueDate(creditInstallments) || credit.dueDate;
        const nextCredits = data.credits.map((item) =>
          item.id === credit.id ? { ...item, dueDate: nextDueDate } : item
        );

        if (shouldUseSupabase && supabase && user) {
          const db = supabase;
          const postponedForCredit = nextInstallments.filter(
            (installment) => installment.creditId === credit.id && installment.number >= fromInstallmentNumber
          );

          const { data: insertedPayment, error: paymentError } = await db
            .from("payments")
            .insert({
              user_id: user.id,
              credit_id: payment.creditId,
              installment_id: payment.installmentId ?? null,
              amount: payment.amount,
              method: payment.method,
              type: "extension_interest",
              paid_at: payment.paidAt,
              notes: payment.notes ?? "Interes de prorroga de cuota"
            })
            .select("*")
            .single();

          if (paymentError) throw paymentError;

          await Promise.all(
            postponedForCredit.map((installment) =>
              db.from("installments").update({ due_date: installment.dueDate, status: "pending" }).eq("id", installment.id)
            )
          );

          const { error: creditError } = await db
            .from("credits")
            .update({ due_date: nextDueDate })
            .eq("id", credit.id);

          if (creditError) throw creditError;

          setData({
            ...data,
            credits: nextCredits,
            installments: nextInstallments,
            payments: [mapPaymentFromDb(insertedPayment), ...data.payments]
          });
          return;
        }

        persistLocal({
          ...data,
          credits: nextCredits,
          installments: nextInstallments,
          payments: [{ ...payment, type: "extension_interest" }, ...data.payments]
        });
      },
      getPaidByCredit: (creditId) =>
        data.payments
          .filter((payment) => payment.creditId === creditId && (payment.type ?? "installment") === "installment")
          .reduce((total, payment) => total + payment.amount, 0),
      getInstallmentsByCredit: (creditId) =>
        data.installments
          .filter((installment) => {
            const credit = data.credits.find((item) => item.id === creditId);
            return installment.creditId === creditId && (!credit || installment.number <= credit.installments);
          })
          .sort((a, b) => a.number - b.number),
      resetDemoData: () => {
        if (!shouldUseSupabase) persistLocal(defaultData);
      },
      reloadData
    }),
    [data, error, loading, shouldUseSupabase, user?.id]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataStore() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useDataStore debe usarse dentro de DataProvider");
  }

  return context;
}

function mapClientFromDb(row: any): Client {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    documentNumber: row.document_number ?? undefined,
    phone: row.phone,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at?.slice(0, 10) ?? ""
  };
}

function mapCreditFromDb(row: any): Credit {
  return {
    id: row.id,
    userId: row.user_id,
    clientId: row.client_id,
    clientName: row.client_name ?? "",
    type: row.type,
    productName: row.product_name ?? undefined,
    productDescription: row.product_description ?? undefined,
    amount: Number(row.amount),
    interestPercent: Number(row.interest_percent),
    interestAmount: Number(row.interest_amount),
    totalAmount: Number(row.total_amount),
    installments: Number(row.installments),
    installmentValue: Number(row.installment_value),
    frequency: row.frequency,
    collectionDay: row.collection_day ?? undefined,
    startDate: row.start_date,
    dueDate: row.due_date,
    status: row.status
  };
}

function mapPaymentFromDb(row: any): Payment {
  return {
    id: row.id,
    userId: row.user_id,
    creditId: row.credit_id,
    installmentId: row.installment_id ?? undefined,
    clientName: row.client_name ?? "",
    amount: Number(row.amount),
    method: row.method,
    type: row.type,
    paidAt: row.paid_at,
    notes: row.notes ?? undefined
  };
}

function mapInstallmentFromDb(row: any): Installment {
  return {
    id: row.id,
    userId: row.user_id,
    creditId: row.credit_id,
    number: Number(row.number),
    amount: Number(row.amount),
    dueDate: row.due_date,
    status: row.status
  };
}
