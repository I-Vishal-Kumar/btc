export enum db_schema {
    USERS = "users",
    FIXED_DEPOSIT = "fixed_deposits",
    TRANSACTION = "transactions",
    WALLET = "user_wallets",
    ADMIN_CONFIG = "admin_configs",
    VIDEOS = "videos",
    VIDEO_EARNING = "video_earning",
    INCOME = "incomes",
}

export const FdStatus = {
    PROGRESS: "PROGRESS",
    MATURED: "MATURED",
    HALTED: "HALTED",
    CLAIMED: "CLAIMED",
} as const; // HALTED -> if admin want to pause this users fd.

export const TransactionType = {
    WITHDRAWAL: "WITHDRAWAL",
    DEPOSIT: "DEPOSIT",
    GIFT: "GIFT",
} as const;

export type TransactionType =
    (typeof TransactionType)[keyof typeof TransactionType];

export type FdStatusType = (typeof FdStatus)[keyof typeof FdStatus];

export const TransactionStatusType = {
    PENDING: "PENDING",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
} as const;

export type TransactionStatusType =
    (typeof TransactionStatusType)[keyof typeof TransactionStatusType];

export const GatewayTypes = {
    AUTO_1: "AUTO-1",
    AUTO_2: "AUTO-2",
    DEFAULT: "BTC",
    RMS_1: "RMS_1",
    RMS_2: "RMS_2",
    AUTO_3: 'AUTO-3', // lg pay
    AUTO_4: 'AUTO-4', // rs pay
} as const;

export type GatewayTypes = (typeof GatewayTypes)[keyof typeof GatewayTypes];

export const WithdrawalTypes = {
    RMS: "RMS",
    LG_PAY: "L-pay",
    RS_PAY: "R-pay",
    DEFAULT: "MANUAL",
    PAY2ALL: 'P-all'
} as const;

export type WithdrawalTypes = (typeof WithdrawalTypes)[keyof typeof WithdrawalTypes];

// ========= common schema types.

export const InvitationCodeType = {
    type: String,
    unique: true,
    minLength: 8,
    maxLength: 8,
};

export const NameType = {
    required: true,
    type: String,
};

export const PasswordType = {
    type: String,
    required: true,
    minLength: 5,
};

export const PrecisionNumberType = {
    type: Number,
    default: 0,
    // added pre save hook instead.
    // set : (value: number) => parseFloat(value.toFixed(2)) // WORKS ONLY FOR SAVE | CREATE (not increment.)
};

export const PhoneNumberType = {
    type: String,
    required: true,
    unique: true,
    minLength: 10,
    maxLength: 10,
};

export const ReferalCountType = {
    type: Number,
    default: 0,
};

export const VideoApprovalStatusType = {
    APPROVED: "APPROVED",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    REJECTED: "REJECTED",
} as const;

export type ApprovalStatusType =
    (typeof VideoApprovalStatusType)[keyof typeof VideoApprovalStatusType];

export const VideoVissibilityStatusType = {
    VISSIBLE: "VISSIBLE",
    BUCKET: "BUCKET",
} as const;

export type VissibilityStatusType =
    (typeof VideoVissibilityStatusType)[keyof typeof VideoVissibilityStatusType];

export const VideoEarningType = {
    UPLOAD: "UPLOAD",
    WATCH: "WATCH",
} as const;

export type VideoEarningType =
    (typeof VideoEarningType)[keyof typeof VideoEarningType];

export type EarningType = {
    Amount: number;
    PhoneNumber: string;
    Type: VideoEarningType;
    VideoSource: string;
    createdAt: string;
    _id: string;
};
