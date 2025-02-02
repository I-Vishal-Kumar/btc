"use server";

import { USER } from "@/(backend)/(modals)/schema/user.schema";
import { CONNECT } from "@/lib/_db/db.config";
import { getInvitationCode } from "@/lib/auth/generateInvitationCode";
import { generateSessionToken } from "@/lib/auth/generateSessionToken";
import mongoose from "mongoose";
import { cookies } from "next/headers";

const ForgotPasswordDetails = ['PhoneNumber', 'OldPassword', 'NewPassword'] as const;
type ForgotPasswordDetails = Record<(typeof ForgotPasswordDetails)[number], string>;

const LoginRequiredDetails = ["PhoneNumber", "Password"] as const;
type LoginDetails = Record<(typeof LoginRequiredDetails)[number], string>;

const SignupRequiredDetails = [
    "PhoneNumber", "Password",
    "Parent", "Name",
] as const;

type SignupDetails = Record<(typeof SignupRequiredDetails)[number], string>;

const SetCookie = async (sess_token: string) => {
    const cookie = await cookies()

    cookie.set("token", `${ sess_token }`, {
        httpOnly: true,
        maxAge: Date.now() + 60 * 60 * 24, // one day in seconds
        secure: true
    })
}

// =============== SIGNUP
const SIGNUP = async (credentials: SignupDetails, sess_token: string) => {

    const session = await mongoose.startSession()
    session.startTransaction();

    try {

        // check if invitation code is correct.

        const validInvitationCode = await USER.findOneAndUpdate(
            { InvitationCode: credentials.Parent },
            { $inc: { ReferalCount: 1 } },
            { session }
        );

        if (!validInvitationCode) throw new Error("Invalid invitation code provided.");

        // invitation code was correct 

        // create a new invitation code for this new user.
        const InvitationCode = getInvitationCode();
        const user = await new USER({ ...credentials, InvitationCode, Session: `${ sess_token }` })

        await user.save();

        // save the token in header
        await SetCookie(sess_token);

        await session.commitTransaction();
        session.endSession();

        return true;
    } catch (error) {

        await session.abortTransaction();
        session.endSession();
        throw error;

    }

}


const authenticateUser = async (credentials: LoginDetails | SignupDetails, type: 'login' | 'signup') => {

    try {

        await CONNECT();

        const sess_token = await generateSessionToken({
            PhoneNumber: credentials.PhoneNumber
        });

        if (type === 'login') {

            let res = await USER.findOne(credentials);

            if (!res) throw new Error('Wrong password or username.');

            // update user in db;
            await USER.findOneAndUpdate(credentials, { Session: sess_token });

            // set session token in response header with expiry of oneDay and mark httpOnly.
            await SetCookie(sess_token);

            return { success: true };
        }

        // create a new Account for this user.
        if (type === 'signup') await SIGNUP(credentials as SignupDetails, sess_token);

        return { success: true };

    } catch (error) {

        if (error instanceof Error) {
            return { success: false, msg: error?.message || "Something went wrong." };
        } else return { success: false }

    }
};


const extractFormData = <T extends string>(
    formData: FormData,
    requiredFields: readonly T[]
): Record<T, string> | { error: string } => {

    const data = {} as Record<T, string>;

    for (const field of requiredFields) {
        const value = formData.get(field.toLowerCase());
        if (!value || typeof value !== "string" || !value.trim()) {
            return { error: `Required field "${ field }" is empty.` };
        }
        data[field] = value.trim();
    }
    return data;
};


// ================== ENTRY POINT & LOGIN 
export const userMutation = async (prevState: any, formData: FormData) => {
    try {

        const type = formData.get("type");
        if (type !== "login" && type !== "signup") {
            return { success: false, message: "Invalid request type." };
        }

        const requiredFields = type === "login" ? LoginRequiredDetails : SignupRequiredDetails;

        const data = extractFormData(formData, requiredFields);
        if ("error" in data) {
            return { success: false, message: data.error, error: data.error };
        }

        const { success, msg = null } = await authenticateUser(data, type);
        if (!success) {
            return {
                success, message: msg || 'something went wrong.',
                error: msg || 'something went wrong.',
            };
        }

        return { success: true, message: `${ type } Successful!` };
    } catch (error) {

        if (error instanceof Error) {
            return { success: false, msg: error?.message || "Something went wrong." };
        } else return { success: false, msg: 'An unexpected error occured.' }

    }
};


// =========== FORGOT PASSWORD
export const forgotPassword = async (prevState: any, formData: FormData) => {
    try {

        const data = extractFormData(formData, ForgotPasswordDetails);
        if ("error" in data) {
            return { success: false, message: data.error, error: data.error };
        }

        const isResetSuccess = await USER.findOneAndUpdate({
            PhoneNumber: data.PhoneNumber,
            Password: data.OldPassword
        }, { Password: data.NewPassword });

        if (isResetSuccess) throw new Error("Wrong old password or phone number.");
        return { success: true, msg: 'Password reset successfull LOGIN NOW. ' }

    } catch (error) {

        if (error instanceof Error) {
            return { success: false, msg: error?.message || "Something went wrong." };
        } else return { success: false, msg: 'An unexpected error occured.' }

    }
}