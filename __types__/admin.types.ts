import { GatewayTypes } from "./db.types"

export type AdminConfigType = {
    QrCode      : string,
    HistoryPopImage: string,
    HomePopImage: string,
    UpiIds      : string[],
    Gateway     : GatewayTypes,
    Usdt        : boolean,
    UsdtAddress : string;
    AutoWithdraw : boolean;
    AvailableVideos : string[];
}

export type ad_getUserInfoResType = {
    
    InvitationCode  : string;
    Name            : string;
    Password        : string,
    Balance         : number,
    Blocked         : boolean,
    PhoneNumber     : string ,
    createdAt       : string,
    ParentInv       : string | null,
    ParentPhoneNumber:string | null;
    todayDeposit    : number,
    todayWithdrawal : number,
    totalDeposit    : number,
    totalWithdrawal : number
}