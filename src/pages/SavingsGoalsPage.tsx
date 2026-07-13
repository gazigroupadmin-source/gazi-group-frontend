import React, { useState, useEffect } from "react";
import { Plus, Trash2, Target, X, Calendar, Landmark, Briefcase, Layers } from "lucide-react";

export default function SavingsGoalsPage({ onSync }: { onSync: () => void }) {
  const userEmail = localStorage.getItem("userEmail") || "Guest User";
  
  // Master Registries States Pools
  const [goals, setGoals] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [directInvestments, setDirectInvestments] = useState<any[]>([]);
  const [mutualFunds, setMutualFunds] = useState<any[]>([]);
  
  // Modals Overlay Visibility Flag
  const [openAddGoal, setOpenAddGoal] = useState(false);
  const [activeGoalStatementId, setActiveGoalStatementId] = useState<string | null>(null);

  // Form Field Component Variables for Savings Registry Framework
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("0");
  const [targetDate, setTargetDate] = useState("2026-12-31");
  
  // --- ACCOUNT SELECTION & BINDING SYSTEM CONTROLS ---
  const [accountBindingType, setAccountBindingType] = useState("BANK"); 
  const [boundAccountId, setBoundAccountId] = useState("");

  const loadGoalsDataMatrix = () => {
    const savedGoals = localStorage.getItem(`savingsGoalsList_${userEmail}`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      const defaultGoals = [
        { id: "1", name: "EMERGENCY CONTINGENCY FUND", target: 50000, saved: 15000, date: "2026-12-31", bindingType: "BANK", boundNode: "Self Account Reserves", history: [{ date: "2026-07-11", desc: "Vault Opening Base Allocation", amount: 15000, type: "DEBIT" }] },
        { id: "2", name: "NEXT GEN WORKSTATION BUILD", target: 120000, saved: 45000, date: "2027-06-15", bindingType: "MUTUAL_FUND", boundNode: "SIP Portfolio Compound", history: [{ date: "2026-07-11", desc: "Vault Opening Base Allocation", amount: 45000, type: "DEBIT" }] }
      ];
      setGoals(defaultGoals);
      localStorage.setItem(`savingsGoalsList_${userEmail}`, JSON.stringify(defaultGoals));
    }

    const savedBanks = localStorage.getItem(`bankAccountsList_${userEmail}`);
    const savedDirect = localStorage.getItem(`directInvestList_${userEmail}`);
    const savedMf = localStorage.getItem(`mfInvestList_${userEmail}`);
    
    if (savedBanks) setBankAccounts(JSON.parse(savedBanks));
    if (savedDirect) setDirectInvestments(JSON.parse(savedDirect));
    if (savedMf) setMutualFunds(JSON.parse(savedMf));
  };

  useEffect(() => {
    loadGoalsDataMatrix();
  }, [userEmail, openAddGoal]);

  const handleCreateSavingsGoal = () => {
    if (!goalName || !targetAmount) return;
    const tAmt = parseFloat(targetAmount);
    const sAmt = parseFloat(savedAmount || "0");

    let targetNodeLabelName = "General Unbound Node";
    if (boundAccountId) {
      if (accountBindingType === "BANK") {
        targetNodeLabelName = bankAccounts.find(b => b.id === boundAccountId)?.name || "Bank Node";
      } else if (accountBindingType === "ASSET") {
        targetNodeLabelName = directInvestments.find(d => d.id === boundAccountId)?.name || "Asset Stock Portfolio";
      } else if (accountBindingType === "MUTUAL_FUND") {
        targetNodeLabelName = mutualFunds.find(m => m.id === boundAccountId)?.name || "Mutual Fund Pool";
      }
    }

    const updated = [...goals];
    updated.push({
      id: Date.now().toString(),
      name: goalName.toUpperCase().trim(),
      target: tAmt,
      saved: sAmt,
      date: targetDate,
      bindingType: accountBindingType,
      boundNode: targetNodeLabelName,
      history: [{ date: new Date().toISOString().slice(0, 10), desc: `Goal Initiated Allocated on ${targetNodeLabelName}`, amount: sAmt, type: "DEPOSIT" }]
    });

    localStorage.setItem(`savingsGoalsList_${userEmail}`, JSON.stringify(updated));
    setGoals(updated);
    
    setGoalName(""); setTargetAmount(""); setSavedAmount("0"); setBoundAccountId("");
    setOpenAddGoal(false);
    onSync();
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    localStorage.setItem(`savingsGoalsList_${userEmail}`, JSON.stringify(updated));
    setGoals(updated);
    if (activeGoalStatementId === id) setActiveGoalStatementId(null);
    onSync();
  };

  const selectedGoalData = goals.find(g => g.id === activeGoalStatementId);
  const designPalette = ["#00CFE8", "#7367F0", "#FF9F43", "#28C76F", "#EA5455", "#60A5FA"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", width: "100%", fontFamily: "system-ui, sans-serif", textAlign: "left", position: "relative", backgroundColor: "#0B1224", padding: "24px", borderRadius: "20px", boxSizing: "border-box", color: "#FFFFFF", minHeight: "100%" }}>
      
      {/* HEADER CONTROLS ROW PANEL */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, margin: 0, letterSpacing: "-0.6px" }}>Savings Framework Goals</h1>
          <p style={{ color: "#94A3B8", fontSize: "13px", marginTop: "4px" }}>Deploy and accumulate capital provisions across bank loops or asset nodes</p>
        </div>
        <button onClick={() => openAddGoal ? setOpenAddGoal(false) : setOpenAddGoal(true)} style={{ padding: "12px 22px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}>
          <Plus style={{ width: "16px", height: "16px" }} /> Add Savings Target
        </button>
      </div>

      {/* 🌟 GOAL CREATION POPUP WINDOW MODAL LAYER */}
      {openAddGoal && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
          <div style={{ backgroundColor: "#141D32", width: "460px", padding: "28px", borderRadius: "24px", border: "1px solid #232E48", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            
            <button onClick={() => setOpenAddGoal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}>×</button>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Deploy Savings Target Vault</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input placeholder="Goal Matrix Name (e.g. Real-Estate Downpayment)" value={goalName} onChange={e => setGoalName(e.target.value)} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155", fontSize: "13px" }} />
              <input type="number" placeholder="Target Capital Required (₹)" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155", fontSize: "13px" }} />
              <input type="number" placeholder="Currently Stashed / Initial Allocation (₹)" value={savedAmount} onChange={e => setSavedAmount(e.target.value)} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155", fontSize: "13px" }} />
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155", fontSize: "13px" }} />
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid #232E48", paddingTop: "12px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>ACCUMULATION SETTLEMENT VENUE DESTINATION *</label>
                <select value={accountBindingType} onChange={e => { setAccountBindingType(e.target.value); setBoundAccountId(""); }} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #334155", color: "#FFF", fontSize: "13px" }}>
                  <option value="BANK">🏛️ SOLID LIQUIDITY BANK ACCOUNT</option>
                  <option value="ASSET">📈 DIRECT ASSETS / PORTFOLIO SHARES</option>
                  <option value="MUTUAL_FUND">📊 MUTUAL FUND POOLS MATRIX</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", color: "#00CFE8", fontWeight: 700 }}>SELECT LINKED ACCOUNT SPECIFIC TARGET NODE *</label>
                <select value={boundAccountId} onChange={e => setBoundAccountId(e.target.value)} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #334155", color: "#FFF", fontSize: "13px" }}>
                  <option value="">-- CHOOSE MAPPED INTERCONNECTION HUB --</option>
                  {accountBindingType === "BANK" && bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name} (Bal: ₹{b.balance.toLocaleString()})</option>)}
                  {accountBindingType === "ASSET" && directInvestments.map(d => <option key={d.id} value={d.id}>{d.name} [{d.type}]</option>)}
                  {accountBindingType === "MUTUAL_FUND" && mutualFunds.map(m => <option key={m.id} value={m.id}>{m.name} ({m.fundHouse})</option>)}
                </select>
              </div>

            </div>

            <button onClick={handleCreateSavingsGoal} style={{ padding: "14px", backgroundColor: "#10B981", border: "none", borderRadius: "12px", color: "#FFF", fontWeight: 700, cursor: "pointer", marginTop: "4px" }}>Commit Target Goal</button>
          </div>
        </div>
      )}

      {/* 🚀 BOX GRID CARDS DISPLAY DECK */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        {goals.map((g, i) => {
          const target = parseFloat(g.target) || 0;
          const saved = parseFloat(g.saved) || 0;
          const ratio = target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0;
          const accentColor = designPalette[i % designPalette.length];

          return (
            <div key={g.id || i} style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", overflow: "hidden", position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
              <div style={{ width: "100%", height: "4px", backgroundColor: accentColor }} />
              
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                
                <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <button onClick={() => setActiveGoalStatementId(activeGoalStatementId === g.id ? null : g.id)} style={{ background: "none", border: "none", color: "#00CFE8", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
                    Statements
                  </button>
                  <button onClick={() => handleDeleteGoal(g.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}>
                    <Trash2 style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Target style={{ width: "18px", height: "18px", color: accentColor }} />
                  <h4 style={{ margin: 0, fontSize: "14px", textTransform: "uppercase", fontWeight: 800, color: "#FFFFFF" }}>{g.name}</h4>
                </div>

                <div style={{ width: "100%", height: "8px", backgroundColor: "#0B1224", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${ratio}%`, height: "100%", backgroundColor: accentColor }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#94A3B8" }}>
                  <div>Stashed: <strong style={{ color: "#FFFFFF" }}>₹{saved.toLocaleString()}</strong> / ₹{target.toLocaleString()}</div>
                  <span style={{ color: accentColor, fontWeight: 800 }}>{ratio}% ready</span>
                </div>

                <div style={{ borderTop: "1px dashed #232E48", paddingTop: "10px", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {g.bindingType === "BANK" ? <Landmark size={12} color="#64748B"/> : <Briefcase size={12} color="#64748B"/>}
                  <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 600 }}>Bound Vault Base: <strong style={{ color: "#CBD5E1" }}>{g.boundNode || "Isolated Reserve"}</strong></span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* 📊 DYNAMIC PASSBOOK SYSTEM STATEMENT GRID TRAILS MODULE */}
      {activeGoalStatementId !== null && selectedGoalData && (
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "20px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #232E48", paddingBottom: "12px", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>Target Capital Matrix Audit Trails</h3>
              <small style={{ color: "#94A3B8" }}>Amortization wire settlement sequences for: <strong style={{ color: "#FFFFFF" }}>{selectedGoalData.name}</strong></small>
            </div>
            <button onClick={() => setActiveGoalStatementId(null)} style={{ padding: "6px 14px", backgroundColor: "#232E48", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>Dismiss Registry</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(selectedGoalData.history || []).map((st: any, sIdx: number) => (
              <div key={sIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0B1224", padding: "12px 16px", borderRadius: "10px", border: "1px solid #232E48" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Calendar style={{ width: "14px", height: "14px", color: "#64748B" }} />
                  <div>
                    <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>{st.date}</span>
                    <strong style={{ fontSize: "13px", color: "#FFFFFF" }}>{st.desc}</strong>
                  </div>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#10B981" }}>
                  + ₹{st.amount.toLocaleString()}
                </span>
              </div>
            ))}
            
            {(selectedGoalData.history || []).length === 0 && (
              <div style={{ fontSize: "12px", color: "#64748B", padding: "10px", textAlign: "center" }}>No transaction records synced to this goal instance yet.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}