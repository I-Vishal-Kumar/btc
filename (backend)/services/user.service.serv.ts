"use server"

import { CONNECT } from "@/lib/_db/db.config";
import { VerifyToken } from "@/lib/auth/verifyToken"
import { cookies } from "next/headers";
import { USER } from "@/(backend)/(modals)/schema/user.schema";
import { ServiceReturnType } from "@/__types__/service.types";
import { UserType } from "@/__types__/user.types";


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

        console.log(error);
        return {valid: false}
    }
}
