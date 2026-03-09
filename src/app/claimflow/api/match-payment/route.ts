import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type DbInvoice = {
    invoice_id: number;
    invoice_amount: number;
    already_matched: number;
};

type DbPayment = {
    payment_id: number;
    payment_amount: number;
    already_matched: number;
};

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const paymentId = Number(body.paymentId);
        const invoiceIds = Array.isArray(body.invoiceIds)
            ? body.invoiceIds.map((value: unknown) => Number(value)).filter(Boolean)
            : [];

        if (!paymentId || invoiceIds.length === 0) {
            return NextResponse.json(
                { error: "paymentId and at least one invoiceId are required." },
                { status: 400 }
            );
        }

        const [paymentRows] = await db.query(
            `
        SELECT
          p.payment_id,
          p.payment_amount,
          COALESCE(SUM(pim.matched_amount), 0) AS already_matched
        FROM payments p
        LEFT JOIN payment_invoice_matches pim
          ON pim.payment_id = p.payment_id
        WHERE p.payment_id = :paymentId
        GROUP BY p.payment_id, p.payment_amount
      `,
            { paymentId }
        );

        const payment = (paymentRows as DbPayment[])[0];

        if (!payment) {
            return NextResponse.json(
                { error: "Payment not found." },
                { status: 404 }
            );
        }

        let remainingPayment =
            Number(payment.payment_amount) - Number(payment.already_matched);

        if (remainingPayment <= 0) {
            return NextResponse.json(
                { error: "This payment has no unmatched balance remaining." },
                { status: 400 }
            );
        }

        const [invoiceRows] = await db.query(
            `
        SELECT
          i.invoice_id,
          i.invoice_amount,
          COALESCE(SUM(pim.matched_amount), 0) AS already_matched
        FROM invoices i
        LEFT JOIN payment_invoice_matches pim
          ON pim.invoice_id = i.invoice_id
        WHERE i.invoice_id IN (:invoiceIds)
        GROUP BY i.invoice_id, i.invoice_amount
        ORDER BY i.invoice_id ASC
      `,
            { invoiceIds }
        );

        const invoices = invoiceRows as DbInvoice[];

        for (const invoice of invoices) {
            if (remainingPayment <= 0) break;

            const invoiceRemaining =
                Number(invoice.invoice_amount) - Number(invoice.already_matched);

            if (invoiceRemaining <= 0) continue;

            const matchedAmount = Math.min(remainingPayment, invoiceRemaining);

            await db.query(
                `
          INSERT INTO payment_invoice_matches (
            payment_id,
            invoice_id,
            matched_amount
          )
          VALUES (
            :paymentId,
            :invoiceId,
            :matchedAmount
          )
        `,
                {
                    paymentId,
                    invoiceId: invoice.invoice_id,
                    matchedAmount,
                }
            );

            remainingPayment -= matchedAmount;
        }

        await db.query(
            `
        UPDATE payments p
        LEFT JOIN (
          SELECT payment_id, COALESCE(SUM(matched_amount), 0) AS matched_total
          FROM payment_invoice_matches
          WHERE payment_id = :paymentId
          GROUP BY payment_id
        ) m
          ON m.payment_id = p.payment_id
        SET p.match_status = CASE
          WHEN COALESCE(m.matched_total, 0) = 0 THEN 'UNMATCHED'
          WHEN COALESCE(m.matched_total, 0) < p.payment_amount THEN 'PART_MATCHED'
          ELSE 'MATCHED'
        END
        WHERE p.payment_id = :paymentId
      `,
            { paymentId }
        );

        for (const invoiceId of invoiceIds) {
            await db.query(
                `
          UPDATE invoices i
          LEFT JOIN (
            SELECT invoice_id, COALESCE(SUM(matched_amount), 0) AS matched_total
            FROM payment_invoice_matches
            WHERE invoice_id = :invoiceId
            GROUP BY invoice_id
          ) m
            ON m.invoice_id = i.invoice_id
          SET i.status = CASE
            WHEN COALESCE(m.matched_total, 0) = 0 THEN i.status
            WHEN COALESCE(m.matched_total, 0) < i.invoice_amount THEN 'PART_PAID'
            ELSE 'PAID'
          END
          WHERE i.invoice_id = :invoiceId
        `,
                { invoiceId }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("POST /claimflow/api/match-payment failed", error);
        return NextResponse.json(
            { error: "Failed to match payment." },
            { status: 500 }
        );
    }
}