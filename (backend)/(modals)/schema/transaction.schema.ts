import { InvitationCodeType, PhoneNumberType, PrecisionNumberType, TransactionStatusType, TransactionType, db_schema } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";



const TRANSACTION_SCHEMA = new Schema({
    
    PhoneNumber     : {...PhoneNumberType, unique: false},
    
    InvitationCode  : {...InvitationCodeType, unique: false},  // 8 digit random code (unique);
    
    Parent          : {...InvitationCodeType, unique: false},
    
    Amount          : PrecisionNumberType,
    
    Type            : {enum:  Object.values(TransactionType), required: true},
        
    TransactionID   : {type: String, required: true, unique: true},

    Status          : {enum: Object.values(TransactionStatusType), default: TransactionStatusType.PENDING , required: true},  // number of users joined using invitation code of any user.
 
    Tax             : Number // % that should be taxed or was taxed during withdrawal.
}, { timestamps: true });

// indexes ------------

TRANSACTION_SCHEMA.index({createdAt: -1, PhoneNumber: 1, InvitationCode: 1})

// -------------

export const TRANSACTION = models?.[db_schema.TRANSACTION] || model(db_schema.TRANSACTION, TRANSACTION_SCHEMA)