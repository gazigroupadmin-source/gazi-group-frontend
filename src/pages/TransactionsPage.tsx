import React, { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Layers, Plus, X, Wallet } from "lucide-react";

export default function TransactionsPage() {
  const userEmail = localStorage.getItem("userEmail") || "Guest User";
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  
  const [monthlyIncome, setIncome] = useState(0);
  const [monthlyExpense, setExpense] = useState(0);
  const [openConsole, setOpenConsole] = useState(false);

  const [txType, setTxType] = useState("WITHDRAW"); 
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedBudgetIdx, setSelectedBudgetIdx] = useState(""); 
  const [amount, setAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");

  // ⚡ FIXED: DATA LOG INGESTION WITH STRICT EMAIL ISOLATED MASTER DATA MAPPING KEYS
  const loadMasterDataLogs = () => {
    const rawTx = localStorage.getItem(`finvault_master_tx_history_${userEmail}`);
    const txList = rawTx ? JSON.parse(rawTx) : [];
    const sortedTx = txList.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(sortedTx);

    const savedBanks = localStorage.getItem(`bankAccountsList_${userEmail}`);
    const savedBudgets = localStorage.getItem(`budgetsList_${userEmail}`);
    setBankAccounts(savedBanks ? JSON.parse(savedBanks) : []);
    setBudgets(savedBudgets ? JSON.parse(savedBudgets) : []);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let calculatedIncome = 0;
    let calculatedExpense = 0;

    txList.forEach((tx: any) => {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        if (tx.type === "DEPOSIT" || tx.type === "CREDIT") {
          calculatedIncome += parseFloat(tx.amount || "0");
        } else {
          calculatedExpense += parseFloat(tx.amount || "0");
        }
      }
    });

    setIncome(calculatedIncome);
    setExpense(calculatedExpense);
  };

  useEffect(() => {
    loadMasterDataLogs();
  }, [userEmail]);

  const handleCommitTransaction = () => {
    const amt = parseFloat(amount || "0");
    const bankIdx = bankAccounts.findIndex(a => a.id === selectedBankId);

    if (bankIdx === -1 || !amt || amt <= 0) {
      alert("Bhai, proper source bank select kijiye aur valid amount enter kijiye!");
      return;
    }

    let updatedBanks = [...bankAccounts];
    const targetBank = updatedBanks[bankIdx];

    if (txType === "WITHDRAW" && targetBank.balance < amt) {
      alert("Transaction Aborted: Target account features insufficient balance resources!");
      return;
    }

    if (txType === "DEPOSIT") {
      targetBank.balance += amt;
    } else {
      targetBank.balance -= amt;
    }

    const finalDescription = txDescription.trim() || `${txType === "DEPOSIT" ? "Manual Deposit" : "Manual Expense"} Entry Log`;
    
    targetBank.history.push({
      date: new Date().toISOString().slice(0, 10),
      desc: finalDescription,
      amount: amt,
      type: txType
    });

    if (txType === "WITHDRAW" && selectedBudgetIdx !== "") {
      const bIdx = parseInt(selectedBudgetIdx);
      let updatedBudgets = [...budgets];
      if (updatedBudgets[bIdx]) {
        updatedBudgets[bIdx].spent = (parseFloat(updatedBudgets[bIdx].spent) || 0) + amt;
        localStorage.setItem(`budgetsList_${userEmail}`, JSON.stringify(updatedBudgets));
      }
    }

    const currentGlobalHistory = [...transactions];
    currentGlobalHistory.unshift({
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      type: txType,
      source: targetBank.name,
      destination: selectedBudgetIdx !== "" ? `Budget: ${budgets[parseInt(selectedBudgetIdx)]?.category}` : "Self Expense Outbound",
      amount: amt,
      desc: finalDescription
    });

    localStorage.setItem(`bankAccountsList_${userEmail}`, JSON.stringify(updatedBanks));
    localStorage.setItem(`finvault_master_tx_history_${userEmail}`, JSON.stringify(currentGlobalHistory));

    setAmount(""); setTxDescription(""); setSelectedBudgetIdx("");
    setOpenConsole(false);
    
    loadMasterDataLogs();
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", flexDirection: "column", gap: "28px", fontFamily: "system-ui, -apple-system, sans-serif", textAlign: "left", backgroundColor: "#0B1224", padding: "24px", borderRadius: "20px", boxSizing: "border-box", color: "#FFFFFF", minHeight: "100%" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, margin: 0, letterSpacing: "-0.6px" }}>Transactions Ledger</h1>
          <p style={{ color: "#94A3B8", fontSize: "13px", marginTop: "4px" }}>Central operational wire audit stream and live cross-gateway settlements registry</p>
        </div>
        <button onClick={() => setOpenConsole(true)} style={{ padding: "12px 22px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}>
          <Plus style={{ width: "16px", height: "16px" }} /> Add Transaction
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10B981", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>
            <ArrowDownLeft style={{ width: "16px", height: "16px" }} />
            <span>MONTHLY REVENUE FLOW INBOUND</span>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>₹{monthlyIncome.toLocaleString('en-IN')}</h2>
          <small style={{ color: "#64748B", fontSize: "11px" }}>Resets automatically at calendar monthly turnover cycle</small>
        </div>

        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>
            <ArrowUpRight style={{ width: "16px", height: "16px" }} />
            <span>MONTHLY TOTAL ACCUMULATED OUTBOUND</span>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: "#EF4444" }}>₹{monthlyExpense.toLocaleString('en-IN')}</h2>
          <small style={{ color: "#64748B", fontSize: "11px" }}>Includes asset additions, loan payments & active budget allocations</small>
        </div>
      </div>

      {openConsole && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
          <div style={{ backgroundColor: "#141D32", width: "460px", padding: "28px", borderRadius: "24px", border: "1px solid #232E48", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            
            <button onClick={() => setOpenConsole(false)} style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}>
              <X style={{ width: "18px", height: "18px" }} />
            </button>

            <div style={{ borderBottom: "1px solid #232E48", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Wallet style={{ width: "16px", height: "16px", color: "#60A5FA" }} />
              <strong style={{ fontSize: "16px", color: "#FFFFFF" }}>Transaction Console Terminal</strong>
            </div>

            <div style={{ display: "flex", gap: "6px", backgroundColor: "#0B1224", padding: "4px", borderRadius: "10px" }}>
              <button onClick={() => setTxType("WITHDRAW")} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", backgroundColor: txType === "WITHDRAW" ? "#EF4444" : "transparent", color: "#FFF" }}>
                📉 Debit / Expense
              </button>
              <button onClick={() => setTxType("DEPOSIT")} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", backgroundColor: txType === "DEPOSIT" ? "#10B981" : "transparent", color: "#FFF" }}>
                📈 Credit / Income
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>SOURCE BANK ACCOUNT NODE *</label>
                <select value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #334155", color: "#FFF", outline: "none", fontSize: "13px" }}>
                  <option value="">-- SELECT SOURCE ACCOUNT --</option>
                  {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name} (Available: ₹{b.balance.toLocaleString()})</option>)}
                </select>
              </div>

              {txType === "WITHDRAW" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>LINK TO MONTHLY BUDGET CATEGORY (OPTIONAL)</label>
                  <select value={selectedBudgetIdx} onChange={e => setSelectedBudgetIdx(e.target.value)} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #334155", color: "#00CFE8", outline: "none", fontSize: "13px" }}>
                    <option value="">-- NO BUDGET LINK (GENERAL EXPENSE) --</option>
                    {budgets.map((b, bIdx) => <option key={bIdx} value={bIdx}>{b.category} (Tag: {b.tag})</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>TRANSACTION AMOUNT VALUATION (₹) *</label>
                <input type="number" placeholder="e.g. 20" value={amount} onChange={e => setAmount(e.target.value)} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #334155", color: "#FFF", outline: "none", fontSize: "13px" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>NARRATION LOG DESCRIPTION *</label>
                <input type="text" placeholder="e.g. Reference logs text" value={txDescription} onChange={e => setTxDescription(e.target.value)} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #334155", color: "#FFF", outline: "none", fontSize: "13px" }} />
              </div>
            </div>

            <button onClick={handleCommitTransaction} style={{ padding: "14px", backgroundColor: "#2563EB", border: "none", borderRadius: "12px", fontWeight: 700, color: "#FFF", cursor: "pointer", marginTop: "4px" }}>Authorize Transaction Wire</button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <Layers style={{ width: "16px", height: "16px", color: "#60A5FA" }} />
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>All Operations Activity — Historical Vault Logs</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {transactions.map((tx, txIdx) => {
            const isCredit = tx.type === "DEPOSIT" || tx.type === "CREDIT";
            return (
              <div key={tx.id || txIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0B1224", padding: "14px 20px", borderRadius: "12px", border: "1px solid #232E48" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: isCredit ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: isCredit ? "#10B981" : "#EF4444" }}>
                    {isCredit ? <ArrowDownLeft style={{ width: "16px", height: "16px" }} /> : <ArrowUpRight style={{ width: "16px", height: "16px" }} />}
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>{tx.date} • Terminal Root: <strong style={{ color: "#94A3B8" }}>{tx.source || "System Core"}</strong> → <span style={{ color: "#00CFE8" }}>{tx.destination || "Self Flow"}</span></span>
                    <strong style={{ fontSize: "13px", color: "#FFFFFF" }}>{tx.desc}</strong>
                  </div>
                </div>
                
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: isCredit ? "#10B981" : "#EF4444" }}>
                    {isCredit ? "+" : "-"} ₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  <small style={{ fontSize: "9px", color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>{tx.type}</small>
                </div>
              </div>
            );
          })}

          {transactions.length === 0 && (
            <div style={{ color: "#64748B", fontSize: "13px", padding: "32px 12px", textAlign: "center", border: "1px dashed #232E48", borderRadius: "12px" }}>
              Bhai, abhi tak central ledger archive instance mein koi data sync record nahi hua hai.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}