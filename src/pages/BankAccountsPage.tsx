import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Landmark, Camera, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, FileText } from "lucide-react";

export default function BankAccountsPage({ onSync }: { onSync: () => void }) {
  const userEmail = localStorage.getItem("userEmail") || "Guest User";
  
  // Master Registries States Memory Pools
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [directInvestments, setDirectInvestments] = useState<any[]>([]);
  const [mutualFunds, setMutualFunds] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  
  // Modals Overlay Visibility Status Controlling Flags
  const [openAdd, setOpenAdd] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [activeStatementId, setActiveStatementId] = useState<string | null>(null);

  // Inline Bank Node Modifiers Controls
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [editBalanceVal, setEditBalanceVal] = useState("");
  
  // --- EXACT SCREENSHOT MATCHED FORM INPUT FIELDS ---
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [branch, setBranch] = useState("");
  const [accountType, setAccountType] = useState("Savings"); 
  const [balance, setBalance] = useState("");
  const [logo, setLogo] = useState("");

  // Transaction Console Interface Controlling Variable Inputs
  const [txType, setTxType] = useState("Transfer"); 
  const [selectedBankId, setSelectedBankId] = useState("");
  const [transferDestinationType, setTransferDestinationType] = useState("LOAN"); 
  const [targetDestinationId, setTargetDestinationId] = useState(""); 
  const [selectedBudgetIdx, setSelectedBudgetIdx] = useState(""); 
  const [amount, setAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");

  // ⚡ FIXED: RELOAD WITH STRICT USER-ISOLATED LOGIC KEYS
  const reloadCentralStorageNodes = () => {
    const savedBanks = localStorage.getItem(`bankAccountsList_${userEmail}`);
    const savedLoans = localStorage.getItem(`loansList_${userEmail}`);
    const savedDirect = localStorage.getItem(`directInvestList_${userEmail}`);
    const savedMf = localStorage.getItem(`mfInvestList_${userEmail}`);
    const savedGoals = localStorage.getItem(`savingsGoalsList_${userEmail}`);
    const savedBudgets = localStorage.getItem(`budgetsList_${userEmail}`);
    
    setBankAccounts(savedBanks ? JSON.parse(savedBanks) : []);
    setLoans(savedLoans ? JSON.parse(savedLoans) : []);
    setDirectInvestments(savedDirect ? JSON.parse(savedDirect) : []);
    setMutualFunds(savedMf ? JSON.parse(savedMf) : []);
    setSavingsGoals(savedGoals ? JSON.parse(savedGoals) : []);
    setBudgets(savedBudgets ? JSON.parse(savedBudgets) : []);
  };

  useEffect(() => {
    reloadCentralStorageNodes();
  }, [userEmail, openAdd, openTransaction]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddBank = () => {
    if (!bankName || !balance) return;
    const initialAmt = parseFloat(balance || "0");
    const lastFourDigits = accountNumber.trim().slice(-4) || "0000";

    const newAccount = { 
      id: Date.now().toString(), 
      accountNumber: accountNumber.trim(),
      displayMask: `****${lastFourDigits}`,
      name: bankName.toUpperCase().trim(), 
      ifsc: ifsc.toUpperCase().trim(), 
      branch: branch.toUpperCase().trim(), 
      accountType: accountType,
      balance: initialAmt, 
      openingBalance: initialAmt,
      logo,
      history: [{ date: new Date().toISOString().slice(0, 10), desc: "Account Opened", amount: initialAmt, type: "DEPOSIT" }]
    };
    
    const updated = [...bankAccounts, newAccount];
    setBankAccounts(updated);
    localStorage.setItem(`bankAccountsList_${userEmail}`, JSON.stringify(updated));
    
    setAccountNumber(""); setBankName(""); setBalance(""); setIfsc(""); setBranch(""); setLogo(""); setAccountType("Savings");
    setOpenAdd(false);
    onSync();
  };

  const handleDeleteBank = (id: string) => {
    const updated = bankAccounts.filter(b => b.id !== id);
    setBankAccounts(updated);
    localStorage.setItem(`bankAccountsList_${userEmail}`, JSON.stringify(updated));
    if (activeStatementId === id) setActiveStatementId(null);
    onSync();
  };

  const saveInlineBalanceCalibration = (id: string) => {
    const nextAmt = parseFloat(editBalanceVal || "0");
    const updated = bankAccounts.map(b => {
      if (b.id === id) {
        b.history.push({ date: new Date().toISOString().slice(0, 10), desc: "Balance Override Calibration", amount: nextAmt, type: "DEPOSIT" });
        return { ...b, balance: nextAmt };
      }
      return b;
    });
    setBankAccounts(updated);
    localStorage.setItem(`bankAccountsList_${userEmail}`, JSON.stringify(updated));
    setEditingBankId(null);
    onSync();
  };

  const handleQuickActionTrigger = (bankId: string, actionType: "Deposit" | "Withdraw" | "Transfer") => {
    setSelectedBankId(bankId);
    setTxType(actionType);
    setOpenTransaction(true);
  };

  const handleExecuteTransaction = () => {
    const amt = parseFloat(amount || "0");
    const bankIdx = bankAccounts.findIndex(a => a.id === selectedBankId);
    
    if (bankIdx === -1 || !amt || amt <= 0) {
      alert("Bhai, proper source validation select kijiye aur amount enter kijiye!");
      return;
    }

    let updatedBanks = [...bankAccounts];
    const targetBank = updatedBanks[bankIdx];

    if (txType !== "Deposit" && targetBank.balance < amt) {
      alert("Transaction Aborted: Insufficient liquidity reserves available!");
      return;
    }

    if (txType === "Deposit") {
      targetBank.balance += amt;
    } else {
      targetBank.balance -= amt;
    }

    const finalDescription = txDescription.trim() || `${txType} Operational Log Entry`;
    targetBank.history.push({ date: new Date().toISOString().slice(0, 10), desc: finalDescription, amount: amt, type: txType.toUpperCase() });

    if (selectedBudgetIdx !== "" && (txType === "Withdraw" || txType === "Transfer")) {
      const bIdx = parseInt(selectedBudgetIdx);
      let currentBudgets = [...budgets];
      if (currentBudgets[bIdx]) {
        currentBudgets[bIdx].spent = (parseFloat(currentBudgets[bIdx].spent) || 0) + amt;
        localStorage.setItem(`budgetsList_${userEmail}`, JSON.stringify(currentBudgets));
      }
    }

    let destinationLabelText = "Self Vault Flow";
    
    if (txType === "Transfer" && targetDestinationId) {
      if (transferDestinationType === "LOAN") {
        const savedLoans = localStorage.getItem(`loansList_${userEmail}`);
        if (savedLoans) {
          let currentLoans = JSON.parse(savedLoans);
          const lIdx = currentLoans.findIndex((l: any) => l.id === targetDestinationId);
          if (lIdx !== -1) {
            currentLoans[lIdx].remainingAmount = currentLoans[lIdx].remainingAmount - amt;
            currentLoans[lIdx].totalPaid = (currentLoans[lIdx].totalPaid || 0) + amt;
            currentLoans[lIdx].statements.push({ date: new Date().toISOString().slice(0, 10), desc: `Bank Transfer allocation from ${targetBank.name}`, amount: amt, type: "CREDIT" });
            destinationLabelText = `Loan Node: ${currentLoans[lIdx].lender}`;
            localStorage.setItem(`loansList_${userEmail}`, JSON.stringify(currentLoans));
          }
        }
      } else if (transferDestinationType === "ASSET") {
        const savedDirect = localStorage.getItem(`directInvestList_${userEmail}`);
        if (savedDirect) {
          let currentDirect = JSON.parse(savedDirect);
          const dIdx = currentDirect.findIndex((d: any) => d.id === targetDestinationId);
          if (dIdx !== -1) {
            currentDirect[dIdx].invested = (parseFloat(currentDirect[dIdx].invested) || 0) + amt;
            currentDirect[dIdx].current = (parseFloat(currentDirect[dIdx].current) || 0) + amt;
            currentDirect[dIdx].history.push({ date: new Date().toISOString().slice(0, 10), desc: `Dynamic Injection from ${targetBank.name}`, amount: amt, type: "DEBIT" });
            destinationLabelText = `Asset Stock: ${currentDirect[dIdx].name}`;
            localStorage.setItem(`directInvestList_${userEmail}`, JSON.stringify(currentDirect));
          }
        }
      } else if (transferDestinationType === "MUTUAL_FUND") {
        const savedMf = localStorage.getItem(`mfInvestList_${userEmail}`);
        if (savedMf) {
          let currentMf = JSON.parse(savedMf);
          const mIdx = currentMf.findIndex((m: any) => m.id === targetDestinationId);
          if (mIdx !== -1) {
            currentMf[mIdx].invested = (parseFloat(currentMf[mIdx].invested) || 0) + amt;
            currentMf[mIdx].current = (parseFloat(currentMf[mIdx].current) || 0) + amt;
            currentMf[mIdx].history.push({ date: new Date().toISOString().slice(0, 10), desc: `Dynamic Asset Injection from ${targetBank.name}`, amount: amt, type: "DEBIT" });
            destinationLabelText = `Mutual Fund: ${currentMf[mIdx].name}`;
            localStorage.setItem(`mfInvestList_${userEmail}`, JSON.stringify(currentMf));
          }
        }
      } else if (transferDestinationType === "SAVINGS_GOAL") {
        const savedGoals = localStorage.getItem(`savingsGoalsList_${userEmail}`);
        if (savedGoals) {
          let currentGoals = JSON.parse(savedGoals);
          const gIdx = currentGoals.findIndex((g: any) => g.id === targetDestinationId);
          if (gIdx !== -1) {
            currentGoals[gIdx].saved = (parseFloat(currentGoals[gIdx].saved) || 0) + amt;
            currentGoals[gIdx].history.push({ date: new Date().toISOString().slice(0, 10), desc: `Allocation pipeline deposit from ${targetBank.name}`, amount: amt, type: "DEPOSIT" });
            destinationLabelText = `Savings Target: ${currentGoals[gIdx].name}`;
            localStorage.setItem(`savingsGoalsList_${userEmail}`, JSON.stringify(currentGoals));
          }
        }
      }
    }

    const globalHistoryRaw = localStorage.getItem(`finvault_master_tx_history_${userEmail}`);
    let globalHistory = globalHistoryRaw ? JSON.parse(globalHistoryRaw) : [];
    globalHistory.unshift({
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      type: txType.toUpperCase(),
      source: targetBank.name,
      destination: txType === "Transfer" ? destinationLabelText : "Self Account Loop",
      amount: amt,
      desc: selectedBudgetIdx !== "" ? `[Budget Linked] ${finalDescription}` : finalDescription
    });
    localStorage.setItem(`finvault_master_tx_history_${userEmail}`, JSON.stringify(globalHistory));

    setBankAccounts(updatedBanks);
    localStorage.setItem(`bankAccountsList_${userEmail}`, JSON.stringify(updatedBanks));
    
    setAmount(""); setTxDescription(""); setTargetDestinationId(""); setSelectedBudgetIdx("");
    setOpenTransaction(false);
    
    reloadCentralStorageNodes();
    onSync();
  };

  const selectedBankData = bankAccounts.find(a => a.id === activeStatementId);
  const aggregateBalance = bankAccounts.reduce((sum, b) => sum + (parseFloat(b.balance) || 0), 0);
  const designPalette = ["#FF9F43", "#00CFE8", "#28C76F", "#7367F0", "#EA5455", "#60A5FA"];

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", flexDirection: "column", gap: "24px", fontFamily: "system-ui, -apple-system, sans-serif", textAlign: "left", padding: "4px", boxSizing: "border-box" }}>
      
      {/* HEADER ROW */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: "#FFFFFF", letterSpacing: "-0.5px" }}>Bank Accounts</h1>
          <p style={{ color: "#FFFFFF", fontSize: "14px", margin: "4px 0 0 0", fontWeight: 600 }}>Total Balance: <span style={{ color: "#10B981", fontWeight: 800 }}>₹{aggregateBalance.toLocaleString('en-IN')}</span></p>
        </div>
        <button onClick={() => setOpenAdd(true)} style={{ padding: "10px 18px", backgroundColor: "#0A58CA", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={14} /> Add Account
        </button>
      </div>

      {/* POPUP MODAL: ADD ACCOUNT */}
      {openAdd && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
          <div style={{ backgroundColor: "#FFFFFF", width: "480px", padding: "24px", borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "16px", position: "relative", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            
            <button onClick={() => setOpenAdd(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "18px" }}>×</button>
            <h3 style={{ margin: 0, color: "#0F172A", fontWeight: 700, fontSize: "16px" }}>Add Bank Account</h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px dashed #CBD5E1", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {logo ? <img src={logo} alt="blogo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera style={{ width: "16px", height: "16px", color: "#64748B" }} />}
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
              </div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>Optional: Click box to upload bank logo profile badge</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Account Number *</label>
              <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="e.g. 1234567890" style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", color: "#0F172A", fontSize: "13px", outline: "none" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Bank Name *</label>
                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", color: "#0F172A", fontSize: "13px", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>IFSC Code *</label>
                <input type="text" value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="e.g. HDFC0001234" style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", color: "#0F172A", fontSize: "13px", outline: "none" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Branch *</label>
                <input type="text" value={branch} onChange={e => setBranch(e.target.value)} placeholder="e.g. Mumbai Main" style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", color: "#0F172A", fontSize: "13px", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Account Type</label>
                <select value={accountType} onChange={e => setAccountType(e.target.value)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", color: "#0F172A", fontSize: "13px", outline: "none" }}>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="Salary">Salary</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>Opening Balance (₹) *</label>
              <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0" style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", color: "#0F172A", fontSize: "13px", outline: "none" }} />
            </div>

            <button onClick={handleAddBank} style={{ padding: "12px", backgroundColor: "#0A58CA", color: "#FFFFFF", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "13px", marginTop: "4px" }}>Add Account</button>
          </div>
        </div>
      )}

      {/* POPUP MODAL: TERMINAL LOGS CONSOLE */}
      {openTransaction && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
          <div style={{ backgroundColor: "#FFFFFF", width: "500px", padding: "28px", borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "16px", position: "relative", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <button onClick={() => setOpenTransaction(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#64748B", cursor: "pointer" }}>×</button>
            <h3 style={{ margin: 0, color: "#0F172A", fontWeight: 800 }}>Transaction Allocation Gate</h3>
            
            <div style={{ display: "flex", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "8px" }}>
              {["Deposit", "Withdraw", "Transfer"].map(type => (
                <button key={type} onClick={() => setTxType(type)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", fontWeight: 700, backgroundColor: txType === type ? "#0A58CA" : "transparent", color: txType === type ? "#FFF" : "#475569", cursor: "pointer", fontSize: "12px" }}>{type === "Transfer" ? "Fund Outbound Wire" : type}</button>
              ))}
            </div>

            <select value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", color: "#0F172A", fontSize: "13px", outline: "none" }}>
              <option value="">-- SELECT SOURCE REGISTRY BANK --</option>
              {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name} (Bal: ₹{b.balance.toLocaleString()})</option>)}
            </select>

            {txType === "Transfer" && (
              <>
                <select value={transferDestinationType} onChange={e => { setTransferDestinationType(e.target.value); setTargetDestinationId(""); }} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", color: "#0F172A", fontSize: "13px", outline: "none" }}>
                  <option value="LOAN">LOAN & LIABILITY NODES</option>
                  <option value="ASSET">DIRECT SHARES STOCK ASSETS</option>
                  <option value="MUTUAL_FUND">MUTUAL FUND POOLS MATRIX</option>
                  <option value="SAVINGS_GOAL">SAVINGS TARGET FRAMEWORK GOAL</option>
                </select>

                <select value={targetDestinationId} onChange={e => setTargetDestinationId(e.target.value)} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", color: "#0A58CA", fontSize: "13px", outline: "none", fontWeight: 600 }}>
                  <option value="">-- SELECT RECIPIENT ACCOUNT TARGET --</option>
                  {transferDestinationType === "LOAN" && loans.map(l => <option key={l.id} value={l.id}>{l.lender} (Outstanding: ₹{l.remainingAmount.toLocaleString()})</option>)}
                  {transferDestinationType === "ASSET" && directInvestments.map(d => <option key={d.id} value={d.id}>{d.name} [{d.type}]</option>)}
                  {transferDestinationType === "MUTUAL_FUND" && mutualFunds.map(m => <option key={m.id} value={m.id}>{m.name} ({m.fundHouse})</option>)}
                  {transferDestinationType === "SAVINGS_GOAL" && savingsGoals.map(g => <option key={g.id} value={g.id}>{g.name} (Target: ₹{g.target.toLocaleString()})</option>)}
                </select>
              </>
            )}

            {(txType === "Withdraw" || txType === "Transfer") && (
              <select value={selectedBudgetIdx} onChange={e => setSelectedBudgetIdx(e.target.value)} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", color: "#475569", fontSize: "13px", outline: "none" }}>
                <option value="">-- OPTIONAL: ASSIGN TO MONTHLY BUDGET CATEGORY --</option>
                {budgets.map((bg, bgIdx) => (
                  <option key={bgIdx} value={bgIdx}>{bg.category} (Limit: ₹{bg.amount.toLocaleString()})</option>
                ))}
              </select>
            )}

            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Input Transaction Amount (₹)" style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", color: "#0F172A", fontSize: "13px", outline: "none" }} />
            <input type="text" value={txDescription} onChange={e => setTxDescription(e.target.value)} placeholder="Reference Log Narration Notes" style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", color: "#0F172A", fontSize: "13px", outline: "none" }} />
            
            <button onClick={handleExecuteTransaction} style={{ padding: "12px", backgroundColor: "#0A58CA", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Commit Vault Update</button>
          </div>
        </div>
      )}

      {/* 🔄 CARDS MESH */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "20px" }}>
        {bankAccounts.map((b, i) => {
          const topAccentColor = designPalette[i % designPalette.length];
          return (
            <div key={b.id} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}>
              
              <div style={{ width: "100%", height: "4px", backgroundColor: topAccentColor, position: "absolute", top: 0, left: 0 }} />
              
              <div style={{ position: "absolute", top: "18px", right: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <button onClick={() => setEditingBankId(editingBankId === b.id ? null : b.id)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }} title="Edit Balance"><Edit2 size={13} /></button>
                <button onClick={() => handleDeleteBank(b.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }} title="Delete Account"><Trash2 size={13} /></button>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {b.logo ? <img src={b.logo} alt="blogo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Landmark size={15} color="#475569" />}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>{b.name}</h4>
                      <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>{b.displayMask || `****${b.accountNumber?.slice(-4) || '0000'}`}</span>
                    </div>
                  </div>
                  
                  <span style={{ fontSize: "10px", backgroundColor: "#F1F5F9", color: "#475569", padding: "3px 10px", borderRadius: "12px", fontWeight: 700, border: "1px solid #E2E8F0" }}>
                    {b.accountType || "Savings"}
                  </span>
                </div>

                {editingBankId === b.id && (
                  <div style={{ display: "flex", gap: "6px", backgroundColor: "#F8FAFC", padding: "6px", borderRadius: "6px", border: "1px solid #E2E8F0", marginTop: "10px" }}>
                    <input type="number" placeholder="Calibrate balance" value={editBalanceVal} onChange={e => setEditBalanceVal(e.target.value)} style={{ padding: "4px 8px", borderRadius: "4px", backgroundColor: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1", fontSize: "12px", width: "130px", outline: "none" }} />
                    <button onClick={() => saveInlineBalanceCalibration(b.id)} style={{ padding: "4px 8px", backgroundColor: "#198754", color: "#FFF", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>Save</button>
                  </div>
                )}

                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Current Balance</span>
                  <span style={{ fontSize: "24px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>₹{(b.balance || 0).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "3px", fontSize: "12px", color: "#475569", fontWeight: 500 }}>
                  <div>Opening: <span style={{ color: "#64748B", fontWeight: 600 }}>₹{(b.openingBalance || b.balance || 0).toLocaleString('en-IN')}</span></div>
                  <div style={{ display: "flex", gap: "16px", marginTop: "4px", color: "#64748B", fontSize: "11px" }}>
                    <span>IFSC: <strong style={{ color: "#334155" }}>{b.ifsc || "N/A"}</strong></span>
                    <span>Branch: <strong style={{ color: "#334155" }}>{b.branch || "N/A"}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <button onClick={() => handleQuickActionTrigger(b.id, "Deposit")} style={{ background: "none", border: "none", color: "#198754", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}>
                    <ArrowDownLeft size={14} /> Deposit
                  </button>
                  <button onClick={() => handleQuickActionTrigger(b.id, "Withdraw")} style={{ background: "none", border: "none", color: "#DC3545", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}>
                    <ArrowUpRight size={14} /> Withdraw
                  </button>
                  <button onClick={() => handleQuickActionTrigger(b.id, "Transfer")} style={{ background: "none", border: "none", color: "#0D6EFD", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}>
                    <ArrowRightLeft size={14} /> Transfer
                  </button>
                </div>

                <button onClick={() => setActiveStatementId(activeStatementId === b.id ? null : b.id)} style={{ background: "none", border: "none", color: "#64748B", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", width: "max-content", padding: 0, marginTop: "2px" }}>
                  <FileText size={14} color="#94A3B8" /> Statement
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {activeStatementId && selectedBankData && (
        <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>Account Passbook Statement Records</h3>
              <small style={{ color: "#64748B" }}>Real-time dynamic audit logs for: <strong style={{ color: "#1E293B" }}>{selectedBankData.name}</strong></small>
            </div>
            <button onClick={() => setActiveStatementId(null)} style={{ padding: "6px 14px", backgroundColor: "#F1F5F9", color: "#475569", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>Dismiss Registry</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...selectedBankData.history].reverse().map((log: any, lIdx: number) => {
              const isDeposit = log.type === "DEPOSIT" || log.type === "CREDIT";
              return (
                <div key={lIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>{log.date}</div>
                    <span style={{ fontSize: "13px", color: "#1E293B", fontWeight: 600 }}>{log.desc}</span>
                  </div>
                  <strong style={{ color: isDeposit ? "#198754" : "#DC3545", fontSize: "14px" }}>
                    {isDeposit ? "+" : "-"} ₹{log.amount.toLocaleString()}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}