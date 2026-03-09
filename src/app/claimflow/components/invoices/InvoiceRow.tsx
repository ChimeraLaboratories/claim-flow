import type { Invoice } from "../../types/tracker";
import Pill from "@/shared/ui/Pill";
import { formatDate, formatGBP } from "@/shared/utils/Format";

function toneForStatus(status: Invoice["status"]) {
    switch (status) {
        case "PAID":
            return "green";
        case "PART_PAID":
            return "amber";
        case "OVERDUE":
            return "red";
        case "ISSUED":
            return "blue";
        case "DRAFT":
            return "slate";
        case "CANCELLED":
            return "slate";
        default:
            return "slate";
    }
}

export default function InvoiceRow({ invoice }: { invoice: Invoice }) {
    return (
        <tr className="border-t border-slate-200/70 dark:border-slate-800/70">
            <td className="px-4 py-3 text-sm font-semibold">{invoice.invoice_number}</td>
            <td className="px-4 py-3 text-sm">{invoice.authority_name}</td>
            <td className="px-4 py-3 text-sm">{formatDate(invoice.invoice_date)}</td>
            <td className="px-4 py-3 text-sm">{formatDate(invoice.due_date)}</td>
            <td className="px-4 py-3 text-sm font-semibold">
                {formatGBP(invoice.invoice_amount)}
            </td>
            <td className="px-4 py-3 text-sm">
                {formatGBP(invoice.balance_remaining)}
            </td>
            <td className="px-4 py-3">
                <Pill tone={toneForStatus(invoice.status)}>{invoice.status}</Pill>
            </td>
        </tr>
    );
}