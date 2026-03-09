import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    const [authorities] = await db.query(`
    SELECT
      authority_id,
      authority_name
    FROM authorities
    WHERE is_active = 1
    ORDER BY authority_name ASC
  `);

    return NextResponse.json({ authorities });
}