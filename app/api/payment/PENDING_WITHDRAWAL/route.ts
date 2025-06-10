import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { NextRequest, NextResponse } from "next/server";
type Params = {
    payid : string;
    client_id : string;
    operator_ref: string;
    status : 'success' | 'failure'
}

export const GET = async (req: NextRequest) => {
    const params = {} as Params
   
    try {
        
        const availableParams = req.nextUrl.searchParams.entries()
        for(let [key, value] of availableParams){
            // @ts-ignore
            params[key as keyof Params] = value
        }
        console.log('[Processing pending request] ', params);
        if(!params?.status) return NextResponse.json({status : 'failure'});

        if(params?.status === "success" && params?.client_id){
            const existingTransaction = await TRANSACTION.findOne({TransactionID: params?.client_id});
            if(!existingTransaction) throw new Error(`No transaction available for id ${params.client_id}`);
            
            const {valid, data, msg} = await ad_settleWithdrawal({
                ...existingTransaction,
                Status : TransactionStatusType.SUCCESS
            })

            if(!valid){
                console.log('[failed to settle pending withdrawal]', data, msg, params)
                throw new Error('failed');
            }

            return NextResponse.json({status: 'ok'})
        }

        if(params?.status === 'failure'){

            const existingTransaction = await TRANSACTION.findOne({TransactionID: params?.client_id});
            if(!existingTransaction) throw new Error(`No transaction available for id ${params.client_id}`);
            
            const {valid, data, msg} = await ad_settleWithdrawal({
                ...existingTransaction,
                Status : TransactionStatusType.FAILED
            })

            if(!valid){
                console.log('[failed to settle pending withdrawal]', data, msg, params)
                throw new Error('failed');
            }

            return NextResponse.json({status: 'ok'})

        }

        return NextResponse.json({success: true})
    } catch (error) {
        console.log('[handle pending withdrawal]', error);
        return NextResponse.json({success: false})
    }
}