"use server"

import { CONNECT } from "@/lib/_db/db.config";
import { VerifyToken } from "@/lib/auth/verifyToken"
import { cookies } from "next/headers";
import { ServiceReturnType } from "@/__types__/service.types";
import { WithdrawalOperationIdentifier, WithdrawalOperationIdentifierType } from "@/__types__/ui_types/profil.types";
import { WALLET } from "../(modals)/schema/userWalled.schema";
import { USER } from "../(modals)/schema/user.schema";
import { startSession } from "mongoose";
import { TRANSACTION } from "../(modals)/schema/transaction.schema";
import { TransactionStatusType, TransactionType } from "@/__types__/db.types";
import { DateTime } from "luxon";
import { ADMIN_CONFIG } from "../(modals)/schema/adminConfig.schema";
import { TransactionObjType } from "@/__types__/transaction.types";
import { UserWallet } from "@/__types__/user.types";
import { handleAutoWithdraw2 } from "@/lib/helpers/handleAuthWithdraw2";


const requiredDetails = {
    [WithdrawalOperationIdentifier.LOCAL_BANK_CREATION]: {
        AccHolderName   : { required: true, validation: /^[a-zA-Z\s]{3,}$/ },
        AccNumber       : { required: true, validation: /^[0-9]{9,18}$/ }, // 9-18 digit number
        IfscCode        : { required: true, validation: /^[A-Z]{4}0[A-Z0-9]{6}$/ }, // IFSC format
        BankName        : { required: true, validation: /^[a-zA-Z\s]{3,}$/ },
        Branch        : { required: true, validation: /^.{2,}$/ },
        LocalWithdrawPassword: { required: true, validation: /^.{6,}$/ }, // At least 6 characters
    },
    [WithdrawalOperationIdentifier.LOCAL_BANK_TRANSFER]: {
        Amount         : { required: true, validation: /^[1-9][0-9]*$/ }, // Must be a positive number
        WithdrawPassword: { required: true, validation: /^.{6,}$/ },
    },
    [WithdrawalOperationIdentifier.LOCAL_BANK_PASS_RESET]: {
        CurrWithdrawPassword: { required: true, validation: /^.{6,}$/ },
        NewWithdrawPassword : { required: true, validation: /^.{6,}$/ },
    },
    [WithdrawalOperationIdentifier.USDT_BANK_CREATION]: {
        UsdtAddress     : { required: true, validation: /^T[a-zA-Z0-9]{33}$/ }, // TRC20 format (example)
        UsdtWithdrawPassword: { required: true, validation: /^.{6,}$/ },
        AppName         : { required: true, validation: /^[a-zA-Z\s]{2,}$/ },
    },
    [WithdrawalOperationIdentifier.USDT_BANK_TRANSFER]: {
        Amount         : { required: true, validation: /^[1-9][0-9]*$/ },
        WithdrawPassword: { required: true, validation: /^.{6,}$/ },
    },
    [WithdrawalOperationIdentifier.USDT_BANK_PASS_RESET]: {
        CurrWithdrawPassword: { required: true, validation: /^.{6,}$/ },
        NewWithdrawPassword : { required: true, validation: /^.{6,}$/ },
    },
};

const _validateDataWithIdentifier = (identifier: WithdrawalOperationIdentifierType, data: Record<string, string>) => {
    
    if (!requiredDetails[identifier]) {
        return "Invalid operation identifier.";
    }

    const rules = requiredDetails[identifier] as Record<string, {required: boolean; validation: RegExp}>;

    for (const field in rules) {
        const { required, validation } = rules[field];

        const value = data[field]?.trim();

        if (required && !value) {
            return `${field} is required.`;
        }

        if (validation && !validation.test(value)) {
            return `Invalid ${field} format.`;
        }
    }

    return null; // No errors
};



// ================================== MAIN OPERATIONS ===============================

// works for both usdt and local
const createBank = async (identifier: WithdrawalOperationIdentifierType, PhoneNumber: string, data: Record<string, string>): ServiceReturnType => {
    try {
        
        await CONNECT();

        // check if this account number | wallet already exists.
        if(identifier === WithdrawalOperationIdentifier.LOCAL_BANK_CREATION){
            
            const AccNoExists = await WALLET.findOne({AccNumber: data.AccNumber, PhoneNumber : {$ne : PhoneNumber}});
            
            if (AccNoExists) throw new Error('This account is already registered with another user.');

        }else{
            // check for usdt address;
            const UsdtAddressExists = await WALLET.findOne({UsdtAddress: data.UsdtAddress, PhoneNumber : {$ne : PhoneNumber}});

            if(UsdtAddressExists) throw new Error("This USDT address is already registered with another user.");
        }

        // check if entry already exists 
        const exists = await WALLET.findOne({PhoneNumber});

        if(exists){
            
            delete data.LocalWithdrawPassword;
            delete data.UsdtWithdrawPassword;

            // user has added usdt wallet.
            const wasSuccess = await WALLET.findOneAndUpdate({PhoneNumber}, {
                $set : {...data}
            })

            if (!wasSuccess) throw new Error('Error updating details contact admin.');
            return {msg: "Details saved successfully.", valid: true }

        }

        // no wallet exists create a new wallet .
        const isCreated = await WALLET.create({...data, PhoneNumber});

        if(!isCreated) throw new Error('Error updating details contact admin.')

        return {msg: "Details saved successfully.", valid: true }

    } catch (error) {
        console.log(error);
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong', operation: 'LOGOUT'};
        return {valid: false, msg: error?.message || 'something went wrong'}
    }
}


