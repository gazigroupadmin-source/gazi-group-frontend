// Mock query architecture pipe matching premium frontend components calls
export const api = {
  bankAccounts: { list: "bankAccountsList" },
  transactions: { getRecent: "expensesList", getSummary: "summaryData", getMonthly: "monthlyData" },
  investments: { list: "portfolioDirectList" },
  mutualFunds: { list: "portfolioMFList" },
  loans: { list: "userLoansList" },
  budgets: { list: "configuredBudgetsList" },
  savings: { list: "savingsGoalsList" }
};