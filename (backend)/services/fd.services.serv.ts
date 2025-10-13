"use server"

import { ServiceReturnType } from "@/__types__/service.types";
import { UserType } from "@/__types__/user.types";
import { CONNECT } from "@/lib/_db/db.config";
import { VerifyToken } from "@/lib/auth/verifyToken";
import { startSession } from "mongoose";
import { cookies} from "next/headers";
import { FD } from "../(modals)/schema/fixedDeposit.schema";
import { USER } from "../(modals)/schema/user.schema";
import { FD_type } from "@/__types__/fd.types";
import { DateTime } from "luxon";
import { FdStatus, FdStatusType } from "@/__types__/db.types";
import { INCOME } from "../(modals)/schema/incomeConfig.schema";
import { IncomeType } from "@/__types__/transaction.types";
import { TRANSACTION } from "../(modals)/schema/transaction.schema";

function extractNumbers(plan: string): { days: number; profit: number } | null {
    const match = plan.match(/^(\d+)day@([\d.]+)%$/);
    if (!match) return null;
  
    return {
      days: parseInt(match[1], 10), // Extract days as a number
      profit: parseFloat(match[2]), // Extract profit as a number
    };
}



type requiredTypes = {FD_amount: number, duration: string}

// CREATE FIXED DEPOSIT --------------------------------------------------
export const createFD = async ({FD_amount, duration}: requiredTypes) : ServiceReturnType => {

    const session = await startSession();

    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || "";

        const {success, decoded} = await VerifyToken(token);

        if(!success || !decoded) throw new Error("Invalid token provided.");

        await CONNECT();

        const dbUser: UserType | null = await USER.findOne({
            PhoneNumber : decoded.PhoneNumber,
            Balance     : {$gte : FD_amount } 
        }, {_id : 0})

        if(!dbUser) throw new Error("Low balance.");

        const {days, profit} = extractNumbers(duration) || {};

        if(!days || !profit) throw new Error("Invalid plan selected");

        session.startTransaction();

        const fd = await FD.create([{
            PhoneNumber   : dbUser.PhoneNumber,
            InvitationCode: dbUser.InvitationCode,
            Parent        : dbUser.Parent,
            FdAmount      : FD_amount,
            FdDuration    : days,
            InterestRate  : profit,
            LastClaimedOn : ''
        }], {session});

        if(!fd) throw new Error('Something went wrong');

        await USER.findOneAndUpdate({PhoneNumber: dbUser.PhoneNumber}, {
            $inc: {Balance: -FD_amount},
        }, {session})

        await session.commitTransaction();

        return {valid: true, msg: 'Fd created successfully.'}

    } catch (error) {
    
        if(session && session.inTransaction()) await session.abortTransaction();
    
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong'};
        return {valid: false, msg: error?.message || 'something went wrong', operation: 'LOGOUT'}
    
    } finally {

        await session.endSession();
        
    }
}


