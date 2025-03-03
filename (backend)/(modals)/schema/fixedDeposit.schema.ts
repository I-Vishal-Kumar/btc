import { InvitationCodeType, PrecisionNumberType, FdStatus, db_schema, PhoneNumberType } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";

const FD_SCHEMA = new Schema({
    
    PhoneNumber     : {...PhoneNumberType, unique: false},
    
    InvitationCode  : {...InvitationCodeType, unique: false},  // 8 digit random code (unique);
    
    Parent          : {...InvitationCodeType, unique: false},
    
    FdAmount        : PrecisionNumberType,
    
    FdDuration      : Number,

    InterestRate    : Number,
    
    FdStatus        : { type: String, default: FdStatus.PROGRESS, enum: Object.values(FdStatus)},

    MaturedOn       : Date,

    LastClaimedOn   : Date, 
    
    Claimed         : {type: Boolean, default: false}

},{timestamps: true})

FD_SCHEMA.pre("save", function (this: Document & { [key: string]: any }, next) {
    const precisionFields = ["FdAmount"];

    precisionFields.forEach(field => {
        if (this[field] !== undefined) {
            this[field] = Math.round(this[field] * 100) / 100;
        }
    });

    next();
});

// indexes ---------------
FD_SCHEMA.index({ createdAt: -1, InvitationCode: 1, PhoneNumber: 1})
// -----------

export const FD = models?.[db_schema.FIXED_DEPOSIT] || model(db_schema.FIXED_DEPOSIT, FD_SCHEMA);