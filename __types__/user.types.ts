import { ApprovalStatusType, VissibilityStatusType } from "./db.types";


export type UserType = {
    _id             : string,
    Password        : string,
    Parent          : string,
    InvitationCode  : string,
    Name            : string,
    Balance         : number,
    Profit          : number,
    PhoneNumber     : string,
    ReferalCount    : number,
    Commission      : number,
    Level1Deposit   : number,
    Level1Withdrawal: number,
    Blocked         : boolean,
    HoldingScore    : number,
    LastSpinAt      : string,   
    createdAt       ?: string,
    Deposited       ?: boolean
    DirectActiveMembers : number;
}


export type UserWallet = {
    _id             : string,
    PhoneNumber     : string,
    
    UsdtAddress    ?: string,
    AppName        ?: string,

    AccHolderName  ?: string,
    AccNumber      ?: string,
    IfscCode       ?: string,
    BankName       ?: string,
    Branch         ?: string,
    
}


// video types 

export type VideoType = {
    ApprovalStatus : ApprovalStatusType,
    DailyRates : number;
    Duration : number;
    InvitationCode : string;
    PhoneNumber : string;
    VideoSource : string;
    VideoUploadedEarning : number;
    Vissibility : VissibilityStatusType;
    createdAt : Date;
    updatedAt : Date;
    _id : string
}