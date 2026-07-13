import React, { useEffect, useState } from "react";

export default function DashboardPage() {
  const userEmail = localStorage.getItem("userEmail") || "Guest User";
  
  const [bankBalance, setBankBalance] = useState(0);
  const [budgetCount, setBudgetCount] = useState(0);
  const [investedVal, setInvestedVal] = useState(0);
  const [loanVal, setLoanVal] = useState(0);
  
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [recentTx, setRecentTx] = useState<any[]>([]);

  // 📊 State Array for the 6-Month Dashboard Analytics Mesh
  const [chartData, setChartData] = useState<any[]>([]);

  // 🛡️ 4-Tier Subscription Validity & Lifecycle State Pools
  const [userTier, setUserTier] = useState("Free");
  const [daysRemaining, setDaysRemaining] = useState(30);
  const [isGracePeriod, setIsGracePeriod] = useState(false);
  const [graceDaysLeft, setGraceDaysLeft] = useState(2);
  const [showTimerBar, setShowTimerBar] = useState(false);

  // P2P Relations Net Calculators State
  const [totalP2PReceivable, setTotalP2PReceivable] = useState(0);
  const [totalP2PPayable, setTotalP2PPayable] = useState(0);

  useEffect(() => {
    const currentRole = localStorage.getItem(`userTier_${userEmail}`) || "Free";
    setUserTier(currentRole);

    if (currentRole === "Free") {
      const activationDateStr = localStorage.getItem(`tierActivationDate_${userEmail}`);
      if (activationDateStr) {
        const activationDate = new Date(activationDateStr);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - activationDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff >= 32) {
          localStorage.clear();
          alert("Session Expired: Free evaluation trial loop and grace timeline ended. System metadata reset committed.");
          window.location.reload();
          return;
        } else if (daysDiff >= 30) {
          setIsGracePeriod(true);
          setGraceDaysLeft(32 - daysDiff);
          setDaysRemaining(0);
        } else {
          setDaysRemaining(30 - daysDiff);
          setIsGracePeriod(false);
        }
        setShowTimerBar(true);
      }
    } else {
      setShowTimerBar(false);
    }

    // ⚡ FIXED: RECOVER DATABASE REGISTRIES POOLS WITH STRICT USER-ISOLATED LOGIC KEYS
    const banks = JSON.parse(localStorage.getItem(`bankAccountsList_${userEmail}`) || "[]");
    const budgets = JSON.parse(localStorage.getItem(`budgetsList_${userEmail}`) || "[]");
    const investments = JSON.parse(localStorage.getItem(`directInvestList_${userEmail}`) || "[]");
    const mutualFunds = JSON.parse(localStorage.getItem(`mfInvestList_${userEmail}`) || "[]");
    const loans = JSON.parse(localStorage.getItem(`loansList_${userEmail}`) || "[]");
    const txLogs = JSON.parse(localStorage.getItem(`finvault_master_tx_history_${userEmail}`) || "[]");
    const p2pRecords = JSON.parse(localStorage.getItem(`p2pRelationsList_${userEmail}`) || "[]");

    let recSum = 0;
    let paySum = 0;
    p2pRecords.forEach((p: any) => {
      const amt = parseFloat(p.amount) || 0;
      if (p.type === "RECEIVABLE") {
        recSum += amt;
      } else {
        paySum += amt;
      }
    });
    setTotalP2PReceivable(recSum);
    setTotalP2PPayable(paySum);

    const totalBank = banks.reduce((sum: number, a: any) => sum + (parseFloat(a.balance) || 0), 0);
    const totalDirect = investments.reduce((sum: number, i: any) => sum + (parseFloat(i.invested) || 0), 0);
    const totalMf = mutualFunds.reduce((sum: number, m: any) => sum + (parseFloat(m.invested) || 0), 0);
    const totalInvest = totalDirect + totalMf;
    const totalLoan = loans.reduce((sum: number, l: any) => sum + (parseFloat(l.remainingAmount) || 0), 0);

    setBankBalance(totalBank);
    setBudgetCount(budgets.length);
    setInvestedVal(totalInvest);
    setLoanVal(totalLoan);
    setRecentTx(txLogs.slice(-5));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let inc = 0, exp = 0;
    txLogs.forEach((t: any) => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        if (t.type === "DEPOSIT" || t.type === "CREDIT") inc += parseFloat(t.amount || 0);
        else exp += parseFloat(t.amount || 0);
      }
    });
    setMonthlyIncome(inc);
    setMonthlyExpense(exp);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let rollingMonths: any[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      rollingMonths.push({
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        income: 0,
        expense: 0
      });
    }

    txLogs.forEach((tx: any) => {
      const txDate = new Date(tx.date);
      const m = txDate.getMonth();
      const y = txDate.getFullYear();
      const amt = parseFloat(tx.amount || 0);

      const targetSlot = rollingMonths.find(rm => rm.monthIdx === m && rm.year === y);
      if (targetSlot) {
        if (tx.type === "DEPOSIT" || tx.type === "CREDIT") {
          targetSlot.income += amt;
        } else {
          targetSlot.expense += amt;
        }
      }
    });

    setChartData(rollingMonths);
  }, [userEmail]);

  const netWorth = (bankBalance + investedVal + totalP2PReceivable) - (loanVal + totalP2PPayable);

  const metrics = [
    { title: "Net Worth Matrix", value: netWorth, color: netWorth >= 0 ? "#10B981" : "#EF4444" },
    { title: "Total Bank Balance", value: bankBalance, color: "#10B981" },
    { title: "Investment Value", value: investedVal, color: "#F59E0B" },
    { title: "Loan Outstanding", value: loanVal, color: "#EF4444" },
    { title: "P2P Net Receivables (+)", value: totalP2PReceivable, color: "#10B981" },
    { title: "P2P Net Payables (-)", value: totalP2PPayable, color: "#EF4444" },
    { title: "Active Budget Caps", value: budgetCount, color: "#8B5CF6", isCount: true },
    { title: "Monthly Debit Expenses", value: monthlyExpense, color: "#EF4444" },
  ];

  const aggregateMaxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 5000);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", fontFamily: "system-ui, sans-serif", backgroundColor: "#0B1224", color: "#FFFFFF", textAlign: "left" }}>
      
      {showTimerBar && (
        <div style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", backgroundColor: isGracePeriod ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.12)", border: `1px dashed ${isGracePeriod ? "#EF4444" : "#F59E0B"}`, boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: isGracePeriod ? "#EF4444" : "#F59E0B" }}>
              {isGracePeriod 
                ? `🚨 CRITICAL WARNING: Your 30-day evaluation framework has expired! Grace window active: ${graceDaysLeft} day(s) remaining before total database purge wipe!` 
                : `💡 SYSTEM SUBSCRIPTION INFRASTRUCTURE NOTICE: You are running a Free Evaluation License Account. ${daysRemaining} day(s) left inside active access loop.`
              }
            </span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {metrics.map((m, idx) => (
          <div key={idx} style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.title}</span>
            <span style={{ fontSize: "26px", fontWeight: 800, color: m.title === "Net Worth Matrix" ? m.color : "#FFFFFF", letterSpacing: "-0.5px" }}>
              {m.isCount ? m.value : `${m.value < 0 ? "-" : ""}₹${Math.abs(m.value).toLocaleString('en-IN')}`}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>6-Month Dynamic Cash Flow Matrix</h4>
            <div style={{ display: "flex", gap: "12px", fontSize: "11px", fontWeight: 700 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#10B981" }}><b style={{ width: "10px", height: "10px", backgroundColor: "#10B981", borderRadius: "2px" }}/> Income</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#EF4444" }}><b style={{ width: "10px", height: "10px", backgroundColor: "#EF4444", borderRadius: "2px" }}/> Expense</span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "200px", width: "100%", padding: "10px 10px 0 10px", boxSizing: "border-box", borderBottom: "1px solid #232E48", position: "relative" }}>
            {chartData.map((data, idx) => {
              const incomeHeightPct = Math.max((data.income / aggregateMaxVal) * 100, 2);
              const expenseHeightPct = Math.max((data.expense / aggregateMaxVal) * 100, 2);

              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "160px", width: "100%", justifyContent: "center" }}>
                    <div 
                      style={{ width: "16px", height: `${incomeHeightPct}%`, backgroundColor: "#10B981", borderRadius: "4px 4px 0 0", transition: "all 0.4s ease-out", position: "relative" }}
                      title={`Income: ₹${data.income.toLocaleString()}`}
                    />
                    <div 
                      style={{ width: "16px", height: `${expenseHeightPct}%`, backgroundColor: "#EF4444", borderRadius: "4px 4px 0 0", transition: "all 0.4s ease-out", position: "relative" }}
                      title={`Expense: ₹${data.expense.toLocaleString()}`}
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700, marginTop: "4px" }}>{data.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>Allocation Distribution</h4>
          <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "14px solid #10B981", borderTopColor: "#F59E0B", margin: "16px auto", boxSizing: "border-box" }} />
          <div style={{ fontSize: "12px", color: "#94A3B8", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>● Liquidity Balance</span><strong style={{ color: "#FFFFFF" }}>₹{bankBalance.toLocaleString()}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>● Invested Capital</span><strong style={{ color: "#FFFFFF" }}>₹{investedVal.toLocaleString()}</strong></div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <h4 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>Live Transaction Ledger Logs</h4>
        {recentTx.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>Execute credit/debit transaction inside bank console nodes to monitor dashboard assets.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", color: "#CBD5E1" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#94A3B8", borderBottom: "1px solid #232E48" }}>
                <th style={{ padding: "10px 0" }}>Log Description</th>
                <th>Gateway Node</th>
                <th style={{ textAlign: "right" }}>Amount Valuation</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map((tx, i) => {
                const isCredit = tx.type === "DEPOSIT" || tx.type === "CREDIT";
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #232E48" }}>
                    <td style={{ padding: "14px 0", fontWeight: 600, color: "#FFFFFF" }}>{tx.desc}</td>
                    <td><span style={{ fontSize: "11px", fontWeight: "bold", color: isCredit ? "#10B981" : "#EF4444", backgroundColor: isCredit ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", padding: "2px 8px", borderRadius: "4px" }}>{tx.type}</span></td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: isCredit ? "#10B981" : "#EF4444" }}>{isCredit ? "+" : "-"}₹{parseFloat(tx.amount || 0).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}