// GET CREATED FIXED DEPOSIT ----------------------------------------------
export const getFD = async () : ServiceReturnType<FD_type[]> => {
    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || '';

        const {success, decoded} = await VerifyToken(token);

        if(!success || !decoded) throw new Error("Something went wrong");

        // get all FDs for the user.
        const endOf12th = DateTime.fromJSDate(new Date("2025-10-12")).endOf('day');
        const closingDate = DateTime.fromJSDate(new Date("2025-08-09")).startOf('day');

        // latest fds
        let fds = await FD.find({PhoneNumber: decoded.PhoneNumber, createdAt : {$gt : endOf12th}});

        // old fds only get these fds if this person has a deposit within starting of 12 and closing date.
        const hasDeposited = await TRANSACTION.countDocuments({createdAt : {
            $gte : closingDate,
            $lte : endOf12th,
        }, PhoneNumber: decoded.PhoneNumber});

        if(hasDeposited){
            const oldFds = await FD.find({PhoneNumber: decoded.PhoneNumber, createdAt : {$lt : endOf12th}}).sort({createdAt: -1}).lean() as unknown as FD_type[]; 
            fds = [...fds, ...oldFds];
        }

        if(!fds) throw new Error("Could not able to get FD this time.");

        // Get the current date (ignoring time)
        const today = DateTime.utc().startOf("day");

        // Array to store matured FDs
        const maturedFDs: FD_type[] = [];

        // Process FDs
        for (const fd of fds) {
            const createdAt = DateTime.fromJSDate(fd.createdAt as unknown as Date).toUTC().startOf("day"); // FD creation date
            const maturityDate = createdAt.plus({ days: fd.FdDuration }); // Maturity date

            // Check if FD has matured
            if (today >= maturityDate && !fd.Claimed && fd.FdStatus !== FdStatus.MATURED && fd.FdStatus !== FdStatus.HALTED) {
                fd.MaturedOn = DateTime.now().toISO();
                fd.FdStatus = FdStatus.MATURED;
                maturedFDs.push(fd);
            }
        }

        // process all fds at once.
        await Promise.all(maturedFDs.map(fd => handleMaturedFD(fd)));

        return {valid: true, data: fds}

    }catch(error){

        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong'};
        return {valid: false, msg: error?.message || 'something went wrong', operation: 'LOGOUT'}
    
    }
}

