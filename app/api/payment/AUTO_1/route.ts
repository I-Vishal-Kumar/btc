import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleDeposit } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import { CONNECT } from "@/lib/_db/db.config";
import { NextRequest, NextResponse } from "next/server";


/**
 * {"tradeResult":"1","oriAmount":"100.00","amount":"100.00","mchId":"100333078","orderNo":"1000065484115","mchOrderNo":"85749324","sign":"a112aaf80bb0cc13b1828fc43765850f","signType":"MD5","orderDate":"2024-12-18 00:31:38"}
 */
export async function POST(request: NextRequest) {
      
  const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID;

  const rawBody = await request.text();

  // Parse the URL-encoded body
  const params = new URLSearchParams(rawBody);

  // Convert the parsed data into an object
  const body = Object.fromEntries(params)

  try {

    const {tradeResult="", oriAmount=0, amount=1, mchId="",mchOrderNo= '' } = body

    await CONNECT();
    
    if(Number(oriAmount) !== Number(amount) || Number(tradeResult) !== 1 
      || Number(mchId) !== Number(merchantId)
    ){
      // its failure
      await TRANSACTION.findOneAndDelete({TransactionId: `${mchOrderNo}`});
      return NextResponse.json("failure")
    }  

    const transaction = await TRANSACTION.findOne({TransactionID : `${mchOrderNo}`});

    if(!transaction) throw new Error("no transaction was found");

    const {valid, data, msg} = await ad_settleDeposit({
      ...transaction.toObject(),
      Amount : Number(oriAmount),
      Status : TransactionStatusType.SUCCESS
    } as TransactionObjType)

    if(!valid){ 
      console.log('AUTO_1: NOT VALID', valid, data, msg, body)
      throw new Error('failed')
    };

    return new NextResponse('success', {status: 200});
    
  } catch (error) {
    console.log("AUTO_1", error, body );
    return new NextResponse('failure', {status: 400 });
  }
}