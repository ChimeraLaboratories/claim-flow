import type { Payment } from "../../types/tracker";
import Pill from "@/shared/ui/Pill";
import { formatDate, formatGBP } from "@/shared/utils/Format";

function tone(status: Payment["match_status"]) {
    switch (status) {
        case "MATCHED":
            return "green";
        case "PART_MATCHED":
            return "amber";
        default:
            return "red";
    }
}

export default function PaymentRow({ payment }: { payment: Payment }) {
    return (
        <tr className="border-t border-slate-200/70 dark:border-slate-800/70">
            <td className="px-4 py-3 text-sm">{formatDate(payment.payment_date)}</td>
            <td className="px-4 py-3 text-sm">{payment.authority_name ?? "—"}</td>
            <td className="px-4 py-3 text-sm font-semibold">
                {payment.payment_reference}
            </td>
            <td className="px-4 py-3 text-sm">{formatGBP(payment.payment_amount)}</td>
            <td className="px-4 py-3 text-sm">
                {formatGBP(payment.unmatched_amount)}
            </td>
            <td className="px-4 py-3">
                <Pill tone={tone(payment.match_status)}>{payment.match_status}</Pill>
            </td>
        </tr>
    );
}