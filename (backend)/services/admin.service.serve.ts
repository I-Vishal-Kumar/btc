"use server"

import { CONNECT } from "@/lib/_db/db.config";
import { VerifyToken } from "@/lib/auth/verifyToken"
import { cookies } from "next/headers";
import { ServiceReturnType } from "@/__types__/service.types";
import { ADMIN_CONFIG } from "../(modals)/schema/adminConfig.schema";
import { AdminConfigType, ad_getUserInfoResType } from "@/__types__/admin.types";
import { USER } from "../(modals)/schema/user.schema";
import { TransactionStatusType, TransactionType, db_schema } from "@/__types__/db.types";
import { getTotalDetails } from "./user.service.serv";
import { TransactionObjType } from "@/__types__/transaction.types";
import { TRANSACTION } from "../(modals)/schema/transaction.schema";
import { startSession } from "mongoose";


// VERIFY ADMIN PASS ===============================

export const verifyAdminPass = async (Password: string):ServiceReturnType => {
    try {
        
        
        if(!Password) throw new Error("Incorrect password");
        
        await CONNECT();
        
        const isCorrectPass = await ADMIN_CONFIG.findOne({Password});
        
        if(isCorrectPass) return {valid: true, msg: 'Logged in successfully'}
        
        return {valid: false, msg: 'Incorrect Password.'}

    } catch (error) {
        return {valid: false, msg: 'Incorrect password.'}
    }
}

// ==========================

export const getAdminConfig = async (): ServiceReturnType<AdminConfigType> => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        if(!token) return { valid: false, data: undefined }

        const {success, decoded=null} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false}
        
        await CONNECT();

        const adminConfig = await ADMIN_CONFIG.find({}, {_id : 0, Password: 0})

        if(!adminConfig || !adminConfig.length) return {valid: false};

        return {valid: true, data: adminConfig[0].toObject() as AdminConfigType};

    } catch (error) {
        return {valid: false, operation: 'LOGOUT'}
    }
}




// GET USER INFO USING PHONE NUMBER =======================================

export const ad_getUserInfo = async ({PhoneNumber}:{PhoneNumber: string}): ServiceReturnType<ad_getUserInfoResType> => {
    try {
        
        await CONNECT();

        const userDetails = await USER.aggregate([
            {
                $match: {PhoneNumber: PhoneNumber}
            },
            {
                $project: {
                    Name: 1, PhoneNumber: 1, Balance: 1, InvitationCode: 1, Parent: 1,
                    Password: 1, Blocked: 1, createdAt: 1
                }
            },
            {
                $lookup : {
                    from : db_schema.USERS,
                    localField: "Parent",
                    foreignField: "InvitationCode",
                    as : "parentDetails"
                }
            },
            {
                $addFields: {
                    ParentInv: { $ifNull: [{ $arrayElemAt: ["$parentDetails.InvitationCode", 0] }, null] },
                    ParentPhoneNumber: { $ifNull: [{ $arrayElemAt: ["$parentDetails.PhoneNumber", 0] }, null] }
                }
            },
            {
                $project: {
                    Name: 1, PhoneNumber: 1, Balance: 1, InvitationCode: 1, ParentInv: 1, ParentPhoneNumber: 1,
                    Parent: 1, Password: 1, Blocked: 1, createdAt: 1
                }
            }
        ])

        if(!userDetails.length) throw new Error('date not found');

        const details =  await getTotalDetails(userDetails[0].InvitationCode);

        return {valid: true, data : JSON.parse(JSON.stringify({...userDetails[0], ...details}))}

    } catch (error) {
        console.log(error);
        return {valid: false, msg: 'Data not found', operation: 'LOGOUT'}
    }
}

// =======================================


// TOGGLE USDT GATEWAY VISIBILITY =================================================
type argsType = {key: string, newVal: unknown};
export const ad_editAdminConfig = async ({key, newVal}:argsType):ServiceReturnType<argsType> => {
    try {
        const isSet = await ADMIN_CONFIG.findOneAndUpdate({}, {
            $set: { [key] : newVal }
        })
        if(!isSet) throw new Error("failed");

        return {valid: true, msg: "Updated", data: {key, newVal}}

    } catch (error) {
        console.log(error);
        return {valid: false, msg: 'Failed to toggle.'}
    }

}

// =======================================

// GET ADMIN CONFIG ================================================================

