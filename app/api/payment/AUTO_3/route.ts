import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import {
  ad_settleDeposit,
  ad_settleWithdrawal,
} from "@/(backend)/services/admin.service.serve";
import { db_schema, TransactionStatusType } from "@/__types__/db.types";
import { CONNECT } from "@/lib/_db/db.config";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// parsed body {
//   status: 'credit',
//   amount: '100',
//   client_id: 'c73032e3cb853586e572bbc4782997f7',
//   order_id: '174',
//   utr: '555565020384'
// }

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);
  const parsedBody = Object.fromEntries(params.entries()); // ✅ Correctly extract key-value pairs

  console.log(
    "parsed body [POST]  ",
    Date.now(),
    parsedBody,
    typeof parsedBody,
  );

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Validate the request body
    if (!["credit", "success"].includes(parsedBody.status))
      throw new Error("Transaction Failed");

    // Connect to DB
    await CONNECT();
    const [userWithTransaction] = await TRANSACTION.aggregate([
      {
        $match: {
          TransactionID: parsedBody.client_id,
        },
      },
      {
        $lookup: {
          localField: "PhoneNumber",
          foreignField: "PhoneNumber",
          from: db_schema.USERS,
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
        },
      },
    ]);

    const userInfo = userWithTransaction.userInfo;
    delete userWithTransaction.userInfo;

    const transaction = JSON.parse(JSON.stringify(userWithTransaction));

    if (!userInfo || !transaction) throw new Error("Tampered request body");

    const { valid, data, msg } = await ad_settleDeposit({
      ...transaction,
      Status: TransactionStatusType.SUCCESS,
      TransactionID: parsedBody.utr,
    });

    if (!valid) {
      throw new Error(`Settlement failed: ${msg} data ${data}`);
    }

    return new NextResponse("success", { status: 200 });
  } catch (error: any) {
    console.error("RMS_1 Error:", error.message, error, parsedBody, rawBody);

    return new NextResponse(`Error: ${error.message}`, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const parsedBody = Object.fromEntries(url.searchParams.entries());

  console.log("parsed body [GET] ", Date.now(), parsedBody);

  // Connect to DB
  await CONNECT();

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Validate the request body
    if (!["credit", "success"].includes(parsedBody.status))
      throw new Error("Transaction Failed");

    const [userWithTransaction] = await TRANSACTION.aggregate([
      {
        $match: {
          TransactionID: parsedBody.client_id,
        },
      },
      {
        $lookup: {
          localField: "PhoneNumber",
          foreignField: "PhoneNumber",
          from: db_schema.USERS,
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
        },
      },
    ]);

    const userInfo = userWithTransaction.userInfo;
    delete userWithTransaction.userInfo;

    const transaction = JSON.parse(JSON.stringify(userWithTransaction));

    if (!userInfo || !transaction) throw new Error("Tampered request body");

    const isWithdrawalProcessing =
      parsedBody?.wallet_type === "1" &&
      parsedBody?.payid &&
      parsedBody?.client_id;

    const { valid, data, msg } = await (isWithdrawalProcessing
      ? ad_settleWithdrawal({
          ...transaction,
          Status: TransactionStatusType.SUCCESS,
          TransactionID: parsedBody?.utr || parsedBody?.operator_ref,
        })
      : ad_settleDeposit({
          ...transaction,
          Status: TransactionStatusType.SUCCESS,
          TransactionID: parsedBody?.utr || parsedBody?.operator_ref,
        }));

    if (!valid) {
      console.log(valid, data, msg);
      throw new Error(`Settlement failed: ${msg} data ${data}`);
    }

    return new NextResponse("success", { status: 200 });
  } catch (error: any) {
    console.error("RMS_1 Error:", error.message, error, parsedBody);

    return new NextResponse(`Error: ${error.message}`, { status: 400 });
  }
};
