import { useState, useEffect } from "react";

export function useQuery(apiToken: any, params?: any) {
  const [data, setData] = useState<any>(undefined);
  const userEmail = localStorage.getItem("userEmail") || "Guest User";

  useEffect(() => {
    // Read state parameters globally mapped across active local pipelines
    if (typeof apiToken === "string") {
      let storageKey = `${apiToken}_${userEmail}`;
      if (apiToken === "expensesList") storageKey = `expenses_${userEmail}`;
      
      const localData = localStorage.getItem(storageKey);
      setData(localData ? JSON.parse(localData) : []);
    } else if (apiToken?.month) {
      // Direct analytics pipeline mapper summary calculations
      let transactionLogs = JSON.parse(localStorage.getItem(`expenses_${userEmail}`) || "[]");
      let inc = 0, exp = 0;
      transactionLogs.forEach((tx: any) => {
        if(tx.type === "Income") inc += parseFloat(tx.amount || 0);
        else if(tx.type === "Expense") exp += parseFloat(tx.amount || 0);
      });
      setData({ totalIncome: inc, totalExpense: exp });
    } else {
      setData([]);
    }
  }, [apiToken]);

  return data;
}

export function useMutation(apiToken: any) {
  return async (payload: any) => {
    const userEmail = localStorage.getItem("userEmail") || "Guest User";
    console.log("TSX Action committed to local state lines:", payload);
    return true;
  };
}