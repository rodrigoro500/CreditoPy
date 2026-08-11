import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDataStore } from "../../app/DataProvider";
import { Button } from "../../components/ui/Button";
import { todayInputValue } from "../../lib/date-utils";
import { formatCurrency } from "../../lib/format";
import { createId } from "../../lib/id";
import { addOnePeriod, getNextInstallment, getPaidInstallmentCount } from "../../lib/installments";
import { demoUserId } from "../../lib/mock-data";
import type { PaymentMethod, PaymentType } from "../../types/domain";

export function PaymentFormPage() {
  const navigate = useNavigate();
  const { credits, addPayment, addExtensionInterestPayment, getPaidByCredit, getInstallmentsByCredit } = useDataStore();
  const [creditId, setCreditId] = useState(credits[0]?.id ?? "");
  const [amount, setAmount] = useState(credits[0]?.installmentValue ?? 0);
  const [paidAt, setPaidAt] = useState(todayInputValue());
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [paymentType, setPaymentType] = useState<PaymentType>("installment");
  const [search, setSearch] = useState("");

  const credit = useMemo(() => credits.find((item) => item.id === creditId) ?? credits[0], [credits, creditId]);
  const filteredCredits = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return credits;

    return credits.filter((item) =>
      [item.clientName, item.productName, item.id].filter(Boolean).some((value) => value!.toLowerCase().includes(query))
    );
  }, [credits, search]);
  const balance = credit ? credit.totalAmount - getPaidByCredit(credit.id) : 0;
  const paid = credit ? getPaidByCredit(credit.id) : 0;
  const installments = credit ? getInstallmentsByCredit(credit.id) : [];
  const paidInstallmentCount = credit ? getPaidInstallmentCount(credit, paid) : 0;
  const nextInstallment = credit ? getNextInstallment(installments, paidInstallmentCount) : undefined;

  useEffect(() => {
    if (!creditId && credits[0]) {
      handleCreditChange(credits[0].id);
    }
  }, [creditId, credits]);

  useEffect(() => {
    if (!filteredCredits.length) return;
    if (!filteredCredits.some((item) => item.id === creditId)) {
      handleCreditChange(filteredCredits[0].id);
    }
  }, [creditId, filteredCredits]);

  function handleCreditChange(nextCreditId: string) {
    const nextCredit = credits.find((item) => item.id === nextCreditId);
    setCreditId(nextCreditId);
    setAmount(nextCredit?.installmentValue ?? 0);
    setPaymentType("installment");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!credit || amount <= 0) return;

    const payment = {
      id: createId("pay"),
      userId: demoUserId,
      creditId: credit.id,
      installmentId: nextInstallment?.id,
      clientName: credit.clientName,
      amount,
      method,
      type: paymentType,
      paidAt,
      notes: paymentType === "extension_interest" ? "Interes de prorroga de cuota" : undefined
    };

    if (paymentType === "extension_interest") {
      await addExtensionInterestPayment(payment, nextInstallment?.number ?? paidInstallmentCount + 1);
    } else {
      await addPayment(payment);
    }

    navigate("/creditos");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Registrar pago</h1>
        <p className="text-slate-500">Carga rapida de fecha, monto y metodo de pago.</p>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft" onSubmit={handleSubmit}>
        {credit ? (
          <div className="mb-5 rounded-lg bg-brand-50 p-4">
            <p className="font-bold">{credit.clientName}</p>
            <p className="text-sm text-slate-600">Saldo pendiente: {formatCurrency(balance)}</p>
            <p className="text-sm text-slate-600">Cuota esperada: {formatCurrency(credit.installmentValue)}</p>
            {nextInstallment ? (
              <p className="text-sm text-slate-600">
                Proxima cuota: {nextInstallment.number}/{credit.installments} vence {nextInstallment.dueDate}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Buscar cliente</span>
            <input
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3"
              placeholder="Escribir nombre o apellido"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {search.trim() ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {filteredCredits.length ? (
                filteredCredits.slice(0, 8).map((item) => {
                  const itemPaid = getPaidByCredit(item.id);
                  const itemBalance = Math.max(0, item.totalAmount - itemPaid);
                  return (
                    <button
                      key={item.id}
                      className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-3 text-left last:border-b-0 ${
                        item.id === creditId ? "bg-brand-50" : "bg-white"
                      }`}
                      type="button"
                      onClick={() => {
                        handleCreditChange(item.id);
                        setSearch(getClientShortName(item.clientName));
                      }}
                    >
                      <span>
                        <span className="block font-bold text-ink">{getClientShortName(item.clientName)}</span>
                        <span className="block text-sm text-slate-500">
                          Cuota {formatCurrency(item.installmentValue)}
                        </span>
                      </span>
                      <span className="text-right text-sm font-semibold text-brand-700">
                        Saldo {formatCurrency(itemBalance)}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-sm text-slate-500">No se encontraron creditos con ese nombre.</div>
              )}
            </div>
          ) : null}

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Tipo de registro</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className={`flex min-h-12 items-center justify-center rounded-md border px-3 text-center text-sm font-semibold ${paymentType === "installment" ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"}`}>
                <input className="sr-only" name="paymentType" type="radio" checked={paymentType === "installment"} onChange={() => setPaymentType("installment")} />
                Pago de cuota
              </label>
              <label className={`flex min-h-12 items-center justify-center rounded-md border px-3 text-center text-sm font-semibold ${paymentType === "extension_interest" ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"}`}>
                <input className="sr-only" name="paymentType" type="radio" checked={paymentType === "extension_interest"} onChange={() => setPaymentType("extension_interest")} />
                Interes para prorrogar
              </label>
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Credito</span>
            <select className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3" value={creditId} onChange={(event) => handleCreditChange(event.target.value)}>
              {credits.map((item) => (
                <option key={item.id} value={item.id}>{getClientShortName(item.clientName)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Monto recibido</span>
            <input className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Fecha de pago</span>
            <input className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3" type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
          </label>
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Metodo</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className={`flex h-11 items-center justify-center rounded-md border font-semibold ${method === "cash" ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"}`}>
                <input className="sr-only" name="method" type="radio" checked={method === "cash"} onChange={() => setMethod("cash")} />
                Efectivo
              </label>
              <label className={`flex h-11 items-center justify-center rounded-md border font-semibold ${method === "transfer" ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600"}`}>
                <input className="sr-only" name="method" type="radio" checked={method === "transfer"} onChange={() => setMethod("transfer")} />
                Transferencia
              </label>
            </div>
          </fieldset>

          {paymentType === "extension_interest" && credit && nextInstallment ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-bold">Vista previa de prorroga</p>
              <p className="mt-1">
                La cuota {nextInstallment.number}/{credit.installments} pasara de {nextInstallment.dueDate} a{" "}
                {addOnePeriod(nextInstallment.dueDate, credit.frequency)}.
              </p>
              <p className="mt-1">
                Las cuotas siguientes tambien se moveran un periodo. Este pago no descuenta el saldo principal.
              </p>
            </div>
          ) : null}
        </div>

        <Button className="mt-5 w-full" type="submit" disabled={!credits.length}>
          {paymentType === "extension_interest" ? "Registrar interes y prorrogar" : "Registrar pago"}
        </Button>
      </form>
    </div>
  );
}

function getClientShortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).join(" ") || fullName;
}