export const ad_getAdminConfig = async (): ServiceReturnType<AdminConfigType> => {
    try {

        await CONNECT();

        const adminConfig = await ADMIN_CONFIG.find({}, {_id : 0, Password: 0})

        if(!adminConfig || !adminConfig.length) return {valid: false};

        return {valid: true, data: adminConfig[0].toObject() as AdminConfigType};

    } catch (error) {
        return {valid: false, operation: 'LOGOUT'}
    }
}


// ==========================================



// GET DEPOSIT TRANSACTIONS ========================================================

export const ad_getDepositTransactions = async ({ TransactionID='' , page = 1}): ServiceReturnType<TransactionObjType[]> => {
    try {
        
        await CONNECT();

        if(TransactionID){
            const details : TransactionObjType[] | null = await TRANSACTION.findOne({
                Type: TransactionType.DEPOSIT,
                TransactionID,
            }, {
                PhoneNumber: 1, 
                createdAt: 1,
                Amount : 1,
                TransactionID: 1,
                Method : 1,
                Status : 1
            })
            return {valid: true, data: [JSON.parse(JSON.stringify(details))]}
        }

        const pageSize = 10; // Number of records per page
        const skip = (page - 1) * pageSize;

        const details : TransactionObjType[] | null = await TRANSACTION.find({
            Type: TransactionType.DEPOSIT,
            Status : {$in : [TransactionStatusType.PENDING, TransactionStatusType.FAILED]}
        }, {
            PhoneNumber: 1, 
            createdAt: 1,
            Amount : 1,
            TransactionID: 1,
            Method : 1,
            Status : 1,
            Parent : 1
        }).sort({createdAt: -1}).skip(skip).limit(pageSize)

        if(!details) throw new Error('failed to get details');

        return {valid: true, data: JSON.parse(JSON.stringify(details)), pagination: {
            currentPage: page,
        }}

    } catch (error) {
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }
}

// ==========================================


// SETTLE DEPOSIT ===================================================================

const REFERAL_PERCENT = 8 / 100;
const FIRST_DEPOSIT_BONUS_PERCENT = 5 / 100;

export const ad_settleDeposit = async (editedDetails : TransactionObjType): ServiceReturnType => {
    
    const session = await startSession();
    session.startTransaction();

    try {
        
        if(editedDetails.Status === TransactionStatusType.PENDING) throw new Error('Please choose correct type.');

        const isTransactionUpdated = await TRANSACTION.findByIdAndUpdate(editedDetails._id, {
            Amount : editedDetails.Amount,
            Method : editedDetails.Method,
            TransactionID : editedDetails.TransactionID,
            Status : editedDetails.Status
        }, {session});

        if(!isTransactionUpdated) throw new Error("Failed to update transaction.");

        if(editedDetails.Status === TransactionStatusType.FAILED) {
            return {valid: true, msg: 'Updated'}
        }

        // check if first deposit.
        const user = await USER.findOne({PhoneNumber: editedDetails.PhoneNumber});

        const userUpdateOperations = [];

        if(!user.Deposited && user.Parent){
            // this is the first deposit of this user.
            // update the parent
            userUpdateOperations.push({
                updateOne : {
                    filter : {InvitationCode: user.Parent},
                    update : {
                        $inc : {
                            Level1Deposit : editedDetails.Amount,
                            ReferalCount : 1,
                            Balance : REFERAL_PERCENT * editedDetails.Amount,
                            Profit : REFERAL_PERCENT * editedDetails.Amount,
                        }
                    } 
                }
            })
        }

        userUpdateOperations.push({
            updateOne : {
                filter : {PhoneNumber : editedDetails.PhoneNumber},
                update : {
                    $set : {Deposited : true},
                    $inc : {
                        Balance : editedDetails.Amount + (!user.Deposited ? editedDetails.Amount * FIRST_DEPOSIT_BONUS_PERCENT : 0)
                    }
                }
            }
        })

        // Perform bulk update
        const bulkWriteResult = await USER.bulkWrite(userUpdateOperations, { session });

        // Validation: Ensure all updates were applied
        if (bulkWriteResult.modifiedCount !== userUpdateOperations.length) {
            throw new Error("Mismatch in expected updates. Transaction aborted.");
        }

        // Commit transaction
        await session.commitTransaction();
        return { valid: true, msg: 'Transaction settled successfully.' };


    } catch (error) {
        await session.abortTransaction();
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }
}

// ===========================================