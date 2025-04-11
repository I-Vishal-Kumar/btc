import { InvitationCodeType, NameType, PasswordType, PhoneNumberType, PrecisionNumberType, ReferalCountType, db_schema } from "@/__types__/db.types";
import { Schema, model, models } from "mongoose";



const USER_SCHEMA = new Schema({
    
    Parent          : {...InvitationCodeType, unique: false},
    
    InvitationCode  : InvitationCodeType,  // 8 digit random code (unique);

    Name            : NameType,

    Password        : PasswordType,

    Balance         : PrecisionNumberType,

    Profit          : PrecisionNumberType,

    Commission      : PrecisionNumberType,

    Level1Deposit   : PrecisionNumberType,
    
    Level1Withdrawal: PrecisionNumberType,

    Blocked         : {type: Boolean, default: false},

    Deposited       : {type: Boolean, default: false},

    HoldingScore    : {type: Number, default: 0},

    PhoneNumber     : PhoneNumberType,

    BlockWithdrawal : {type : Boolean, default : false},
    
    ReferalCount    : ReferalCountType,  // number of users joined using invitation code of any user.
 
    LastSpinAt      : { type: Date, default: null },  // Track last spin time

    Session         : String

}, { timestamps: true });


USER_SCHEMA.pre("save", function (this: Document & { [key: string]: any }, next) {
    const precisionFields = ["Balance", "Profit", "Commission", "Level1Deposit", "Level1Withdrawal"];

    precisionFields.forEach(field => {
        if (this[field] !== undefined) {
            this[field] = Math.round(Number(this[field]) * 100) / 100;
        }
    });

    next();
});

// indexes -------------

USER_SCHEMA.index({ createdAt: -1, InvitationCode: 1, PhoneNumber: 1 })

// -------------

export const USER = models?.[db_schema.USERS] || model(db_schema.USERS, USER_SCHEMA)