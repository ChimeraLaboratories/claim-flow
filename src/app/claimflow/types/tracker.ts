export type InvoiceStatus =
    | "DRAFT"
    | "ISSUED"
    | "PART_PAID"
    | "PAID"
    | "OVERDUE"
    | "CANCELLED";

export type MatchStatus = "UNMATCHED" | "PART_MATCHED" | "MATCHED";

export type Invoice = {
    invoice_id: number;
    authority_id: number;
    authority_name: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string | null;
    invoice_amount: number;
    status: InvoiceStatus;
    payment_total: number;
    balance_remaining: number;
};

export type Payment = {
    payment_id: number;
    authority_id: number | null;
    authority_name: string | null;
    payment_date: string;
    payment_reference: string;
    payment_amount: number;
    match_status: MatchStatus;
    matched_total: number;
    unmatched_amount: number;
};