// bank reset password works for both.
const resetPassword = async (identifier : WithdrawalOperationIdentifierType, PhoneNumber: string, data: Record<string,string>): ServiceReturnType => {
    try {
        
        const passDbKey = identifier === WithdrawalOperationIdentifier.LOCAL_BANK_PASS_RESET ? 'LocalWithdrawPassword' : 'UsdtWithdrawPassword';

        await CONNECT();

        // check if old password is correct.
        const isCorrect = await WALLET.findOne({PhoneNumber, [passDbKey] : data.CurrWithdrawPassword });

        if(!isCorrect) throw new Error("Your Old password is incorrect contact Admin.");

        const isUpdated = await WALLET.findOneAndUpdate({PhoneNumber, [passDbKey] : data.CurrWithdrawPassword }, {
            $set : {[passDbKey] : data.NewWithdrawPassword}
        });

        if(!isUpdated) throw new Error("Something went wrong while resetting password.");

        return {valid: true, msg: 'Password reset successfull'}

    } catch (error) {
        console.log(error);
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong', operation: 'LOGOUT'};
        return {valid: false, msg: error?.message || 'something went wrong'}
    }
}


// withdrawal 
const Withdrawal = async (identifier : WithdrawalOperationIdentifierType, PhoneNumber: string, data: Record<string, string> ): ServiceReturnType => {
    
    const session = await startSession();
    session.startTransaction();

    try {

        // used to determine and convert amount.
        const METHOD = identifier === WithdrawalOperationIdentifier.LOCAL_BANK_TRANSFER ? 'LOCAL' : 'USDT';
        let DbWithdrawalPassKey = 'LocalWithdrawPassword';

        const now = DateTime.now().setZone("Asia/Kolkata");
        const isSunday = now.weekday === 7;
        const isBetween9and11 = now.hour >= 9 && now.hour < 11;

        if(isSunday || !isBetween9and11) throw new Error("Withdrawal time is between 9am - 11am.");

        const Amount = Number(data.Amount);
        if(Amount < 600) throw new Error("Minimum withdrawal amount is 600");
        
        if(METHOD === 'USDT'){
            // change db key for usdt;
            DbWithdrawalPassKey = 'UsdtWithdrawPassword';
        }

        // check if already withdrawan today.
        const startOfDay = DateTime.now().setZone("utc").startOf("day").toJSDate();
        const endOfDay = DateTime.now().setZone("utc").endOf("day").toJSDate();
        
        await CONNECT();

        const existingTransaction = await TRANSACTION.findOne({
            PhoneNumber,
            Type: TransactionType.WITHDRAWAL,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if(existingTransaction) throw new Error("You have already withdrawn today.");

        // check if user has a bank account.
        const hasBank = await WALLET.findOne({PhoneNumber, [DbWithdrawalPassKey] : { $exists: true, $nin: [null, ""] } })
        
        if(!hasBank) throw new Error("You don't have a bank account.");

        const isBlocked = await USER.findOne({PhoneNumber, BlockWithdrawal: true});
        
        if(isBlocked) throw new Error("You cannot withdraw.");
        
        const userInfo = await USER.findOne({PhoneNumber});

        const tax = userInfo.HoldingScore > 600 ? 15 : 20  // if more than 600 then 15% tax else 20% tax.
        const taxableAmount = (Number(Amount) / 100) * Number(tax);
        
        // check if user has enough balance.
        const isSufficientBalance = await USER.findOne({PhoneNumber, Balance: {$gte : Amount + taxableAmount}});
        
        if(!isSufficientBalance) throw new Error(`You dont have enough balance. Required ₹ ${Amount + taxableAmount}.`);

        // check if withdrawal password is correct.
        const isPassCorrect = await WALLET.findOne({PhoneNumber, [DbWithdrawalPassKey] : data.WithdrawPassword});

        if(!isPassCorrect) throw new Error("Incorrect withdrawal password");

        // Process withdrawal --------------------------------------------------.

        // 1. deduct user balance.
        const isDeducted = await USER.findOneAndUpdate({PhoneNumber}, {
            $inc : {Balance : -(Number(Amount) + taxableAmount)}
        }, {session});

        if(!isDeducted) throw new Error("Could not process withdrawal this time.");

        // 2. increment parent level1 withdrawal.
        if(isSufficientBalance.Parent){

            const isIncremented = await USER.findOneAndUpdate({InvitationCode: isDeducted.Parent}, {
                $inc : {Level1Withdrawal: Amount}
            }, {session});
            
            if(!isIncremented) throw new Error('Could not process withdrawal this time.');
        
        }

        // 3. Create new withdrawal
        const isCreated = await TRANSACTION.create([{
            PhoneNumber,
            Method          : METHOD,
            TransactionID   : `${Date.now()}`,
            Amount          : Amount,
            Parent          : isDeducted.Parent,
            Type            : TransactionType.WITHDRAWAL,
            InvitationCode  : isDeducted.InvitationCode,
            Tax             : tax
        }],{session});


        if(!isCreated) throw new Error("Could not process withdrawal this time.")

        await session.commitTransaction();

        // after commiting the transaction check if auto withdraw is on
        // if yes then give withdraway asynchronously.
        const {AutoWithdraw} = await ADMIN_CONFIG.findOne({}, {AutoWithdraw : 1, _id : 0});

        if(AutoWithdraw && METHOD === 'LOCAL') processAutoWithdrawal(JSON.parse(JSON.stringify(isCreated[0])))

        return {valid: true, msg: 'Your Withdrawal is in processing.'}

    } catch (error) {
        console.log("Error while withdrawal", error);
        await session.abortTransaction();

        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong', operation: 'LOGOUT'};
        return {valid: false, msg: error?.message || 'something went wrong'}
    
    }  finally {
        await session.endSession();

    }
}

const processAutoWithdrawal = async (withdrawData : TransactionObjType) => {
    try {
        await CONNECT();
        // get wallet details of this user check if has a valid bank account or not.
        const bankDetails = await WALLET.findOne({PhoneNumber: withdrawData.PhoneNumber}) as UserWallet

        if(!bankDetails.AccNumber || !bankDetails.AccHolderName || !bankDetails.BankName || !bankDetails.IfscCode) {
            console.warn('[processAutoWithdrawal]', bankDetails)
            throw new Error("[processAutoWithdrawal] failed to process auto withdraw bank details not available");
        }

        const res = await handleAutoWithdraw2({
            payout: {
                AccountNo: bankDetails.AccNumber,
                Amount: Number(withdrawData.Amount),
                IFSC: bankDetails.IfscCode?.toUpperCase(),
                BeneName: bankDetails.AccHolderName,
                BeneMobile: withdrawData.PhoneNumber,
                APIRequestID: withdrawData.TransactionID,
            },
            editedData : {
                ...withdrawData,
                Status : TransactionStatusType.SUCCESS
            }
        })

        if (res.valid) {
            console.log('[processAutoWithdrawal] Auto withdrawal processed at ', new Date().toDateString(), res);
        } else{
            console.log('[processAutoWithdrawal] post request failed', res, withdrawData);
        }

    } catch (error) {
        console.error('[processAutoWithdrawal] Error while processing auto withdrawal', error, withdrawData)
    }
}
// ===================================================================================


export const _walletOperation = async ({data, _identifier}: {data: Record<string, string>, _identifier: WithdrawalOperationIdentifierType}): ServiceReturnType => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        if(!token) return { valid: false }

        const {success, decoded=null} = await VerifyToken(token);

        if(!success || !decoded) return {valid: false}
            
        const error = _validateDataWithIdentifier(_identifier, data);

        if(error) throw new Error(error);

       // Lookup table for functions
       const operationMap: Record<WithdrawalOperationIdentifierType, Function> = {
            [WithdrawalOperationIdentifier.LOCAL_BANK_CREATION]     : createBank,
            [WithdrawalOperationIdentifier.USDT_BANK_CREATION]      : createBank,
            [WithdrawalOperationIdentifier.LOCAL_BANK_PASS_RESET]   : resetPassword,
            [WithdrawalOperationIdentifier.USDT_BANK_PASS_RESET]    : resetPassword,
            [WithdrawalOperationIdentifier.LOCAL_BANK_TRANSFER]     : Withdrawal,
            [WithdrawalOperationIdentifier.USDT_BANK_TRANSFER]      : Withdrawal,
        };

        const operation = operationMap[_identifier];
        if (!operation) return { valid: false, msg: "Invalid request made." };

        return operation(_identifier, decoded.PhoneNumber as string, data);

    } catch (error) {
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong', operation: 'LOGOUT'};
        return {valid: false, msg: error?.message || 'something went wrong'}
    }
}
