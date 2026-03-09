"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/shared/ui/Card";
import SectionTitle from "@/shared/ui/SectionTitle";
import InvoiceRow from "./InvoiceRow";
import { useTrackerStore } from "../../store/trackerStore";
import type { Invoice } from "../../types/tracker";

export default function InvoiceTable() {
    const month = useTrackerStore((s) => s.month);
    const authorityId = useTrackerStore((s) => s.authorityId);
    const search = useTrackerStore((s) => s.search);
    const statuses = useTrackerStore((s) => s.statuses);

    const [rows, setRows] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            setLoading(true);
            try {
                const qs = new URLSearchParams();
                qs.set("month", month);
                if (authorityId !== "All") qs.set("authorityId", authorityId);
                if (search) qs.set("q", search);

                const res = await fetch(`/claimflow/api/invoices?${qs.toString()}`, {
                    cache: "no-store",
                    signal: controller.signal,
                });
                const json = await res.json();
                setRows(json.invoices ?? []);
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [month, authorityId, search]);

    const filteredRows = useMemo(
        () => rows.filter((row) => statuses[row.status]),
        [rows, statuses]
    );

    return (
        <Card>
            <SectionTitle
                title="Invoice ledger"
                right={<span>{loading ? "Loading…" : `${filteredRows.length} shown`}</span>}
            />

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3">Authority</th>
                        <th className="px-4 py-3">Invoice date</th>
                        <th className="px-4 py-3">Due date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Balance</th>
                        <th className="px-4 py-3">Status</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredRows.map((invoice) => (
                        <InvoiceRow key={invoice.invoice_id} invoice={invoice} />
                    ))}
                    </tbody>
                </table>

                {!loading && filteredRows.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-slate-500">
                        No invoices match the current filters.
                    </div>
                ) : null}
            </div>
        </Card>
    );
}