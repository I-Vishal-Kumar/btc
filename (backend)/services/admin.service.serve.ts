"use server"

import { CONNECT } from "@/lib/_db/db.config";
import { VerifyToken } from "@/lib/auth/verifyToken"
import { cookies } from "next/headers";
import { ServiceReturnType } from "@/__types__/service.types";
import { ADMIN_CONFIG } from "../(modals)/schema/adminConfig.schema";
import { AdminConfigType } from "@/__types__/admin.types";


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
