import { InvitationCodeType, PrecisionNumberType, db_schema, PhoneNumberType } from "@/__types__/db.types";
import { IncomeType } from "@/__types__/transaction.types";
import { Schema, model, models } from "mongoose";

const INCOME_SCHEMA = new Schema({
    
    PhoneNumber     : {...PhoneNumberType, unique: false},
    
    InvitationCode  : {...InvitationCodeType, unique: false},  // 8 digit random code (unique);
    
    Parent          : {...InvitationCodeType, unique: false},
    
    Type            : {type : String, enum: Object.values(IncomeType)},

    From            : {...InvitationCodeType, unique : false},

    Amount          : PrecisionNumberType,
            
},{timestamps: true})

INCOME_SCHEMA.pre("save", function (this: Document & { [key: string]: any }, next) {
    const precisionFields = ["Amount"];

    precisionFields.forEach(field => {
        if (this[field] !== undefined) {
            this[field] = Math.round(Number(this[field]) * 100) / 100;
        }
    });

    next();
});

// indexes ---------------
INCOME_SCHEMA.index({ createdAt: -1, InvitationCode: 1, PhoneNumber: 1})
// -----------

export const INCOME = models?.[db_schema.INCOME] || model(db_schema.INCOME, INCOME_SCHEMA);