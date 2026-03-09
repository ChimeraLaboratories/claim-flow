"use client";

import { useEffect, useState } from "react";
import Card from "@/shared/ui/Card";
import SectionTitle from "@/shared/ui/SectionTitle";
import Select from "@/shared/ui/Select";
import Input from "@/shared/ui/Input";
import { useTrackerStore } from "../../store/trackerStore";
import type { InvoiceStatus } from "../../types/tracker";

type AuthorityLookup = {
    authority_id: number;
    authority_name: string;
};

const statusLabels: Record<InvoiceStatus, string> = {
    DRAFT: "Draft",
    ISSUED: "Issued",
    PART_PAID: "Part paid",
    PAID: "Paid",
    OVERDUE: "Overdue",
    CANCELLED: "Cancelled",
};

export default function FiltersPanel() {
    const month = useTrackerStore((s) => s.month);
    const authorityId = useTrackerStore((s) => s.authorityId);
    const search = useTrackerStore((s) => s.search);
    const statuses = useTrackerStore((s) => s.statuses);

    const setMonth = useTrackerStore((s) => s.setMonth);
    const setAuthorityId = useTrackerStore((s) => s.setAuthorityId);
    const setSearch = useTrackerStore((s) => s.setSearch);
    const toggleStatus = useTrackerStore((s) => s.toggleStatus);
    const reset = useTrackerStore((s) => s.reset);

    const [authorities, setAuthorities] = useState<AuthorityLookup[]>([]);

    useEffect(() => {
        (async () => {
            const res = await fetch("/claimflow/api/lookups", { cache: "no-store" });
            const json = await res.json();
            setAuthorities(json.authorities ?? []);
        })();
    }, []);

    return (
        <Card>
            <SectionTitle
                title="Filters"
                right={
                    <button
                        onClick={reset}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        Reset
                    </button>
                }
            />

            <div className="space-y-4 p-4">
                <div>
                    <div className="mb-2 text-xs font-semibold text-slate-500">Month</div>
                    <Select
                        value={month}
                        onChange={setMonth}
                        options={[
                            { value: "2026-03", label: "March 2026" },
                            { value: "2026-02", label: "February 2026" },
                            { value: "2026-01", label: "January 2026" },
                        ]}
                    />
                </div>

                <div>
                    <div className="mb-2 text-xs font-semibold text-slate-500">
                        Authority
                    </div>
                    <Select
                        value={authorityId}
                        onChange={setAuthorityId}
                        options={[
                            { value: "All", label: "All authorities" },
                            ...authorities.map((a) => ({
                                value: String(a.authority_id),
                                label: a.authority_name,
                            })),
                        ]}
                    />
                </div>

                <div>
                    <div className="mb-2 text-xs font-semibold text-slate-500">Search</div>
                    <Input
                        value={search}
                        onChange={setSearch}
                        placeholder="Invoice number or payment reference"
                    />
                </div>

                <div>
                    <div className="mb-2 text-xs font-semibold text-slate-500">Status</div>
                    <div className="space-y-2">
                        {(Object.keys(statusLabels) as InvoiceStatus[]).map((status) => (
                            <label key={status} className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={statuses[status]}
                                    onChange={() => toggleStatus(status)}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                <span>{statusLabels[status]}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}