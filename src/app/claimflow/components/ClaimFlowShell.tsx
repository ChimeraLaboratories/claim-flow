"use client";

import TopBar from "@/app/claimflow/components/topbar/TopBar";
import FiltersPanel from "@/app/claimflow/components/filters/FiltersPanel";
import SummaryCards from "@/app/claimflow/components/summary/SummaryCards";
import InvoiceTable from "@/app/claimflow/components/invoices/InvoiceTable";
import PaymentsPanel from "@/app/claimflow/components/payments/PaymentsPanel";

export default function ClaimFlowShell() {
    return (
        <div>
            <TopBar />

            <main className="mx-auto max-w-[1440px] px-4 py-6">
                <div className="grid grid-cols-12 gap-6">
                    <aside className="col-span-12 xl:col-span-3">
                        <FiltersPanel />
                    </aside>

                    <section className="col-span-12 xl:col-span-9 space-y-6">
                        <SummaryCards />
                        <InvoiceTable />
                        <PaymentsPanel />
                    </section>
                </div>
            </main>
        </div>
    );
}