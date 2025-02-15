import { InvitationCodeType, PrecisionNumberType, FdStatus, db_schema, PhoneNumberType } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";

const FD_SCHEMA = new Schema({
    
    PhoneNumber     : PhoneNumberType,
    
    InvitationCode  : InvitationCodeType,  // 8 digit random code (unique);
    
    Parent          : InvitationCodeType,
    
    FdAmount        : PrecisionNumberType,
    
    FdDuration      : Number,

    InterestRate    : Number,
    
    FdStatus        : {default: FdStatus.PROGRESS, enum: Object.values(FdStatus)},

    MaturedOn       : Date,

    Claimed         : {type: Boolean, default: false}

},{timestamps: true})

// indexes ---------------
FD_SCHEMA.index({ createdAt: -1, InvitationCode: 1, PhoneNumber: 1})
// -----------

export const FD = models?.[db_schema.FIXED_DEPOSIT] || model(db_schema.FIXED_DEPOSIT, FD_SCHEMA);