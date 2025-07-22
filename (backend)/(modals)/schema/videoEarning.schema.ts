import { db_schema, InvitationCodeType, PhoneNumberType, VideoEarningType } from "@/__types__/db.types";
import mongoose, { Schema } from "mongoose";

const VIDEO_EARNING_SCHEMA = new Schema({
    
    PhoneNumber         : {...PhoneNumberType, unique : false},

    InvitationCode      : {...InvitationCodeType, unique : false},

    Type                : {type : String, enum : Object.values(VideoEarningType), default : VideoEarningType.WATCH },

    Amount              : {type : Number, required: true},

    Video               : { type: Schema.Types.ObjectId, ref: db_schema.VIDEOS }

}, {timestamps: true});


VIDEO_EARNING_SCHEMA.pre("save", function (this: Document & { [key: string]: any }, next) {
    const precisionFields = ["Amount"];

    precisionFields.forEach(field => {
        if (this[field] !== undefined) {
            this[field] = Math.round(Number(this[field]) * 100) / 100;
        }
    });

    next();
});

VIDEO_EARNING_SCHEMA.index({createdAt : -1, ApprovalStatus : 1});


export const VIDEO_EARNING = mongoose.models?.[db_schema.VIDEO_EARNING] || mongoose.model(db_schema.VIDEO_EARNING, VIDEO_EARNING_SCHEMA); 