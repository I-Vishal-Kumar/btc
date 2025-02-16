/**
 * Calculates profit for a Fixed Deposit (FD)
 * @param principal - The initial deposit amount
 * @param days - Number of days the FD is active
 * @param dailyInterestRate - The per-day interest rate (in percentage)
 * @returns The total profit earned
 */
export const calculateFDProfit = (principal: number, days: number, dailyInterestRate: number): number => {
    if (principal <= 0 || days <= 0 || dailyInterestRate <= 0) return 0;
  
    // Profit formula: Principal * (Daily Interest Rate / 100) * Days
    return principal * (dailyInterestRate / 100) * days;
  };
  