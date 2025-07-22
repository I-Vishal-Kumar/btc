import { db_schema, InvitationCodeType, PhoneNumberType, VideoApprovalStatusType, VideoVissibilityStatusType } from "@/__types__/db.types";
import mongoose, { Schema } from "mongoose";

const VIDEO_SCHEMA = new Schema({
    
    PhoneNumber         : {...PhoneNumberType, unique : false},

    InvitationCode      : {...InvitationCodeType, unique : false},

    ApprovalStatus      : {type : String, enum : Object.values(VideoApprovalStatusType), default : VideoApprovalStatusType.PENDING_APPROVAL},

    DailyRates          : {type : Number, required : true, default : 0}, // ammount earned per view to the owner.

    VideoUploadEarning  : {type : Number, required : true, default: 0}, // owner will get once per video.

    VideoSource         : {type : String, required : true},

    Vissibility         : { type : String, required : true, enum : Object.values(VideoVissibilityStatusType), default : VideoVissibilityStatusType.BUCKET  }, // when in bucket it will only be vissible to admin's.

    Duration            : {type : Number, required : true, default: 0}, // ammount of time user has to watch the video to earn reward.

}, {timestamps: true});


VIDEO_SCHEMA.index({createdAt : -1, ApprovalStatus : 1, Vissibility : 1});


export const VIDEOS = mongoose.models?.[db_schema.VIDEOS] || mongoose.model(db_schema.VIDEOS, VIDEO_SCHEMA); 