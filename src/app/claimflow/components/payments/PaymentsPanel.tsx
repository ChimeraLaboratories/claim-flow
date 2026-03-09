"use client";

import { useEffect, useState } from "react";

import Card from "@/shared/ui/Card";
import SectionTitle from "@/shared/ui/SectionTitle";
import PaymentRow from "./PaymentRow";

import { useTrackerStore } from "../../store/trackerStore";
import type { Payment } from "../../types/tracker";

type PaymentsPanelProps = {
    refreshKey?: number;
    onMatchPayment: (payment: Payment) => void;
};

export default function PaymentsPanel({
                                          refreshKey = 0,
                                          onMatchPayment,
                                      }: PaymentsPanelProps) {
    const month = useTrackerStore((s) => s.month);
    const authorityId = useTrackerStore((s) => s.authorityId);

    const [rows, setRows] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            setLoading(true);
            try {
                const qs = new URLSearchParams();
                qs.set("month", month);
                if (authorityId !== "All") qs.set("authorityId", authorityId);

                const res = await fetch(`/claimflow/api/payments?${qs.toString()}`, {
                    cache: "no-store",
                    signal: controller.signal,
                });
                const json = await res.json();
                setRows(json.payments ?? []);
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [month, authorityId, refreshKey]);

    return (
        <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
                <SectionTitle
                    title="Payments"
                    right={
                        <span className="text-sm text-slate-500">
              {loading ? "Loading…" : `${rows.length} total`}
            </span>
                    }
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Authority</th>
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Unmatched</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3"></th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">
                    {rows.map((payment) => (
                        <PaymentRow
                            key={payment.payment_id}
                            payment={payment}
                            onMatch={() => onMatchPayment(payment)}
                        />
                    ))}

                    {!loading && rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-4 py-8 text-center text-slate-500"
                            >
                                No payments found for the current filters.
                            </td>
                        </tr>
                    ) : null}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}