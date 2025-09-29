import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";

const SECRET_KEY = process.env.RS_PAY_REQUEST_TOKEN!; // same as used for sign generation

// Types for the incoming notification
type RSPayNotification = {
  merchantId: string;
  merchantOrderId: string;
  orderId: string;
  state: 1 | 2 | 3 | 4; // 1: Success, 2: Processing, 3: Failed, 4: Partial
  amount: number;
  actualAmount: number;
  paymentCurrency: string;
  ext: string;
  utr?: string; // only for state 1 or 4
  sign: string;
};

// Function to generate SHA256 signature like docs
function generateSignature(params: Record<string, any>, key: string): string {
  // 1. Filter out empty values and "sign"
  const entries = Object.entries(params)
    .filter(([k, v]) => k !== "sign" && v !== null && v !== undefined && v !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  // 2. Build query string
  const queryString = entries.map(([k, v]) => `${k}=${v}`).join("&") + `&key=${key}`;

  // 3. Hash with SHA256
  return crypto.createHash("sha256").update(queryString).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body: RSPayNotification = await req.json();
    console.log('COLA pending withdraw', body, req.body);
    // Verify signature
    const { sign, ...dataWithoutSign } = body;
    const expectedSign = generateSignature(dataWithoutSign, SECRET_KEY);

    if (sign !== expectedSign) {
      console.error("Invalid signature in RS Pay notify", { received: sign, expected: expectedSign });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const pay = body; // RS Pay sends single payment notification
    try {
      const existingTransaction = await TRANSACTION.findOne({
        TransactionID: pay?.merchantOrderId,
      }).lean();

      if (!existingTransaction) {
        throw new Error(`No transaction available for id ${pay?.merchantOrderId}`);
      }

      const { valid, data, msg } = await ad_settleWithdrawal({
        ...existingTransaction,
        Status:
          Number(pay.state) === 1
            ? TransactionStatusType.SUCCESS
            : TransactionStatusType.FAILED,
      } as unknown as TransactionObjType);

      if (!valid) {
        console.log("[failed to settle withdrawal]", data, msg, pay);
        throw new Error("settlement failed");
      }
        return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
    } catch (error) {
        console.log(error, "error while processing RS Pay notify", body);
        return NextResponse.json({ success: false });
    }

  } catch (err) {
    console.error("Error in RS Pay notify handler:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const body = await req.text();
    console.log('COLA pending withdrawal in get requets', body);
    return new NextResponse("success")
    // Verify signature
    // const { sign, ...dataWithoutSign } = body;
    // const expectedSign = generateSignature(dataWithoutSign, SECRET_KEY);

    // if (sign !== expectedSign) {
    //   console.error("Invalid signature in RS Pay notify", { received: sign, expected: expectedSign });
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    // }

    // const pay = body; // RS Pay sends single payment notification
    // try {
    //   const existingTransaction = await TRANSACTION.findOne({
    //     TransactionID: pay?.merchantOrderId,
    //   }).lean();

    //   if (!existingTransaction) {
    //     throw new Error(`No transaction available for id ${pay?.merchantOrderId}`);
    //   }

    //   const { valid, data, msg } = await ad_settleWithdrawal({
    //     ...existingTransaction,
    //     Status:
    //       Number(pay.state) === 1
    //         ? TransactionStatusType.SUCCESS
    //         : TransactionStatusType.FAILED,
    //   } as unknown as TransactionObjType);

    //   if (!valid) {
    //     console.log("[failed to settle withdrawal]", data, msg, pay);
    //     throw new Error("settlement failed");
    //   }
    //     return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
    // } catch (error) {
    //     console.log(error, "error while processing RS Pay notify", body);
    //     return NextResponse.json({ success: false });
    // }

  } catch (err) {
    console.error("Error in RS Pay notify handler:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
