
export const OperationTypes = {
    LOGOUT : 'LOGOUT',
} as const;

export type ServiceResponse<T = unknown> = {
    valid: boolean, operation ?: typeof OperationTypes[ keyof typeof OperationTypes ] ,
    msg ?: string,
    data ?: T,
    pagination ?: { 
        currentPage ?: number; 
        totalPages ?: number; 
        totalRecords ?: number;
        level ?: number
    }
}

export type ServiceReturnType<T = unknown> = Promise<ServiceResponse<T>>