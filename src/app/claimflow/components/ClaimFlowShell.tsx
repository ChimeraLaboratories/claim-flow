"use client";

import { useState } from "react";

import TopBar from "@/app/claimflow/components/topbar/TopBar";
import FiltersPanel from "@/app/claimflow/components/filters/FiltersPanel";
import SummaryCards from "@/app/claimflow/components/summary/SummaryCards";
import InvoiceTable from "@/app/claimflow/components/invoices/InvoiceTable";
import PaymentsPanel from "@/app/claimflow/components/payments/PaymentsPanel";
import AddInvoiceModal from "@/app/claimflow/components/invoices/AddInvoiceModal";
import AddPaymentModal from "@/app/claimflow/components/payments/AddPaymentModal";
import MatchPaymentModal from "@/app/claimflow/components/matching/MatchPaymentModal";

import type { Payment } from "../types/tracker";
import { useTrackerStore } from "../store/trackerStore";

export default function ClaimFlowShell() {
    const month = useTrackerStore((s) => s.month);

    const [showAddInvoice, setShowAddInvoice] = useState(false);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [showMatchPayment, setShowMatchPayment] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    function handleSaved() {
        setRefreshKey((prev) => prev + 1);
    }

    function handleOpenMatch(payment: Payment) {
        setSelectedPayment(payment);
        setShowMatchPayment(true);
    }

    function handleCloseMatch() {
        setShowMatchPayment(false);
        setSelectedPayment(null);
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <TopBar />

            <div className="mx-auto max-w-7xl px-6 py-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            NHS Invoice &amp; Payment Tracker
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage invoices, log remittances, and reconcile payments.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setShowAddInvoice(true)}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            Add Invoice
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowAddPayment(true)}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                        >
                            Add Payment
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
                    <aside className="xl:sticky xl:top-6 xl:self-start">
                        <FiltersPanel />
                    </aside>

                    <div className="flex min-w-0 flex-col gap-6">
                        <SummaryCards />

                        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.5fr_1fr]">
                            <div className="min-w-0">
                                <InvoiceTable refreshKey={refreshKey} />
                            </div>

                            <div className="min-w-0">
                                <PaymentsPanel
                                    refreshKey={refreshKey}
                                    onMatchPayment={handleOpenMatch}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddInvoiceModal
                open={showAddInvoice}
                onClose={() => setShowAddInvoice(false)}
                onSaved={handleSaved}
            />

            <AddPaymentModal
                open={showAddPayment}
                onClose={() => setShowAddPayment(false)}
                onSaved={handleSaved}
            />

            <MatchPaymentModal
                open={showMatchPayment}
                payment={selectedPayment}
                month={month}
                onClose={handleCloseMatch}
                onSaved={() => {
                    handleSaved();
                    handleCloseMatch();
                }}
            />
        </div>
    );
}