import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import { NextRequest, NextResponse } from "next/server";
type Params = {
    payid: string;
    client_id: string;
    operator_ref: string;
    status: "success" | "failure";
};

export const GET = async (req: NextRequest) => {
    const params = {} as Params;

    try {
        const availableParams = req.nextUrl.searchParams.entries();
        for (const [key, value] of availableParams) {
            // @ts-expect-error dont know why but i did this.
            params[key as keyof Params] = value;
        }
        console.log("[Processing pending request] ", params);
        if (!params?.status) return NextResponse.json({ status: "failure" });

        if (params?.status === "success" && params?.client_id) {
            const existingTransaction = await TRANSACTION.findOne({
                TransactionID: params?.client_id,
            }).lean();
            if (!existingTransaction)
                throw new Error(
                    `No transaction available for id ${params.client_id}`
                );

            console.log("passing", {
                ...existingTransaction,
                Status: TransactionStatusType.SUCCESS,
            });

            const { valid, data, msg } = await ad_settleWithdrawal({
                ...existingTransaction,
                Status: TransactionStatusType.SUCCESS,
            } as unknown as TransactionObjType);

            if (!valid) {
                console.log(
                    "[failed to settle pending withdrawal]",
                    data,
                    msg,
                    params
                );
                throw new Error("failed");
            }

            return NextResponse.json({ status: "ok" });
        }

        if (params?.status === "failure") {
            const existingTransaction = await TRANSACTION.findOne({
                TransactionID: params?.client_id,
            });
            if (!existingTransaction)
                throw new Error(
                    `No transaction available for id ${params.client_id}`
                );

            const { valid, data, msg } = await ad_settleWithdrawal({
                ...existingTransaction,
                Status: TransactionStatusType.FAILED,
            });

            if (!valid) {
                console.log(
                    "[failed to settle pending withdrawal]",
                    data,
                    msg,
                    params
                );
                throw new Error("failed");
            }

            return NextResponse.json({ status: "ok" });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("[handle pending withdrawal]", error);
        return NextResponse.json({ success: false });
    }
};

export const POST = async (req: NextRequest) => {
    try {
        const bodyText = await req.text();
        const params = new URLSearchParams(bodyText);

        // convert params to an object
        const rawData: Record<string, any> = {};
        params.forEach((value, key) => {
            rawData[key] = value;
        });

        // so parse it properly
        const parsedData = {
            status: rawData.status,
            payouts: JSON.parse(rawData.payouts),
        };
        console.log(parsedData);
        if (parsedData?.payouts && parsedData.payouts?.length) {
            for (const pay of parsedData.payouts) {
                try {
                    const existingTransaction = await TRANSACTION.findOne({
                        TransactionID: pay?.transaction_id,
                    }).lean();
                    if (!existingTransaction)
                        throw new Error(
                            `No transaction available for id ${pay?.transaction_id}`
                        );

                    const { valid, data, msg } = await ad_settleWithdrawal({
                        ...existingTransaction,
                        Status:
                            pay.status === "success"
                                ? TransactionStatusType.SUCCESS
                                : TransactionStatusType.FAILED,
                    } as unknown as TransactionObjType);

                    if (!valid) {
                        console.log(
                            "[failed to settle pending withdrawal]",
                            data,
                            msg,
                            params
                        );
                        throw new Error("failed");
                    }
                } catch (error) {
                    console.log(error, "error while processing callback", pay);
                }
            }

            return NextResponse.json({ status: "ok" });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("[handle pending withdrawal]", error);
        return NextResponse.json({ success: false });
    }
};
