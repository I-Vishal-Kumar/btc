"use server"

import { CONNECT } from "@/lib/_db/db.config";
import { VerifyToken } from "@/lib/auth/verifyToken"
import { cookies } from "next/headers";
import { ServiceReturnType } from "@/__types__/service.types";
import { TRANSACTION } from "../(modals)/schema/transaction.schema";
import { USER } from "../(modals)/schema/user.schema";
import { UserType } from "@/__types__/user.types";
import { GatewayTypes, TransactionStatusType, TransactionType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";

/**
 * 
 * @note If you change the funciton name here you have to change in admin config collection also.
 */

// default channel =========================================
export const BTC = async (amount: number, TransactionID: string, method: string): ServiceReturnType => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        if(!token) return { valid: false, data: undefined }

        const {success, decoded=null} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false}

        if(amount < 500) throw new Error("Minimum amount is 500.")
        
        await CONNECT();

        // check if this transaction id already exists
        const isExists = await TRANSACTION.findOne({TransactionID});

        if(isExists) throw new Error("Invalid transaction id.");

        const userDetails = await USER.findOne({PhoneNumber: decoded.PhoneNumber}) as UserType;
          
        await TRANSACTION.create({
            PhoneNumber : decoded.PhoneNumber,
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

        if(amount < 500) throw new Error(`Minimum amount is $${(500/90).toFixed(2)}.`)
        
        await CONNECT();

        // check if this transaction id already exists
        const isExists = await TRANSACTION.findOne({TransactionID});

        if(isExists) throw new Error("Invalid transaction id.");

        const userDetails = await USER.findOne({PhoneNumber: decoded.PhoneNumber}) as UserType;
          
        await TRANSACTION.create({
            PhoneNumber : decoded.PhoneNumber,
            InvitationCode : userDetails.InvitationCode,
            Amount: (amount/90).toFixed(2),
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

        if(amount < 500) throw new Error("Minimum amount is 500.")
        
        await CONNECT();

        // check if this transaction id already exists
        const isExists = await TRANSACTION.findOne({TransactionID});

        if(isExists) throw new Error("Invalid transaction id.");

        const userDetails = await USER.findOne({PhoneNumber: decoded.PhoneNumber}) as UserType;
          
        await TRANSACTION.create({
            PhoneNumber : decoded.PhoneNumber,
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

export const getTransactionDetails = async (type: TransactionType ): ServiceReturnType<TransactionObjType[]> => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        if(!token) return { valid: false, data: undefined }

        const {success, decoded=null} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false}

        const depositDetails = await TRANSACTION.find({PhoneNumber: decoded.PhoneNumber, Type: type}, {Parent: 0, InvitationCode: 0, PhoneNumber: 0}).sort({createdAt: -1}).limit(50)

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