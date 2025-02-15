import { InvitationCodeType, NameType, PasswordType, PhoneNumberType, PrecisionNumberType, ReferalCountType, db_schema } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";



const USER_SCHEMA = new Schema({
    
    Parent : InvitationCodeType,
    
    InvitationCode: InvitationCodeType,  // 8 digit random code (unique);

    Name: NameType,

    Password        : PasswordType,

    Balance         : PrecisionNumberType,

    Profit          : PrecisionNumberType,

    Commission      : PrecisionNumberType,

    Level1Deposit   : PrecisionNumberType,
    
    Level1Withdrawal: PrecisionNumberType,

    Blocked         : {type: Boolean, default: false},

    HoldingScore    : {type: Boolean, default: false},

    PhoneNumber     : PhoneNumberType,
    
    ReferalCount    : ReferalCountType,  // number of users joined using invitation code of any user.
 
    Session         : String

}, { timestamps: true });

// indexes -------------

USER_SCHEMA.index({ createdAt: -1, InvitationCode: 1, PhoneNumber: 1 })

// -------------

export const USER = models?.[db_schema.USERS] || model(db_schema.USERS, USER_SCHEMA)