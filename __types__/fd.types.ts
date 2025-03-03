import { FdStatusType } from "./db.types";



export interface FD_type  {
    _id             : string,
    PhoneNumber     : string,
    InvitationCode  : string,
    Parent          : string,
    FdAmount        : number,
    FdDuration      : number,
    InterestRate    : number,
    FdStatus        : FdStatusType,
    MaturedOn       ?: string,
    Claimed         : boolean,
    LastClaimedOn   : string,
    createdAt       : string,
    updatedAt       : string
}