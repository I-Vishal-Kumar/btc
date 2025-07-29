"use server";

import { USER } from "@/(backend)/(modals)/schema/user.schema";
import { CONNECT } from "@/lib/_db/db.config";
import { getInvitationCode } from "@/lib/auth/generateInvitationCode";
import { generateSessionToken } from "@/lib/auth/generateSessionToken";
import mongoose from "mongoose";
import { cookies } from "next/headers";

const ForgotPasswordRequiredDetails = ['PhoneNumber', 'OldPassword', 'NewPassword'] as const;
type ForgotPasswordDetails = Record<(typeof ForgotPasswordRequiredDetails)[number], string>;

type AvailableMutations = 'login' | 'signup' | 'forget-password';

const LoginRequiredDetails = ["PhoneNumber", "Password"] as const;
type LoginDetails = Record<(typeof LoginRequiredDetails)[number], string>;

const SignupRequiredDetails = [
    "PhoneNumber", "Password",
    "Name",
] as const;

type SignupDetails = Record<(typeof SignupRequiredDetails)[number], string>;

// helper to set the cookie if login/signup was a success.
const SetCookie = async (sess_token: string) => {
    const cookie = await cookies()

    cookie.set("token", `${ sess_token }`, {
        // httpOnly: true,
        maxAge: Date.now() + 60 * 60 * 24, // one day in seconds
        // secure: true
    })
}

// helper to extract form data.
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


// =========== FORGOT PASSWORD
const FORGOT_PASSWORD = async (credentials: ForgotPasswordDetails) => {
    try {
        await CONNECT();
        const isResetSuccess = await USER.findOneAndUpdate({
            PhoneNumber: credentials.PhoneNumber,
            Password: credentials.OldPassword
        }, { Password: credentials.NewPassword });

        if (!isResetSuccess) throw new Error("Wrong old password or phone number.");
        return { success: true, msg: 'Password reset successfull LOGIN NOW. ' }

    } catch (error) {

        if (error instanceof Error) {
            return { success: false, msg: error?.message || "Something went wrong." };
        } else return { success: false, msg: 'An unexpected error occured.' }

    }
}


// =============== SIGNUP
const SIGNUP = async (credentials: SignupDetails & { Parent?: string }) => {

    try {
        await CONNECT();
        const sess_token = await generateSessionToken({ PhoneNumber: credentials.PhoneNumber });

        // check if invitation code is correct.
        const validInvitationCode = await USER.findOne({ InvitationCode: credentials?.Parent });

        // invitation code was correct 
        if (credentials.Parent && !validInvitationCode) throw new Error("Invalid invitation code provided.");

        if (credentials.Parent) {
            await USER.findOneAndUpdate({ InvitationCode: credentials.Parent }, {
                $inc: {
                    ReferalCount: 1
                }
            });
        }

        // create a new invitation code for this new user.
        const InvitationCode = getInvitationCode();

        if (!credentials.Parent) delete credentials.Parent;

        const user = await new USER({ ...credentials, InvitationCode, Session: `${ sess_token }` })

        await user.save();

        // save the token in header
        await SetCookie(sess_token);

        return { success: true };
    } catch (error) {
        throw error;
    }

}


// LOGIN 
const LOGIN = async (credentials: LoginDetails) => {
    try {
        await CONNECT();

        const sess_token = await generateSessionToken({ PhoneNumber: credentials.PhoneNumber });

        let res = await USER.findOne(credentials);

        if (!res) throw new Error('Wrong password or username.');

        if (res.Blocked) throw new Error("You have been BLOCKED");

        // update user in db;
        await USER.findOneAndUpdate(credentials, { Session: sess_token });

        // set session token in response header with expiry of oneDay and mark httpOnly.
        await SetCookie(sess_token);
        return { success: true };

    } catch (error) {

        if (error instanceof Error)
            return { success: false, msg: error?.message || 'Error while login please try again.' };
        else
            return { success: false, msg: 'Error while login please try again.' };

    }
}


// HOF to handle session lifecycle
const withSession = async (credentials: LoginDetails | SignupDetails, type: AvailableMutations, startSession = false) => {

    let session = null;

    if (startSession) {
        session = await mongoose.startSession();
        session.startTransaction();
    }

    try {

        // make a db connection
        await CONNECT();

        // Dynamically choose the appropriate function based on the type
        let action: (credentials: any, session: mongoose.ClientSession | null) => Promise<{ success: boolean, msg?: string }>;

        if (type === 'login') {
            action = LOGIN; // LOGIN expects LoginDetails
        } else if (type === 'signup') {
            action = SIGNUP; // SIGNUP expects SignupDetails
        } else if (type === 'forget-password') {
            action = FORGOT_PASSWORD;
        } else {
            throw new Error(`Invalid action type: ${ type }`);
        }

        const { success, msg = "somthing went wrong" } = await action(credentials, session);

        if (!success) throw new Error(msg)

        if (startSession && session) await session.commitTransaction();

        return { success: true, msg: `${ type } successful!` };

    } catch (error) {
        if (startSession && session) await session.abortTransaction();
        throw error; // Re-throw the error to be handled upstream
    } finally {
        if (startSession && session) await session.endSession();
    }
};

// Helper function to handle required details and session creation
const withRequiredDetails = async (formData: FormData, type: AvailableMutations) => {

    const requiredFields = ({
        'login': LoginRequiredDetails,
        'signup': SignupRequiredDetails,
        'forget-password': ForgotPasswordRequiredDetails
    })[type]

    const requiredDetails = extractFormData(formData, requiredFields);

    if ('error' in requiredDetails) {
        return { success: false, msg: `Error: ${ requiredDetails.error }` };
    }

    try {
        // ['signup'].includes(type)
        return await withSession({ ...requiredDetails, ...(type === 'signup' && { Parent: formData.get('parent') }) }, type);

    } catch (error: unknown) {
        if (error instanceof Error)
            return { success: false, msg: error?.message || 'Error generating session token.' };
        else
            return { success: false, msg: 'Error generating session token.' };
    }

};

// Main mutation function
export const init_user_auth_mutation = async (_: any, formData: FormData) => {

    const type_of_mutation = (formData.get('type') || 'unknown') as AvailableMutations & 'unknown';

    if (!['login', 'signup', 'forget-password'].includes(type_of_mutation)) {
        return { success: false, msg: 'Invalid mutation type.' };
    }

    try {
        return await withRequiredDetails(formData, type_of_mutation as AvailableMutations);
    } catch (error) {
        if (error instanceof Error)
            return { success: false, msg: error?.message || 'Unexpected error occurred.' };
        else
            return { success: false, msg: 'Unexpected error occurred.' };
    }

};
