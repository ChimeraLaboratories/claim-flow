"use client";

import { useState } from "react";

export default function AddPaymentModal({ open, onClose, onSaved }: any) {
    const [reference, setReference] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");

    async function handleSubmit(e: any) {
        e.preventDefault();

        const res = await fetch("/claimflow/api/payments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                reference,
                amount,
                date,
            }),
        });

        if (res.ok) {
            onSaved();
            onClose();
        }
    }

    if (!open) return null;

    return (
        <div className="modal">
            <div className="modal-content">

                <h2>Add Payment</h2>

                <form onSubmit={handleSubmit}>

                    <label>Bank Reference</label>
                    <input
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        required
                    />

                    <label>Amount (£)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />

                    <label>Payment Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />

                    <div className="modal-actions">
                        <button type="submit">Save Payment</button>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}