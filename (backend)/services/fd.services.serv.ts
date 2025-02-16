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
import { FdStatus } from "@/__types__/db.types";

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
        const fds : FD_type[] = await FD.find({PhoneNumber: decoded.PhoneNumber});

        if(!fds) throw new Error("Could not able to get FD this time.");

        // Get the current date (ignoring time)
        const today = DateTime.utc().startOf("day");

        // Array to store matured FDs
        const maturedFDs: FD_type[] = [];

        // Process FDs
        for (const fd of fds) {
            const createdAt = DateTime.fromJSDate( new Date(fd.createdAt)).startOf("day"); // FD creation date
            const maturityDate = createdAt.plus({ days: fd.FdDuration }); // Maturity date

            // Check if FD has matured
            if (today >= maturityDate && fd.FdStatus !== FdStatus.MATURED && fd.FdStatus !== FdStatus.HALTED) {
                fd.MaturedOn = DateTime.now().toISO();
                fd.FdStatus = FdStatus.MATURED;
                maturedFDs.push(fd);
            }
        }

        // process all fds at once.
        Promise.all(maturedFDs.map(fd => handleMaturedFD(fd)));

        return {valid: true, data: fds}

    }catch(error){

        if(!(error instanceof Error)) return {valid: false, msg: 'something went wrong'};
        return {valid: false, msg: error?.message || 'something went wrong', operation: 'LOGOUT'}
    
    }
}

async function handleMaturedFD(fd: FD_type){
    try {

        await FD.findOneAndUpdate({_id: fd._id}, {
            $set: {
                FdStatus: FdStatus.MATURED,
                MaturedOn: DateTime.now().toISO()
            }
        })
    } catch (error) {
        console.log('error while setting fd matured.', error, fd.PhoneNumber);
    }
}