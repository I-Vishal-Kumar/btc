import { InvitationCodeType, NameType, PasswordType, PhoneNumberType, PrecisionNumberType, ReferalCountType, db_schema } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";



const USER_SCHEMA = new Schema({
    
    Parent : InvitationCodeType,
    
    InvitationCode: InvitationCodeType,  // 8 digit random code (unique);

    Name: NameType,

    Password: PasswordType,

    Balance: PrecisionNumberType,

    Profit : PrecisionNumberType,

    PhoneNumber: PhoneNumberType,
    
    ReferalCount: ReferalCountType,  // number of users joined using invitation code of any user.
 
    Session: String
}, { timestamps: true });

export const USER = models?.[db_schema.USERS] || model(db_schema.USERS, USER_SCHEMA)