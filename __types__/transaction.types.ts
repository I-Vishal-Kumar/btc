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