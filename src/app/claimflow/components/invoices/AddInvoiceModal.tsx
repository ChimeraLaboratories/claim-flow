"use client";

import { useState } from "react";

export default function AddInvoiceModal({ open, onClose, onSaved }: any) {
    const [authority, setAuthority] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [amount, setAmount] = useState("");

    async function handleSubmit(e: any) {
        e.preventDefault();

        const res = await fetch("/claimflow/api/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                authority,
                invoiceNumber,
                amount,
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

                <h2>Add Invoice</h2>

                <form onSubmit={handleSubmit}>

                    <label>Authority</label>
                    <input
                        value={authority}
                        onChange={(e) => setAuthority(e.target.value)}
                        required
                    />

                    <label>Invoice Number</label>
                    <input
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
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

                    <div className="modal-actions">
                        <button type="submit">Save Invoice</button>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}