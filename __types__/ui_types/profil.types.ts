export enum SectionsAvailable {
    RECHARGE_HISTORY = 'recharge_history',
    WITHDRAWAL_HISTORY = 'withdrawal_history',
    WITHDRAWAL_FUNDS = 'withdrawal_funds',
    TEAM_COMMISSION = 'team_commission',
    SUPPORT = 'support',
    LOGOUT = 'logout'
} 

export enum SubSectionsAvailable {
    TODAY_DEPOSIT = 'today_deposit',
    TODAY_WITHDRAWAL = 'today_withdrawal',
    TODAY_REGISTRATION = 'today_registration',
    DIRECT_MEMBERS = 'direct_members',
} 

export const ActiveTabs = {
    TODAY : 'today',
    ALL : 'all'
} as const;

export type ActiveTabs = typeof ActiveTabs[ keyof typeof ActiveTabs ];

export const WidthdrawMethodTabs = {
    LOCAL: 'local',
    USDT: 'usdt'
} as const;

export type WithdrawmethodTabsType = typeof WidthdrawMethodTabs[keyof typeof WidthdrawMethodTabs]


export const WithdrawalOperationIdentifier = {
    LOCAL_BANK_CREATION : 'local_bank_creation',
    LOCAL_BANK_TRANSFER : 'local_bank_transfer',
    LOCAL_BANK_PASS_RESET : 'local_bank_pass_reset',

    USDT_BANK_CREATION : 'usdt_bank_creation',
    USDT_BANK_TRANSFER : 'usdt_bank_transfer',
    USDT_BANK_PASS_RESET : 'usdt_bank_pass_reset',
    
} as const;

export type WithdrawalOperationIdentifierType = typeof WithdrawalOperationIdentifier[keyof typeof WithdrawalOperationIdentifier]


export type CommissionPageDetailType = {
    todayDeposit: number;
    todayWithdrawal: number;
    totalDeposit: number;
    totalWithdrawal: number;
    todayNewRegistration: number;
    directActiveMembers: number;
    TotalActiveMembers : number;
}
