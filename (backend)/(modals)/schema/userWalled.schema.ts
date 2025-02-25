import { PhoneNumberType, db_schema } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";


const WALLET_SCHEMA = new Schema({
    
    PhoneNumber         : {...PhoneNumberType, unique: true},
        
    // USDT Wallet (Optional initially)
    UsdtAddress         : { type: String, unique: true, sparse: true },
    
    AppName             : { type: String },

    // Local Bank (Optional initially)
    AccHolderName       : { type: String },
    
    AccNumber           : { type: String, unique: true, sparse: true },
    
    IfscCode            : { type: String, unique: true, sparse: true },
    
    BankName            : { type: String },
    
    Branch              : { type: String },

    LocalWithdrawPassword    : { type: String },

    UsdtWithdrawPassword    : { type: String },
    
}, { timestamps: true });

// indexes ------------------
    WALLET_SCHEMA.index({ createdAt: -1, PhoneNumber: 1 })
// ------------

export const WALLET = models?.[db_schema.WALLET] || model(db_schema.WALLET, WALLET_SCHEMA)