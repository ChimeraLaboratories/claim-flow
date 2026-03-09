"use client";

import { useEffect, useMemo, useState } from "react";

import Card from "@/shared/ui/Card";
import { formatGBP } from "@/shared/utils/Format";
import { useTrackerStore } from "../../store/trackerStore";
import type { Invoice } from "../../types/tracker";

type SummaryToneKey = "invoiced" | "received" | "outstanding" | "overdue";

type SummaryCardTone = {
    cardClassName: string;
    accentClassName: string;
    iconWrapClassName: string;
    iconClassName: string;
    labelClassName: string;
    valueClassName: string;
    subtextClassName: string;
};

const tones: Record<SummaryToneKey, SummaryCardTone> = {
    invoiced: {
        cardClassName: "border-slate-200 bg-slate-50/80",
        accentClassName: "bg-slate-500",
        iconWrapClassName: "bg-slate-100",
        iconClassName: "text-slate-700",
        labelClassName: "text-slate-600",
        valueClassName: "text-slate-950",
        subtextClassName: "text-slate-500",
    },
    received: {
        cardClassName: "border-sky-200 bg-sky-50/80",
        accentClassName: "bg-sky-500",
        iconWrapClassName: "bg-sky-100",
        iconClassName: "text-sky-700",
        labelClassName: "text-sky-700",
        valueClassName: "text-slate-950",
        subtextClassName: "text-slate-500",
    },
    outstanding: {
        cardClassName: "border-amber-200 bg-amber-50/80",
        accentClassName: "bg-amber-500",
        iconWrapClassName: "bg-amber-100",
        iconClassName: "text-amber-700",
        labelClassName: "text-amber-700",
        valueClassName: "text-slate-950",
        subtextClassName: "text-slate-500",
    },
    overdue: {
        cardClassName: "border-rose-200 bg-rose-50/70",
        accentClassName: "bg-rose-500",
        iconWrapClassName: "bg-rose-100",
        iconClassName: "text-rose-700",
        labelClassName: "text-rose-700",
        valueClassName: "text-slate-950",
        subtextClassName: "text-slate-500",
    },
};

type SummaryCardConfig = {
    key: SummaryToneKey;
    label: string;
    value: number;
    helper: string;
    icon: string;
};

export default function SummaryCards() {
    const month = useTrackerStore((s) => s.month);
    const authorityId = useTrackerStore((s) => s.authorityId);
    const search = useTrackerStore((s) => s.search);

    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            const qs = new URLSearchParams();
            qs.set("month", month);

            if (authorityId !== "All") qs.set("authorityId", authorityId);
            if (search) qs.set("q", search);

            const res = await fetch(`/claimflow/api/invoices?${qs.toString()}`, {
                cache: "no-store",
                signal: controller.signal,
            });

            const json = await res.json();
            setInvoices(json.invoices ?? []);
        })();

        return () => controller.abort();
    }, [month, authorityId, search]);

    const stats = useMemo(() => {
        const totalInvoiced = invoices.reduce(
            (sum, invoice) => sum + Number(invoice.invoice_amount ?? 0),
            0
        );

        const received = invoices.reduce(
            (sum, invoice) =>
                sum +
                (Number(invoice.invoice_amount ?? 0) -
                    Number(invoice.balance_remaining ?? 0)),
            0
        );

        const outstanding = invoices.reduce(
            (sum, invoice) => sum + Number(invoice.balance_remaining ?? 0),
            0
        );

        const overdue = invoices
            .filter((invoice) => invoice.status === "OVERDUE")
            .reduce(
                (sum, invoice) => sum + Number(invoice.balance_remaining ?? 0),
                0
            );

        return {
            totalInvoiced,
            received,
            outstanding,
            overdue,
        };
    }, [invoices]);

    const cards: SummaryCardConfig[] = [
        {
            key: "invoiced",
            label: "Total invoiced",
            value: stats.totalInvoiced,
            helper: "Value raised this period",
            icon: "🧾",
        },
        {
            key: "received",
            label: "Payments received",
            value: stats.received,
            helper: "Matched against invoices",
            icon: "💳",
        },
        {
            key: "outstanding",
            label: "Outstanding",
            value: stats.outstanding,
            helper: "Still awaiting payment",
            icon: "⏳",
        },
        {
            key: "overdue",
            label: "Overdue",
            value: stats.overdue,
            helper: "Past due and unpaid",
            icon: "⚠️",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const tone = tones[card.key];

                return (
                    <Card
                        key={card.key}
                        className={`relative overflow-hidden border shadow-sm ${tone.cardClassName}`}
                    >
                        <div
                            className={`absolute left-0 top-0 h-full w-1.5 ${tone.accentClassName}`}
                        />

                        <div className="px-5 py-4">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <p className={`text-sm font-medium ${tone.labelClassName}`}>
                                        {card.label}
                                    </p>
                                    <p className={`mt-1 text-xs ${tone.subtextClassName}`}>
                                        {card.helper}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${tone.iconWrapClassName} ${tone.iconClassName}`}
                                    aria-hidden="true"
                                >
                                    {card.icon}
                                </div>
                            </div>

                            <p className={`text-2xl font-semibold tracking-tight ${tone.valueClassName}`}>
                                {formatGBP(card.value)}
                            </p>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}