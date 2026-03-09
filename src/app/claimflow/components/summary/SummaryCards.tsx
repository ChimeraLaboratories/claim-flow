"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/shared/ui/Card";
import { useTrackerStore } from "../../store/trackerStore";
import type { Invoice } from "../../types/tracker";
import {formatGBP} from "@/shared/utils/Format";

export default function SummaryCards() {
    const month = useTrackerStore((s) => s.month);
    const authorityId = useTrackerStore((s) => s.authorityId);
    const search = useTrackerStore((s) => s.search);

    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        (async () => {
            const qs = new URLSearchParams();
            qs.set("month", month);
            if (authorityId !== "All") qs.set("authorityId", authorityId);
            if (search) qs.set("q", search);

            const res = await fetch(`/claimflow/api/invoices?${qs.toString()}`, {
                cache: "no-store",
            });
            const json = await res.json();
            setInvoices(json.invoices ?? []);
        })();
    }, [month, authorityId, search]);

    const stats = useMemo(() => {
        const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.invoice_amount), 0);
        const received = invoices.reduce(
            (sum, i) => sum + (Number(i.invoice_amount) - Number(i.balance_remaining)),
            0
        );
        const outstanding = invoices.reduce(
            (sum, i) => sum + Number(i.balance_remaining),
            0
        );
        const overdue = invoices
            .filter((i) => i.status === "OVERDUE")
            .reduce((sum, i) => sum + Number(i.balance_remaining), 0);

        return { totalInvoiced, received, outstanding, overdue };
    }, [invoices]);

    const cards = [
        { label: "Total invoiced", value: stats.totalInvoiced },
        { label: "Payments received", value: stats.received },
        { label: "Outstanding", value: stats.outstanding },
        { label: "Overdue", value: stats.overdue },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.label} className="p-4">
                    <div className="text-xs font-medium text-slate-500">{card.label}</div>
                    <div className="mt-2 text-2xl font-semibold">
                        {formatGBP(card.value)}
                    </div>
                </Card>
            ))}
        </div>
    );
}