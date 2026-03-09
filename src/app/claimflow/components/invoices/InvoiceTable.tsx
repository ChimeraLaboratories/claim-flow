"use client";

import { useEffect, useMemo, useState } from "react";

import Card from "@/shared/ui/Card";
import SectionTitle from "@/shared/ui/SectionTitle";
import InvoiceRow from "./InvoiceRow";

import { useTrackerStore } from "../../store/trackerStore";
import type { Invoice } from "../../types/tracker";

type InvoiceTableProps = {
    refreshKey?: number;
};

export default function InvoiceTable({
                                         refreshKey = 0,
                                     }: InvoiceTableProps) {
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
    }, [month, authorityId, search, refreshKey]);

    const filteredRows = useMemo(
        () => rows.filter((row) => statuses[row.status]),
        [rows, statuses]
    );

    return (
        <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
                <SectionTitle
                    title="Invoices"
                    right={
                        <span className="text-sm text-slate-500">
              {loading ? "Loading…" : `${filteredRows.length} shown`}
            </span>
                    }
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-slate-600">
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

                    <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredRows.map((invoice) => (
                        <InvoiceRow key={invoice.invoice_id} invoice={invoice} />
                    ))}

                    {!loading && filteredRows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-4 py-8 text-center text-slate-500"
                            >
                                No invoices match the current filters.
                            </td>
                        </tr>
                    ) : null}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}