// CLAIM PER DAY FD.
export const claimFD = async ({_id}:{_id: string}): ServiceReturnType => {

    try {

        const cookie = await cookies();
        const token = cookie.get('token')?.value || '';

        const {success, decoded} = await VerifyToken(token);

        if(!success || !decoded) throw new Error("Something went wrong");
        
        await CONNECT();

        const fd : FD_type | null = await FD.findOne({_id});

        if(!fd) throw new Error('Could not claim this time try again.');

        const today = DateTime.utc().startOf("day");
        const createdAt = DateTime.fromJSDate(fd.createdAt as unknown as Date).toUTC().startOf("day"); // FD creation date
        const maturityDate = createdAt.plus({ days: fd.FdDuration }); // Maturity date
        
        // check if user has claimed today or not.        
        const lastClaimedDate = fd.LastClaimedOn ? DateTime.fromJSDate(fd.LastClaimedOn as unknown as Date).toUTC().startOf("day") : null;
        const shouldClaimToday = (!lastClaimedDate || lastClaimedDate < today ) && !(([FdStatus.CLAIMED, FdStatus.HALTED] as string[]).includes(fd.FdStatus as FdStatusType));

        console.log(lastClaimedDate?.toFormat('yyyy LLL dd HH:mm:ss a'), " todya -", today.toFormat('yyyy LLL dd HH:mm:ss a'), 'last claimed date', fd.LastClaimedOn)
        if(!shouldClaimToday || fd.Claimed) throw new Error('You have already claimed for this fd.');

        // process the profits.
        const isSuccess = await _processFDclaim(fd);

        if(!isSuccess) throw new Error("something went wrong while claim.");

        // check if fd has matured. 
        if(fd.FdStatus === FdStatus.MATURED && maturityDate <= today){
            // update the user balance with total amount
            await USER.findOneAndUpdate(
                {PhoneNumber: fd.PhoneNumber},
                {$inc: {Balance: fd.FdAmount}}
            );   
        }

        if(isSuccess) return {valid: true, msg: 'FD claimed successfully'};
        return {valid: false, msg: 'Something went wrong while claiming fd contact admin'};

    } catch (error) {
        console.error("claimFD error:", error);
        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong'};
        return {valid: false, msg: error?.message || 'something went wrong', operation: 'LOGOUT'}
    }
}
// Only update the profit 
async function _processFDclaim(fd: FD_type){

    let session = await startSession();
    session.startTransaction();
    
    try {
        
        let parent : string | null = fd.Parent;
        const PROFIT_DISTRIBUTION = [4, 3, 2, 1, 1, 1];
        let processingLevel = 1;

        let update_user_arr = [];
        
        // calculate one day profit.
        const profit =  (Number(fd.InterestRate)/100) * Number(fd.FdAmount); 

        while(parent && processingLevel <= 6){

            const parentInfo:UserType | null = await USER.findOne({InvitationCode: parent}, {Parent: 1, DirectActiveMembers: 1}).session(session);
            
            if(!parentInfo) throw new Error("Something went wrong please try again.");

            if(parentInfo && parentInfo.Parent && parentInfo.DirectActiveMembers >= processingLevel){
                const parentCommission = (profit / 100) * PROFIT_DISTRIBUTION[processingLevel-1];
                
                update_user_arr.push({
                    updateOne : {
                        filter: {InvitationCode: parent},
                        update: {
                            $inc: {
                                Commission: parentCommission,
                                Balance: parentCommission,
                             }, 
                        }
                    }
                })
            }

            processingLevel++;
            parent = parentInfo?.Parent || null;

        }

        // check if user has already claimed a fd today if yes then no need to update holding.
        const startOfDay = DateTime.now().setZone("utc").startOf("day").toJSDate();
        const endOfDay = DateTime.now().setZone("utc").endOf("day").toJSDate();
        
        
        const alreadyClaimedHoldingToday = await FD.findOne({
            PhoneNumber : fd.PhoneNumber,
            LastClaimedOn: { $gte: startOfDay, $lte: endOfDay }
        });

        // push to update current user balance and profit
        update_user_arr.push({
            updateOne: {
                filter: {PhoneNumber: fd.PhoneNumber},
                update: {
                    $inc : {
                        Balance     : profit,
                        Profit      : profit,
                        ...(!alreadyClaimedHoldingToday && {HoldingScore: 10 } || {})
                    }
                }
            }
        })

        const bulkResult = await USER.bulkWrite(update_user_arr, {session});
        if(bulkResult.modifiedCount !== update_user_arr.length){
            // some updates failed.
            throw new Error("Could not claim this time try again");
        }

        // add income information for this user.
        await INCOME.create([
            {
                PhoneNumber : fd.PhoneNumber,
                InvitationCode : fd.InvitationCode,
                Parent : fd.Parent,
                Type : IncomeType.DAILY_INCOME,
                Amount : profit
            }
        ], {session})

        const isUpdated = await FD.findOneAndUpdate({_id: fd._id}, {
            $set: {
                LastClaimedOn: DateTime.utc().toJSDate(),
                ...(fd.FdStatus === FdStatus.MATURED && {
                    Claimed : true,
                    FdStatus : FdStatus.CLAIMED,
                    MaturedOn: DateTime.utc().toJSDate(),
                })
            }
        }, {session, new: true})

        if(!isUpdated) throw new Error("FD update failed try again.");

        await session.commitTransaction();
        return true;

    } catch (error) {
        console.error("Error while claiming FD id ", fd._id, error);
        await session.abortTransaction();
        return false;
    
    }finally{

        await session.endSession();
    
    }

}

// helper to update matured fd.
async function handleMaturedFD(fd: FD_type){
    try {

        await FD.findOneAndUpdate({_id: fd._id}, {
            $set: {
                FdStatus: FdStatus.MATURED,
                MaturedOn: DateTime.utc().toJSDate()
            }
        })
    } catch (error) {
        console.log('error while setting fd matured.', error, fd.PhoneNumber);
    }
}


// book profit . 

export async function bookFdProfit({id}:{id: string}){
    try {
        await FD.findOneAndUpdate({_id: id}, {
            $set : {
                FdStatus : FdStatus.HALTED,
                LastClaimedOn: DateTime.utc().toJSDate()
            }
        })
    } catch (error) {
        console.log('[bookFdProfit]', error);   
    }
}