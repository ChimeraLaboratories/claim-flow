"use client";

import { useEffect, useMemo, useState } from "react";

import type { Invoice, Payment } from "../../types/tracker";

type MatchPaymentModalProps = {
    open: boolean;
    payment: Payment | null;
    month: string;
    onClose: () => void;
    onSaved: () => void;
};

export default function MatchPaymentModal({
                                              open,
                                              payment,
                                              month,
                                              onClose,
                                              onSaved,
                                          }: MatchPaymentModalProps) {
    const [rows, setRows] = useState<Invoice[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !payment) return;

        const controller = new AbortController();

        (async () => {
            setLoading(true);
            setError("");
            setSelectedIds([]);

            try {
                const qs = new URLSearchParams();
                qs.set("month", month);
                if (payment.authority_id) {
                    qs.set("authorityId", String(payment.authority_id));
                }

                const res = await fetch(`/claimflow/api/invoices?${qs.toString()}`, {
                    cache: "no-store",
                    signal: controller.signal,
                });
                const json = await res.json();

                const candidateInvoices = (json.invoices ?? []).filter(
                    (invoice: Invoice) => Number(invoice.balance_remaining) > 0
                );

                setRows(candidateInvoices);
            } catch {
                setError("Unable to load candidate invoices.");
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [open, payment, month]);

    const selectedInvoices = useMemo(
        () => rows.filter((row) => selectedIds.includes(row.invoice_id)),
        [rows, selectedIds]
    );

    const selectedBalanceTotal = useMemo(
        () =>
            selectedInvoices.reduce(
                (sum, row) => sum + Number(row.balance_remaining ?? 0),
                0
            ),
        [selectedInvoices]
    );

    function toggleInvoice(invoiceId: number) {
        setSelectedIds((prev) =>
            prev.includes(invoiceId)
                ? prev.filter((id) => id !== invoiceId)
                : [...prev, invoiceId]
        );
    }

    async function handleMatch() {
        if (!payment || selectedIds.length === 0) {
            setError("Select at least one invoice to match.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const res = await fetch("/claimflow/api/match-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    paymentId: payment.payment_id,
                    invoiceIds: selectedIds,
                }),
            });

            if (!res.ok) {
                const json = await res.json().catch(() => null);
                throw new Error(json?.error ?? "Failed to match payment.");
            }

            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to match payment.");
        } finally {
            setSaving(false);
        }
    }

    if (!open || !payment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Match Payment
                        </h2>
                        <p className="text-sm text-slate-500">
                            Select one or more invoices to reconcile against this payment.
                        </p>
                    </div>
                </div>

                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                            <span className="font-medium text-slate-700">Reference:</span>{" "}
                            <span className="text-slate-900">{payment.payment_reference}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-700">Amount:</span>{" "}
                            <span className="text-slate-900">
                £{Number(payment.payment_amount).toFixed(2)}
              </span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-700">Authority:</span>{" "}
                            <span className="text-slate-900">
                {payment.authority_name ?? "Unknown"}
              </span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-700">Unmatched:</span>{" "}
                            <span className="text-slate-900">
                £{Number(payment.unmatched_amount).toFixed(2)}
              </span>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between text-sm">
                    <div className="text-slate-600">
                        {loading
                            ? "Loading invoices..."
                            : `${rows.length} candidate invoice${rows.length === 1 ? "" : "s"}`}
                    </div>
                    <div className="text-slate-600">
                        Selected balance total: £{selectedBalanceTotal.toFixed(2)}
                    </div>
                </div>

                <div className="max-h-96 overflow-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-left text-slate-600">
                        <tr>
                            <th className="px-4 py-3">Select</th>
                            <th className="px-4 py-3">Invoice</th>
                            <th className="px-4 py-3">Authority</th>
                            <th className="px-4 py-3">Invoice Date</th>
                            <th className="px-4 py-3">Balance</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                        {rows.map((invoice) => (
                            <tr key={invoice.invoice_id}>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(invoice.invoice_id)}
                                        onChange={() => toggleInvoice(invoice.invoice_id)}
                                    />
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-900">
                                    {invoice.invoice_number}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {invoice.authority_name}
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {invoice.invoice_date}
                                </td>
                                <td className="px-4 py-3 text-slate-900">
                                    £{Number(invoice.balance_remaining).toFixed(2)}
                                </td>
                            </tr>
                        ))}

                        {!loading && rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-8 text-center text-slate-500"
                                >
                                    No unpaid invoices found for this filter set.
                                </td>
                            </tr>
                        ) : null}
                        </tbody>
                    </table>
                </div>

                {error ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="mt-5 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleMatch}
                        disabled={saving || selectedIds.length === 0}
                        className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Matching..." : "Match Selected"}
                    </button>
                </div>
            </div>
        </div>
    );
}