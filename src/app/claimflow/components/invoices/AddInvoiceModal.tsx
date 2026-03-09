"use client";

import { useEffect, useState } from "react";

type Authority = {
    authority_id: number;
    authority_name: string;
};

type AddInvoiceModalProps = {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
};

const INITIAL_FORM = {
    authorityId: "",
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    invoiceAmount: "",
};

export default function AddInvoiceModal({
                                            open,
                                            onClose,
                                            onSaved,
                                        }: AddInvoiceModalProps) {
    const [authorities, setAuthorities] = useState<Authority[]>([]);
    const [loadingAuthorities, setLoadingAuthorities] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState(INITIAL_FORM);

    useEffect(() => {
        if (!open) return;

        const controller = new AbortController();

        (async () => {
            setLoadingAuthorities(true);
            try {
                const res = await fetch("/claimflow/api/lookups", {
                    cache: "no-store",
                    signal: controller.signal,
                });
                const json = await res.json();
                setAuthorities(json.authorities ?? []);
            } catch {
                setError("Unable to load authorities.");
            } finally {
                setLoadingAuthorities(false);
            }
        })();

        return () => controller.abort();
    }, [open]);

    function update<K extends keyof typeof INITIAL_FORM>(
        key: K,
        value: (typeof INITIAL_FORM)[K]
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function resetAndClose() {
        setForm(INITIAL_FORM);
        setError("");
        onClose();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const res = await fetch("/claimflow/api/invoices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    authorityId: Number(form.authorityId),
                    invoiceNumber: form.invoiceNumber.trim(),
                    invoiceDate: form.invoiceDate,
                    dueDate: form.dueDate || null,
                    invoiceAmount: Number(form.invoiceAmount),
                    status: "ISSUED",
                }),
            });

            if (!res.ok) {
                const json = await res.json().catch(() => null);
                throw new Error(json?.error ?? "Failed to save invoice.");
            }

            onSaved();
            resetAndClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save invoice.");
        } finally {
            setSaving(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-slate-900">Add Invoice</h2>
                    <p className="text-sm text-slate-500">
                        Create a new invoice for an NHS authority.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Authority
                        </label>
                        <select
                            value={form.authorityId}
                            onChange={(e) => update("authorityId", e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-0 focus:border-emerald-500"
                            required
                            disabled={loadingAuthorities}
                        >
                            <option value="">
                                {loadingAuthorities ? "Loading authorities..." : "Select authority"}
                            </option>
                            {authorities.map((authority) => (
                                <option
                                    key={authority.authority_id}
                                    value={authority.authority_id}
                                >
                                    {authority.authority_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Invoice Number
                        </label>
                        <input
                            value={form.invoiceNumber}
                            onChange={(e) => update("invoiceNumber", e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="e.g. SPECS0008-001"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Invoice Date
                            </label>
                            <input
                                type="date"
                                value={form.invoiceDate}
                                onChange={(e) => update("invoiceDate", e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => update("dueDate", e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Amount (£)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.invoiceAmount}
                            onChange={(e) => update("invoiceAmount", e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            required
                        />
                    </div>

                    {error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={resetAndClose}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save Invoice"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}