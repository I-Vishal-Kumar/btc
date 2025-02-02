
export const OperationTypes = {
    LOGOUT : 'LOGOUT',
} as const;

export type ServiceResponse<T = unknown> = {
    valid: boolean, operation ?: typeof OperationTypes[ keyof typeof OperationTypes ] ,
    msg ?: string,
    data ?: T 
}

export type ServiceReturnType<T = unknown> = Promise<ServiceResponse<T>>