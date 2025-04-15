"use server"

import { CONNECT } from "@/lib/_db/db.config";
import { VerifyToken } from "@/lib/auth/verifyToken"
import { cookies } from "next/headers";
import { ServiceReturnType } from "@/__types__/service.types";
import { TRANSACTION } from "../(modals)/schema/transaction.schema";
import { USER } from "../(modals)/schema/user.schema";
import { UserType } from "@/__types__/user.types";
import { GatewayTypes, TransactionStatusType, TransactionType, db_schema } from "@/__types__/db.types";
import { Income, TransactionObjType } from "@/__types__/transaction.types";
import { INCOME } from "../(modals)/schema/incomeConfig.schema";
import { DateTime } from "luxon";

/**
 * 
 * @note If you change the funciton name here you have to change in admin config collection also.
 */
// async function addParentToTransactions() {
//     try {
//         await CONNECT();
//       // Step 1: Get all transactions
//       const transactions = await TRANSACTION.find({Type : TransactionType.DEPOSIT, 
//         Parent: { $exists: false } 
//     });
  
//       for (const txn of transactions) {
//         // Step 2: Find the user with matching phoneNumber
//         const user = await USER.findOne({ PhoneNumber: txn.PhoneNumber,
            
//         });
  
//         if (user && user.Parent) {
//           // Step 3: Add Parent field and save
//           txn.Parent = user.Parent;
//           await txn.save();
//         }
//       }
  
//       console.log("All matching transactions updated with Parent.");
//     } catch (err) {
//       console.error("Error while updating transactions with parent:", err);
//     }
//   }

// default channel =========================================
export const BTC = async (amount: number, TransactionID: string, method: string): ServiceReturnType => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        if(!token) return { valid: false, data: undefined }

        const {success, decoded=null} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false}

        if(amount < 100) throw new Error("Minimum amount is 100.")
        
        await CONNECT();

        // check if this transaction id already exists
        const isExists = await TRANSACTION.findOne({TransactionID});

        if(isExists) throw new Error("Invalid transaction id.");

        const userDetails = await USER.findOne({PhoneNumber: decoded.PhoneNumber}) as UserType;
          
        await TRANSACTION.create({
            PhoneNumber : decoded.PhoneNumber,
            Parent : userDetails.Parent,
            InvitationCode : userDetails.InvitationCode,
            Amount: amount,
            Method: method,
            Type : TransactionType.DEPOSIT,
            Status: TransactionStatusType.PENDING,
            TransactionID,
        })

        return {valid: true, msg: 'Your payment is in processing.'};

    } catch (error) {
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong', operation: 'LOGOUT'};
        return {valid: false, msg: error?.message || 'something went wrong'}
    }
}


export const USDT = async (amount: number, TransactionID: string, method: string): ServiceReturnType => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        if(!token) return { valid: false, data: undefined }

        const {success, decoded=null} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false}

        if(amount < 100) throw new Error(`Minimum amount is $${(100/89).toFixed(2)}.`)
        
        await CONNECT();

        // check if this transaction id already exists
        const isExists = await TRANSACTION.findOne({TransactionID});

        if(isExists) throw new Error("Invalid transaction id.");

        const userDetails = await USER.findOne({PhoneNumber: decoded.PhoneNumber}) as UserType;
          
        await TRANSACTION.create({
            PhoneNumber : decoded.PhoneNumber,
            Parent : userDetails.Parent,
            InvitationCode : userDetails.InvitationCode,
            Amount: (amount/89).toFixed(2),
            Method: method,
            Type : TransactionType.DEPOSIT,
            Status: TransactionStatusType.PENDING,
            TransactionID,
        })

        return {valid: true, msg: 'Your payment is in processing.'};

    } catch (error) {
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong', operation: 'LOGOUT'};
        return {valid: false, msg: error?.message || 'something went wrong'}
    }
}

export const AUTO_1 = async (amount: number, TransactionID: string): ServiceReturnType => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        if(!token) return { valid: false, data: undefined }

        const {success, decoded=null} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false}

        if(amount < 100) throw new Error("Minimum amount is 100.")
        
        await CONNECT();

        // check if this transaction id already exists
        const isExists = await TRANSACTION.findOne({TransactionID});

        if(isExists) throw new Error("Invalid transaction id.");

        const userDetails = await USER.findOne({PhoneNumber: decoded.PhoneNumber}) as UserType;
          
        await TRANSACTION.create({
            PhoneNumber : decoded.PhoneNumber,
            Parent : userDetails.Parent,
            InvitationCode : userDetails.InvitationCode,
            Amount: amount,
            Method: GatewayTypes.AUTO_1,
            Type : TransactionType.DEPOSIT,
            Status: TransactionStatusType.PENDING,
            TransactionID,
        })

        return {valid: true, msg: 'Your payment is in processing.'};

    } catch (error) {
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong', operation: 'LOGOUT'};
        return {valid: false, msg: error?.message || 'something went wrong'}
    }

}

export const getTransactionDetails = async (type: TransactionType[] ): ServiceReturnType<TransactionObjType[]> => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        if(!token) return { valid: false, data: undefined }

        const {success, decoded=null} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false}

        const depositDetails = await TRANSACTION.find({PhoneNumber: decoded.PhoneNumber, Type: {$in : [...type]}}, {Parent: 0, InvitationCode: 0, PhoneNumber: 0}).sort({createdAt: -1}).limit(50)

        return {valid: true, data: depositDetails || []}

    } catch (error) {
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong', operation: 'LOGOUT'};
        return {valid: false, msg: error?.message || 'something went wrong'}
    }
}

export const deleteTransaction = async (TransactionID : string): ServiceReturnType => {
    try {
        
        const isDeleted = await TRANSACTION.findOneAndDelete({TransactionID});
        
        return {valid : !!isDeleted}

    } catch (error) {
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong', operation: 'LOGOUT'};
        return {valid: false, msg: error?.message || 'something went wrong'}
   
    }
}


export const getIncomeHistory = async () : ServiceReturnType<Income[]> => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        if(!token) return { valid: false, data: undefined }

        const {success, decoded=null} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false}
        const now = DateTime.now();
        const oneWeekAgo = now.minus({days : 6});

        // const incomeDetails = await INCOME.find({PhoneNumber : decoded.PhoneNumber, createdAt : { $gte : oneWeekAgo.toJSDate() }}).lean();
        const incomeDetails = await INCOME.aggregate([
            {
              $match: {
                PhoneNumber: decoded.PhoneNumber,
                createdAt: { $gte: oneWeekAgo.toJSDate() }
              }
            },
            {
              $lookup: {
                from: db_schema.USERS,
                localField: "From",
                foreignField: "InvitationCode",
                as: "giftFrom"
              }
            },
            {
              $addFields: {
                giftFrom: { $arrayElemAt: ["$giftFrom", 0] } // flatten the joined array
              }
            },
            {
              $project: {
                PhoneNumber: 1,
                Amount: 1,
                Type: 1,
                From: 1,
                createdAt: 1,
                "giftFrom.Name": 1,
                "giftFrom.PhoneNumber": 1
              }
            }
          ]);
          

        if(!incomeDetails) throw new Error("Failed to get income details.");
        
        return {valid: true, data: incomeDetails as unknown as Income[] || []}

    } catch (error) {
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong', operation: 'LOGOUT'};
        return {valid: false, msg: error?.message || 'something went wrong'}
    }
}