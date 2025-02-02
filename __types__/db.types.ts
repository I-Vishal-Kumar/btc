
export enum db_schema {
    USERS = 'users',
    FIXED_DEPOSIT = 'fixed_deposits'
}

export const FdStatus = {
    PROGRESS: "PROGRESS",
    MATURED: "MATURED",
    HALTED: "HALTED",
} as const; // HALTED -> if admin want to pause this users fd.

  
export type FdStatusType  = typeof FdStatus[keyof typeof FdStatus]; 

// ========= common schema types.

export const InvitationCodeType = {
    type: String,
    unique: true,
    minLength: 8,
    maxLength: 8
}

export const NameType = {
    required: true,
    type: String
}

export const PasswordType = {
    type: String,
    required: true,
    minLength: 5
}

export const PrecisionNumberType = {
    type: Number,
    default: 0,
    set : (value: number) => parseFloat(value.toFixed(2))
}

export const PhoneNumberType = {
    type: String,
    required: true,
    unique: true,
    minLength: 10,
    maxLength: 10
}

export const ReferalCountType = {
    type: Number, 
    default: 0
}