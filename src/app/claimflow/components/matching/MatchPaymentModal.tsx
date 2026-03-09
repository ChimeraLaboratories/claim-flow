"use client";

import { useState } from "react";

export default function MatchPaymentModal({
                                              open,
                                              payment,
                                              invoices,
                                              onClose,
                                              onSaved,
                                          }: any) {

    const [selected, setSelected] = useState<number[]>([]);

    async function handleSubmit() {

        const res = await fetch("/claimflow/api/match-payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                paymentId: payment.id,
                invoiceIds: selected,
            }),
        });

        if (res.ok) {
            onSaved();
            onClose();
        }
    }

    if (!open) return null;

    function toggleInvoice(id: number) {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    }

    return (
        <div className="modal">
            <div className="modal-content">

                <h2>Match Payment</h2>

                <p>
                    Payment: £{payment.amount} ({payment.reference})
                </p>

                <div className="invoice-list">

                    {invoices.map((inv: any) => (
                        <label key={inv.id}>

                            <input
                                type="checkbox"
                                checked={selected.includes(inv.id)}
                                onChange={() => toggleInvoice(inv.id)}
                            />

                            {inv.invoiceNumber} — £{inv.amount}

                        </label>
                    ))}

                </div>

                <div className="modal-actions">
                    <button onClick={handleSubmit}>
                        Match Selected
                    </button>

                    <button onClick={onClose}>
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
}