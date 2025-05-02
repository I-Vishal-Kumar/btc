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
import { IncomeType, TransactionObjType, adminWithdrawalRespType } from "@/__types__/transaction.types";
import { TRANSACTION } from "../(modals)/schema/transaction.schema";
import { startSession } from "mongoose";
import { UserType, UserWallet } from "@/__types__/user.types";
import { WALLET } from "../(modals)/schema/userWalled.schema";
import { randomBytes } from "crypto";
import { INCOME } from "../(modals)/schema/incomeConfig.schema";


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
            Status : TransactionStatusType.PENDING
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

        let amount = editedDetails.Amount;

        if(editedDetails.Method === 'USDT'){
            amount *= 89;
        }

        const isTransactionUpdated = await TRANSACTION.findByIdAndUpdate(editedDetails._id, {
            Amount : amount,
            Method : editedDetails.Method,
            TransactionID : editedDetails.TransactionID,
            Status : editedDetails.Status
        }, {session});

        if(!isTransactionUpdated) throw new Error("Failed to update transaction.");

        if(editedDetails.Status === TransactionStatusType.FAILED) {
            await session.commitTransaction();
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
                            Level1Deposit : amount,
                            Balance : REFERAL_PERCENT * amount,
                            Profit : REFERAL_PERCENT * amount,
                        }
                    } 
                }
            })

            const parentDetails : UserType | null = await USER.findOne({InvitationCode : user.Parent});
            if(parentDetails){
                await INCOME.create([
                    {
                        PhoneNumber : parentDetails.PhoneNumber,
                        InvitationCode : parentDetails.InvitationCode,
                        Parent : parentDetails.Parent,
                        Type : IncomeType.REFERAL_INCOME,
                        From : user.InvitationCode,
                        Amount : REFERAL_PERCENT * amount
                    }
                ], {session})
            }
        }

        userUpdateOperations.push({
            updateOne : {
                filter : {PhoneNumber : editedDetails.PhoneNumber},
                update : {
                   ...( !user.Deposited ?  {$set : {Deposited : true}} : {}),
                    $inc : {
                        Balance : amount + (!user.Deposited ? amount * FIRST_DEPOSIT_BONUS_PERCENT : 0)
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
    } finally {
        await session.endSession();
    }
}

// ===========================================





// GET WITHDRAWAL TRANSACTIONS ========================================================

export const ad_getWithdrawalTransactions = async ({ TransactionID='' , page = 1}): ServiceReturnType<adminWithdrawalRespType[]> => {
    try {
        
        await CONNECT();
   
        if(TransactionID){
            const details : adminWithdrawalRespType[] | null = await TRANSACTION.aggregate([
                {
                    $match : {
                        Type: TransactionType.WITHDRAWAL,
                        TransactionID
                    }
                },
                {
                    $lookup : {
                        from: db_schema.WALLET,
                        localField : "PhoneNumber",
                        foreignField: "PhoneNumber",
                        as : "walletDetails"
                    }
                },
                {
                    $set: { 
                        walletDetails: { 
                            $arrayElemAt: [{ $ifNull: ["$walletDetails", []] }, 0] 
                        } 
                    }
                },
                {
                    $project : {
                        updatedAt : 0,
                        "walletDetails.createdAt" : 0,
                        "walletDetails.updatedAt" : 0,
                        "walletDetails._id" : 0,
                        "walletDetails.PhoneNumber" : 0,
                    }
                }
            ]);
    
            return {valid: true, data: JSON.parse(JSON.stringify(details))}
        }

        const pageSize = 10; // Number of records per page
        const skip = (page - 1) * pageSize;

        const details : adminWithdrawalRespType[] | null = await TRANSACTION.aggregate([
            {
                $match : {
                    Type: TransactionType.WITHDRAWAL,
                    Status: TransactionStatusType.PENDING
                }
            },
            {
                $lookup : {
                    from: db_schema.WALLET,
                    localField : "PhoneNumber",
                    foreignField: "PhoneNumber",
                    as : "walletDetails"
                }
            },
            {
                $set: { 
                    walletDetails: { 
                        $arrayElemAt: [{ $ifNull: ["$walletDetails", []] }, 0] 
                    } 
                }
            },
            {
                $project : {
                    updatedAt : 0,
                    "walletDetails.createdAt" : 0,
                    "walletDetails.updatedAt" : 0,
                    "walletDetails._id" : 0,
                    "walletDetails.PhoneNumber" : 0,
                }
            }
        ]).sort({createdAt: -1}).skip(skip).limit(pageSize)

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

// SETTLE WITHDRAWAL TRANSACTIONS =====================================================

export const ad_settleWithdrawal = async (editedDetails : TransactionObjType): ServiceReturnType => {
    
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
            // reupdate the user's balance and return.
            const isUpdated = await USER.findOneAndUpdate(
                {PhoneNumber: editedDetails.PhoneNumber},
                {$inc : {Balance : editedDetails.Amount}}, 
                {session}
            );
            
            if(!isUpdated) throw new Error("Somthing went wrong");
            
            await session.commitTransaction();
            return {valid: true, msg: 'Updated'}
        }

        // check if first deposit.
        const user = await USER.findOne({PhoneNumber: editedDetails.PhoneNumber});

        if(user.Parent){
            // this is the first deposit of this user.
            // update the parent
            const isPrentUpdated = await USER.findOneAndUpdate(
                {InvitationCode: user.Parent},
                {$inc : {Level1Withdrawal : editedDetails.Amount}},
                {session}
            );
            if(!isPrentUpdated) throw new Error("Failed to update parent.");
        }

        // Commit transaction
        await session.commitTransaction();
        return { valid: true, msg: 'Transaction settled successfully.' };


    } catch (error) {
        await session.abortTransaction();
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }finally{
        await session.endSession();
    }
}

// ===========================================


// GET USER WALLET =====================================================================

export const ad_getUserWallet = async ({ PhoneNumber }:{PhoneNumber : string}): ServiceReturnType<UserWallet> => {
    try {
        
        await CONNECT();

        const details : UserWallet[] | null = await WALLET.findOne({PhoneNumber}, {updatedAt: 0});
    
        if(!details) throw new Error('failed to get details');

        return {valid: true, data: JSON.parse(JSON.stringify(details))}

    } catch (error) {
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }
}

export const ad_editUserWallet = async (editedDetails : UserWallet): ServiceReturnType => {
    try {
        
        await CONNECT();
        
        const isUpdated : UserWallet[] | null = await WALLET.findOneAndUpdate({PhoneNumber: editedDetails.PhoneNumber}, 
            {
                $set: {
                    ...editedDetails
                }
            }
        );
    
        if(!isUpdated) throw new Error('failed to get details');

        return {valid: true, msg: 'updated'}

    } catch (error) {
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }
}

// ==============================================================



// GET USER PASSWORD INFO =================================================================

export const ad_getUserPassInfo = async ({ PhoneNumber }:{PhoneNumber : string}): ServiceReturnType<UserType> => {
    try {
        
        await CONNECT();

        const details : UserType | null = await USER.findOne({PhoneNumber}, {PhoneNumber: 1, Password: 1, Name: 1, Blocked : 1});
    
        if(!details) throw new Error('failed to get details');

        return {valid: true, data: JSON.parse(JSON.stringify(details))}

    } catch (error) {
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }
}


export const ad_editPassword = async (editedDetails : UserType): ServiceReturnType => {
    try {
        
        await CONNECT();
        
        const isUpdated : UserWallet[] | null = await USER.findOneAndUpdate({PhoneNumber: editedDetails.PhoneNumber}, 
            {
                $set: {Password: editedDetails.Password}
            }
        );
    
        if(!isUpdated) throw new Error('failed to get details');

        return {valid: true, msg: 'updated'}

    } catch (error) {
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }
}

// =============================================


// ADD BONUS ===============================================================

type BonusDetailsType = {
    PhoneNumber: string,
    Amount: number,
}

export const ad_addBonus = async (editedDetails : BonusDetailsType) => {
    const session = await startSession();
    session.startTransaction();
    
    try {
        
        await CONNECT();
        
        // try finding the user.

        const user = await USER.findOne({PhoneNumber: editedDetails.PhoneNumber});

        if(!user) throw new Error("Invalid phone number");

        const isCreated = await TRANSACTION.create([{
            ...editedDetails,
            Parent : user.Parent,
            InvitationCode : user.InvitationCode,
            Type : TransactionType.GIFT,
            Method : 'AD-TRANSFER',
            TransactionID : randomBytes(16).toString('hex'),
            Status : TransactionStatusType.SUCCESS
        }], {session});


        if(!isCreated) throw new Error("failed to send gifts");

        const isUpdated : UserWallet[] | null = await USER.findOneAndUpdate({PhoneNumber: editedDetails.PhoneNumber}, 
            {$inc: {Balance: editedDetails.Amount}},
            {session}
        );
    
        if(!isUpdated) throw new Error('failed to get details');
        
        await session.commitTransaction();
        return {valid: true, msg: 'updated'}

    } catch (error) {
        await session.abortTransaction();
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }finally{
        session.endSession();
    }
}

// =============================================

// BLOCK UNBLOCK USER =====================================================

export const ad_getBlockedUsers = async (): ServiceReturnType<UserType[]> => {
    try {
        
        await CONNECT();
        
        const details : UserType[] | null = await USER.find({Blocked: true}, {PhoneNumber: 1, Name: 1, Blocked: 1});
    
        if(!details) throw new Error('failed to get details');

        return {valid: true, data : JSON.parse(JSON.stringify(details))}

    } catch (error) {
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }
}
export const ad_blockUnblock = async (editedDetails : UserType): ServiceReturnType => {
    try {
        
        await CONNECT();
        
        const isUpdated : UserWallet[] | null = await USER.findOneAndUpdate({PhoneNumber: editedDetails.PhoneNumber}, 
            {
                $set: {Blocked : editedDetails.Blocked}
            }
        );
    
        if(!isUpdated) throw new Error('failed to get details');

        return {valid: true, msg: 'updated'}

    } catch (error) {
        if(error instanceof Error) return {valid: false, msg: error.message, operation: 'LOGOUT'}
        return {valid: false, msg: 'Something went wrong.'}
    }
}

// =============================================
