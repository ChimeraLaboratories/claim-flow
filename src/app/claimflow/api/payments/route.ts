import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const month = String(searchParams.get("month") ?? "").trim();
    const authorityId = Number(searchParams.get("authorityId") ?? 0);

    const where: string[] = [];
    const params: Record<string, string | number> = {};

    if (/^\d{4}-\d{2}$/.test(month)) {
        where.push("DATE_FORMAT(p.payment_date, '%Y-%m') = :month");
        params.month = month;
    }

    if (authorityId > 0) {
        where.push("p.authority_id = :authorityId");
        params.authorityId = authorityId;
    }

    const sql = `
    SELECT
      p.payment_id,
      p.authority_id,
      a.authority_name,
      p.payment_date,
      p.payment_reference,
      p.payment_amount,
      p.match_status,
      COALESCE(SUM(pim.matched_amount), 0) AS matched_total,
      (p.payment_amount - COALESCE(SUM(pim.matched_amount), 0)) AS unmatched_amount
    FROM payments p
    LEFT JOIN authorities a
      ON a.authority_id = p.authority_id
    LEFT JOIN payment_invoice_matches pim
      ON pim.payment_id = p.payment_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    GROUP BY
      p.payment_id,
      p.authority_id,
      a.authority_name,
      p.payment_date,
      p.payment_reference,
      p.payment_amount,
      p.match_status
    ORDER BY p.payment_date DESC, p.payment_id DESC
  `;

    const [payments] = await db.query(sql, params);

    return NextResponse.json({ payments });
}