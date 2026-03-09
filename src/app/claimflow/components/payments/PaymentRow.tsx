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

export default function PaymentRow({
                                       payment,
                                       onMatch,
                                   }: {
    payment: Payment;
    onMatch: () => void;
}) {
    const canMatch = Number(payment.unmatched_amount) > 0;

    return (
        <tr className="hover:bg-slate-50">
            <td className="px-4 py-3">{formatDate(payment.payment_date)}</td>
            <td className="px-4 py-3">{payment.authority_name ?? "—"}</td>
            <td className="px-4 py-3 font-medium text-slate-900">
                {payment.payment_reference}
            </td>
            <td className="px-4 py-3">{formatGBP(payment.payment_amount)}</td>
            <td className="px-4 py-3">{formatGBP(payment.unmatched_amount)}</td>
            <td className="px-4 py-3">
                <Pill tone={tone(payment.match_status)}>{payment.match_status}</Pill>
            </td>
            <td className="px-4 py-3 text-right">
                <button
                    type="button"
                    onClick={onMatch}
                    disabled={!canMatch}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Match
                </button>
            </td>
        </tr>
    );
}