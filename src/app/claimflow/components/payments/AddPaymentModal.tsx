"use client";

import { useEffect, useState } from "react";

type Authority = {
    authority_id: number;
    authority_name: string;
};

type AddPaymentModalProps = {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
};

const INITIAL_FORM = {
    authorityId: "",
    paymentDate: "",
    paymentReference: "",
    paymentAmount: "",
};

export default function AddPaymentModal({
                                            open,
                                            onClose,
                                            onSaved,
                                        }: AddPaymentModalProps) {
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
            const res = await fetch("/claimflow/api/payments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    authorityId: form.authorityId ? Number(form.authorityId) : null,
                    paymentDate: form.paymentDate,
                    paymentReference: form.paymentReference.trim(),
                    paymentAmount: Number(form.paymentAmount),
                }),
            });

            if (!res.ok) {
                const json = await res.json().catch(() => null);
                throw new Error(json?.error ?? "Failed to save payment.");
            }

            onSaved();
            resetAndClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save payment.");
        } finally {
            setSaving(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-slate-900">Add Payment</h2>
                    <p className="text-sm text-slate-500">
                        Log an incoming NHS payment or remittance.
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
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={loadingAuthorities}
                        >
                            <option value="">
                                {loadingAuthorities ? "Loading authorities..." : "Unknown / not set"}
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
                            Bank Reference
                        </label>
                        <input
                            value={form.paymentReference}
                            onChange={(e) => update("paymentReference", e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            placeholder="e.g. NWAFT REMIT MAR26"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Payment Date
                            </label>
                            <input
                                type="date"
                                value={form.paymentDate}
                                onChange={(e) => update("paymentDate", e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Amount (£)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.paymentAmount}
                                onChange={(e) => update("paymentAmount", e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                required
                            />
                        </div>
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
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}