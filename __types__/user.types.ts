

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
    createdAt       ?: string
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