import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const month = String(searchParams.get("month") ?? "").trim();
    const authorityId = Number(searchParams.get("authorityId") ?? 0);
    const q = String(searchParams.get("q") ?? "").trim().toLowerCase();

    const where: string[] = [];
    const params: Record<string, string | number> = {};

    if (/^\d{4}-\d{2}$/.test(month)) {
        where.push("DATE_FORMAT(i.invoice_date, '%Y-%m') = :month");
        params.month = month;
    }

    if (authorityId > 0) {
        where.push("i.authority_id = :authorityId");
        params.authorityId = authorityId;
    }

    if (q) {
        where.push(`
      (
        LOWER(i.invoice_number) LIKE :q
        OR LOWER(a.authority_name) LIKE :q
      )
    `);
        params.q = `%${q}%`;
    }

    const sql = `
    SELECT
      i.invoice_id,
      i.authority_id,
      a.authority_name,
      i.invoice_number,
      i.invoice_date,
      i.due_date,
      i.invoice_amount,
      i.status,
      COALESCE(SUM(pim.matched_amount), 0) AS payment_total,
      (i.invoice_amount - COALESCE(SUM(pim.matched_amount), 0)) AS balance_remaining
    FROM invoices i
    JOIN authorities a
      ON a.authority_id = i.authority_id
    LEFT JOIN payment_invoice_matches pim
      ON pim.invoice_id = i.invoice_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    GROUP BY
      i.invoice_id,
      i.authority_id,
      a.authority_name,
      i.invoice_number,
      i.invoice_date,
      i.due_date,
      i.invoice_amount,
      i.status
    ORDER BY i.invoice_date DESC, i.invoice_id DESC
  `;

    const [invoices] = await db.query(sql, params);

    return NextResponse.json({ invoices });
}