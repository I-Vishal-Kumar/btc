import { TransactionStatusType, TransactionType } from "./db.types"
import { UserWallet } from "./user.types"

export type TransactionObjType = {
    _id             : string,
    Parent          : string,
    Amount          : number,
    Method          : string,
    Tax            ?: number
    PhoneNumber     : string,
    InvitationCode  : string,
    TransactionID   : string,
    Type            : TransactionType,
    Status          : TransactionStatusType,
    createdAt       : string,
    updatedAt       : string,
}


export type adminWithdrawalRespType = TransactionObjType&{walletDetails : UserWallet}

export const IncomeType = {
    DAILY_INCOME    : 'DAILY_INCOME',
    REFERAL_INCOME  : 'REFERAL_INCOME',
    DAILY_GIFT      : 'DAILY_GIFT'
} as const;

export type icomeType = typeof IncomeType[keyof typeof IncomeType]

export type Income = {
    _id             : string,
    Parent          : string,
    Amount          : number,
    Type            : icomeType,
    From            : string, // who gave this user this bonus when refer will hold invitation code.
    createdAt       : string,
    updatedAt       : string,
}
