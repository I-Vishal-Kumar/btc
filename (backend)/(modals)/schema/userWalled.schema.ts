import { InvitationCodeType, PhoneNumberType, db_schema } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";


const RequiredString = {type: String, required: true};

const WALLET_SCHEMA = new Schema({
    
    PhoneNumber         : {...PhoneNumberType, unique: false},
    
    InvitationCode      : {...InvitationCodeType, unique: false},  // 8 digit random code (unique);
    
    AccHolderName       : RequiredString,

    AccNumber           : {...RequiredString, unique: true},

    IfscCode            : {...RequiredString, unique: true},
    
    BankName            : RequiredString,

    Branch              : RequiredString,

    WithdrawPassword    : RequiredString,
    
}, { timestamps: true });

// indexes ------------------
    WALLET_SCHEMA.index({ createdAt: -1, PhoneNumber: 1, InvitationCode: 1})
// ------------

export const WALLET = models?.[db_schema.WALLET] || model(db_schema.WALLET, WALLET_SCHEMA)