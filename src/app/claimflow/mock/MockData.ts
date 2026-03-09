import {Invoice, Payment} from "@/app/claimflow/types/tracker";


export const MOCK_INVOICES: Invoice[] = [
    {
        id: "i1",
        invoiceNo: "HINV-000102",
        hospital: "Peterborough City Hospital",
        clinician: "Manni",
        invoiceDate: "2026-03-02",
        valuePence: 125000,
        status: "PAID",
        paymentRef: "23390375655",
        paymentDate: "2026-03-20",
    },
    {
        id: "i2",
        invoiceNo: "HINV-000103",
        hospital: "Peterborough City Hospital",
        clinician: "Faizah",
        invoiceDate: "2026-03-03",
        valuePence: 95000,
        status: "AWAITING PAYMENT",
        paymentRef: null,
        paymentDate: null,
    },
    {
        id: "i3",
        invoiceNo: "HINV-000104",
        hospital: "Hinchingbrooke Hospital",
        clinician: "Rubaihah",
        invoiceDate: "2026-03-03",
        valuePence: 148000,
        status: "AWAITING PAYMENT",
        paymentRef: null,
        paymentDate: null,
    },
    {
        id: "i4",
        invoiceNo: "HINV-000105",
        hospital: "Peterborough City Hospital",
        clinician: "Manni",
        invoiceDate: "2026-02-01",
        valuePence: 125000,
        status: "OVERDUE",
        paymentRef: null,
        paymentDate: null,
    },
];

export const MOCK_PAYMENTS: Payment[] = [
    {
        id: "p1",
        paymentDate: "2026-01-15",
        reference: "23390375655",
        amountPence: 394756,
        matchedInvoiceIds: ["i1"],
    },
    {
        id: "p2",
        paymentDate: "2025-11-14",
        reference: "23390393344",
        amountPence: 183122,
        matchedInvoiceIds: [],
    },
    {
        id: "p3",
        paymentDate: "2025-06-27",
        reference: "23390385702",
        amountPence: 139141,
        matchedInvoiceIds: [],
    },
];