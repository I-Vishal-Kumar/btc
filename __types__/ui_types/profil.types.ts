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