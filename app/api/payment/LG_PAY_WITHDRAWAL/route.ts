import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";


// Function to generate SHA256 signature like docs
function generateLGPaySignature(params: Record<string, any>, key: string): string {
  // 1. Remove empty values & "sign"
  const filtered = Object.entries(params)
    .filter(([k, v]) => k !== "sign" && v !== null && v !== undefined && v !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  // 2. Build query string
  const queryString = filtered.map(([k, v]) => `${k}=${v}`).join("&") + `&key=${key}`;

  // 3. MD5 uppercase
  return crypto.createHash("md5").update(queryString).digest("hex").toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    // Parse x-www-form-urlencoded
    const formData = await req.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    console.log("[LG PAY CALLBACK RECEIVED]", body);

    const { sign, ...dataWithoutSign } = body;
    const expectedSign = generateLGPaySignature(dataWithoutSign, process.env.LGPAY_SECRET_KEY!);

    if (sign !== expectedSign) {
      console.error("Invalid signature in LG Pay notify", { received: sign, expected: expectedSign });
      return new NextResponse("Invalid signature", { status: 400 });
    }

    // Transaction settlement
    const existingTransaction = await TRANSACTION.findOne({
      TransactionID: body.order_sn,
    }).lean();

    if (!existingTransaction) {
      console.error("No transaction found for order_sn:", body.order_sn);
      return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } }); 
    }

    const status =
      Number(body.status) === 1
        ? TransactionStatusType.SUCCESS
        : TransactionStatusType.FAILED;

    const { valid, data, msg } = await ad_settleWithdrawal({
      ...existingTransaction,
      Status: status,
    } as unknown as TransactionObjType);

    if (!valid) {
      console.error("[Failed to settle withdrawal]", data, msg, body);
      // Still return ok, otherwise LG Pay retries
      return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // ✅ Always respond with plain ok
    return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });

  } catch (err) {
    console.error("Error in LG Pay notify handler:", err);
    return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } }); 
    // Important: return ok to prevent retries, even on server error
  }
}