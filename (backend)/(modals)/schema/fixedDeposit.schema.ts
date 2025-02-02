import { InvitationCodeType, NameType, PrecisionNumberType, FdStatus, db_schema } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";

const FD_SCHEMA = new Schema({
    
    Name: NameType,
    InvitationCode: InvitationCodeType,
    
    FdAmount : PrecisionNumberType,
    FdDuration: Number,
    InterestRate: Number,
    
    FdStatus: {
        default: FdStatus.PROGRESS,
        enum: Object.values(FdStatus)
    },

    MaturedOn : Date,

    Claimed : {
        type: Boolean,
        default: false
    }

},{timestamps: true})

export const FD = models?.[db_schema.FIXED_DEPOSIT] || model(db_schema.FIXED_DEPOSIT, FD_SCHEMA);