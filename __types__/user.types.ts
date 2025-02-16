

export type UserType = {
    _id             : string,
    Parent          : number,
    InvitationCode  : number,
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
    lastSpinAt      : string
}