"use client";

import { useEffect, useState } from "react";
import Card from "@/shared/ui/Card";
import SectionTitle from "@/shared/ui/SectionTitle";
import PaymentRow from "./PaymentRow";
import { useTrackerStore } from "../../store/trackerStore";
import type { Payment } from "../../types/tracker";

export default function PaymentsPanel() {
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
    }, [month, authorityId]);

    return (
        <Card>
            <SectionTitle
                title="Payments received"
                right={<span>{loading ? "Loading…" : `${rows.length} total`}</span>}
            />

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Authority</th>
                        <th className="px-4 py-3">Reference</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Unmatched</th>
                        <th className="px-4 py-3">Status</th>
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((payment) => (
                        <PaymentRow key={payment.payment_id} payment={payment} />
                    ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}