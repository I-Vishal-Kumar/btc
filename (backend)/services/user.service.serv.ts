"use server"

import { CONNECT } from "@/lib/_db/db.config";
import { VerifyToken } from "@/lib/auth/verifyToken"
import { cookies } from "next/headers";
import { USER } from "@/(backend)/(modals)/schema/user.schema";
import { ServiceReturnType } from "@/__types__/service.types";
import { UserType, UserWallet } from "@/__types__/user.types";
import { DateTime } from "luxon";
import { WALLET } from "../(modals)/schema/userWalled.schema";


export const getUserDetails = async (): ServiceReturnType<UserType> => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        if(!token) return { valid: false, data: undefined }

        const {success, decoded=null} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false}
        
        await CONNECT();

        const dbUser = await USER.findOne({PhoneNumber: decoded.PhoneNumber}, {_id : 0, Session: 0, Password: 0, createdAt: 0, updatedAt: 0});

        if(!dbUser) return {valid: false};

        return {valid: true, data: dbUser?.toObject()};

    } catch (error) {
        return {valid: false, operation: 'LOGOUT'}
    }
}


// CLAIM PER DAY GIFT ===================================

export const claimGift = async (): ServiceReturnType<{GIFT_AMOUNT: number}> =>{
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || ''

        const {success, decoded} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false, operation: 'LOGOUT'}
        
        await CONNECT();

        const dbUser : UserType | null = await USER.findOne({PhoneNumber: decoded.PhoneNumber});

        if(!dbUser) throw new Error("Could not claim this time try again.");

        const today = DateTime.now().get('day');
        const lastSpinDate = dbUser.LastSpinAt ? DateTime.fromJSDate(new Date(dbUser.LastSpinAt)).get('day') : null;

        if(lastSpinDate && lastSpinDate === today) return {valid: false, msg: 'You can now claim tomorrow.'};

        // generate a random gift amount between 1 - 50
        const GIFT_AMOUNT = Number((Math.random() * (1 - 50) + 50).toFixed(2))
        
        await USER.findOneAndUpdate({PhoneNumber: decoded.PhoneNumber}, {
            $inc : {
                Balance    : GIFT_AMOUNT,
                Profit     : GIFT_AMOUNT,
            },
            $set : {
                LastSpinAt : DateTime.now().toISO()
            }
        })

        return {valid: true, data : {GIFT_AMOUNT}, msg: `You have won ${GIFT_AMOUNT} 🎉`}

    } catch (error) {
        if(error instanceof Error) return {valid: false, msg: error.message}
        return {valid: false, msg: 'Something went wrong.'}
    }
}

// ====================================



// GET USER WALLET DETAILS ==============================

export const getWalletDetails = async ():ServiceReturnType<UserWallet> => {
    try {   
        
        const cookie = await cookies();
        const token = cookie.get('token')?.value || ''

        const {success, decoded} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false, operation: 'LOGOUT'}
        
        await CONNECT();

        const walletDetails = await WALLET.findOne({PhoneNumber: decoded.PhoneNumber}, {UsdtWithdrawPassword: 0, LocalWithdrawPassword: 0, _id: 0});

        return {valid: true, data: walletDetails?.toObject() as UserWallet}
        
    } catch (error) {
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }
}

// ===========================================