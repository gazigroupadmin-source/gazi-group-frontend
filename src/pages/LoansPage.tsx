import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, FolderPlus, Receipt, Camera, Calendar, Sparkles } from "lucide-react";

export default function LoansPage({ onSync }: { onSync: () => void }) {
  const userEmail = localStorage.getItem("userEmail") || "Guest User";
  
  // Dynamic Real-time Core Data Storage Pools
  const [loans, setLoans] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [repaymentYears, setRepaymentYears] = useState(5); 

  // STRICT FULL FUNCTIONAL REGISTRY COMPLIANT STATE STORAGE FORM ARRAYS
  const [loanType, setLoanType] = useState("Personal Loan");
  const [lender, setLender] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("8.5");
  const [tenure, setTenure] = useState("120");
  const [dueDate, setDueDate] = useState("1");
  const [startDate, setStartDate] = useState("2026-07-11");
  const [notes, setNotes] = useState("");
  const [frequency, setFrequency] = useState("Monthly");

  // CARD UTILITY TRIGGER SWITCH VARIABLES
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editRemaining, setEditRemaining] = useState("");
  const [activeStatementIdx, setActiveStatementIdx] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payingIdx, setPayingIdx] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ⚡ FIXED: DATA MAPPING KEYS BIND WITH DISTINCT IDENTITY FILTERS FOR FRESH USERS
  useEffect(() => {
    const data = localStorage.getItem(`loansList_${userEmail}`);
    if (data) {
      setLoans(JSON.parse(data));
    } else {
      const isRootAdmin = userEmail.toLowerCase() === "saifulgazi646@gmail.com" || userEmail.toLowerCase() === "saifulgazi66@gmail.com";
      const defaults = isRootAdmin ? [
        { id: "1", loanType: "Other", lender: "SBM GOLD CARD", principal: 37375, remainingAmount: 37375, totalPaid: 0, interestRate: 12, tenure: 12, dueDate: 5, startDate: "2026-07-01", notes: "Started Jul 2026", emi: 3242, frequency: "Monthly", avatar: "", statements: [{ date: "2026-07-02", desc: "Opening Balance Ledger", amount: 37375, type: "DEBIT" }] },
        { id: "2", loanType: "Personal Loan", lender: "HDFC CORE NODE", principal: 1754408, remainingAmount: 1754408, totalPaid: 0, interestRate: 8.5, tenure: 120, dueDate: 1, startDate: "2026-07-11", notes: "Core asset", emi: 11500, frequency: "Monthly", avatar: "", statements: [{ date: "2026-07-11", desc: "Core asset deployment node", amount: 1754408, type: "DEBIT" }] }
      ] : [];
      localStorage.setItem(`loansList_${userEmail}`, JSON.stringify(defaults));
      setLoans(defaults);
    }
  }, [userEmail, openAdd, editingIdx, payingIdx, refreshTrigger]);

  const calculateAdvancedEMI = (p: number, r: number, t: number, freq: string) => {
    if (!p || !t) return 0;
    let adjustedTenure = t;
    if (freq === "Daily") adjustedTenure = t * 30;
    if (freq === "Weekly") adjustedTenure = t * 4;
    if (r === 0) return Math.round(p / adjustedTenure);
    const monthlyRate = r / 12 / 100;
    let ratePerPeriod = monthlyRate;
    if (freq === "Daily") ratePerPeriod = monthlyRate / 30;
    if (freq === "Weekly") ratePerPeriod = monthlyRate / 4;
    return Math.round((p * ratePerPeriod * Math.pow(1 + ratePerPeriod, adjustedTenure)) / (Math.pow(1 + ratePerPeriod, adjustedTenure) - 1));
  };

  const handleCreateLoan = () => {
    if (!lender || !principal) return;
    const pAmt = parseFloat(principal);
    const rRate = parseFloat(interestRate || "0");
    const tDuration = parseInt(tenure || "12");
    const computedEmi = calculateAdvancedEMI(pAmt, rRate, tDuration, frequency);

    const current = [...loans];
    current.push({
      id: Date.now().toString(),
      loanType,
      lender: lender.toUpperCase().trim(),
      principal: pAmt,
      remainingAmount: pAmt,
      totalPaid: 0,
      interestRate: rRate,
      tenure: tDuration,
      dueDate: parseInt(dueDate || "1"),
      startDate,
      notes,
      frequency,
      emi: computedEmi,
      avatar: "",
      statements: [{ date: new Date().toISOString().slice(0, 10), desc: "Loan Account Initialized", amount: pAmt, type: "DEBIT" }]
    });

    localStorage.setItem(`loansList_${userEmail}`, JSON.stringify(current));
    setLoans(current);
    setLender(""); setPrincipal(""); setNotes(""); setInterestRate("8.5");
    setOpenAdd(false);
    onSync();
  };

  const handleManualPayment = (idx: number) => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;

    const current = [...loans];
    const target = current[idx];
    
    target.remainingAmount = target.remainingAmount - amt;
    target.totalPaid = (target.totalPaid || 0) + amt;
    
    target.statements.push({
      date: new Date().toISOString().slice(0, 10),
      desc: "Manual Payment Allocation Node",
      amount: amt,
      type: "CREDIT"
    });

    const globalHistoryRaw = localStorage.getItem(`finvault_master_tx_history_${userEmail}`);
    let globalHistory = globalHistoryRaw ? JSON.parse(globalHistoryRaw) : [];
    globalHistory.push({
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      type: "WITHDRAW",
      source: "Manual EMI Gate",
      destination: `Loan Node: ${target.lender}`,
      amount: amt,
      desc: `Manual payment commitment to ${target.lender}`
    });
    localStorage.setItem(`finvault_master_tx_history_${userEmail}`, JSON.stringify(globalHistory));

    localStorage.setItem(`loansList_${userEmail}`, JSON.stringify(current));
    setLoans(current);
    setPayAmount(""); setPayingIdx(null);
    onSync();
  };

  const handlePhotoUpload = (idx: number, base64: string) => {
    const current = [...loans];
    current[idx].avatar = base64;
    localStorage.setItem(`loansList_${userEmail}`, JSON.stringify(current));
    setLoans(current);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = (idx: number) => {
    const current = [...loans];
    current.splice(idx, 1);
    localStorage.setItem(`loansList_${userEmail}`, JSON.stringify(current));
    setLoans(current);
    onSync();
  };

  const saveInlineEdit = (idx: number) => {
    const current = [...loans];
    const newRemaining = parseFloat(editRemaining || "0");
    current[idx].totalPaid = current[idx].principal - newRemaining;
    current[idx].remainingAmount = newRemaining;
    current[idx].statements.push({ date: new Date().toISOString().slice(0, 10), desc: "Inline Adjustment", amount: newRemaining, type: "DEBIT" });
    localStorage.setItem(`loansList_${userEmail}`, JSON.stringify(current));
    setLoans(current);
    setEditingIdx(null);
    onSync();
  };

  // Math Metrics Processors
  const totalPrincipal = loans.reduce((sum, l) => sum + (parseFloat(l.principal) || 0), 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + (parseFloat(l.remainingAmount) || 0), 0);
  const totalPaid = loans.reduce((sum, l) => sum + (parseFloat(l.totalPaid) || 0), 0);
  const totalMonthlyEmi = loans.reduce((sum, l) => sum + (parseFloat(l.emi) || 0), 0);
  const overallRepaymentPct = totalPrincipal > 0 ? Math.min(Math.round((totalPaid / totalPrincipal) * 100), 100) : 0;

  const strategicPlannedMonthlyPayment = totalOutstanding > 0 ? Math.round(totalOutstanding / (repaymentYears * 12)) : 0;
  const designPalette = ["#00CFE8", "#7367F0", "#FF9F43", "#28C76F", "#EA5455", "#60A5FA"];

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", flexDirection: "column", gap: "28px", fontFamily: "system-ui, sans-serif", textAlign: "left", position: "relative", backgroundColor: "#0B1224", padding: "24px", borderRadius: "20px", boxSizing: "border-box", minHeight: "100%" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", margin: 0, letterSpacing: "-0.5px" }}>Loan Management</h1>
          <p style={{ color: "#94A3B8", fontSize: "12px", margin: "4px 0 0 0" }}>Track EMIs, amortization records and active cash metrics logs.</p>
        </div>
        <button onClick={() => setOpenAdd(true)} style={{ padding: "10px 20px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
          <Plus style={{ width: "14px", height: "14px" }} /> Add Loan
        </button>
      </div>

      <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            <Sparkles style={{ width: "16px", height: "16px", color: "#00CFE8" }} />
            <span>Portfolio Overview</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#0B1224", padding: "6px 12px", borderRadius: "10px", border: "1px solid #232E48" }}>
            <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>PLAN CLEARANCE:</span>
            <select 
              value={repaymentYears} 
              onChange={e => setRepaymentYears(parseInt(e.target.value))} 
              style={{ background: "#141D32", color: "#10B981", border: "1px solid #334155", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 700, outline: "none", cursor: "pointer" }}
            >
              {[1, 2, 3, 5, 10, 15, 20].map(y => <option key={y} value={y}>{y} Years</option>)}
            </select>
            <div style={{ borderLeft: "1px solid #232E48", paddingLeft: "8px", fontSize: "11px", color: "#FFFFFF", fontWeight: 600 }}>
              Target: <span style={{ color: "#00CFE8", fontWeight: 800 }}>₹{strategicPlannedMonthlyPayment.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          {[
            { label: "Total Principal", val: totalPrincipal, color: "#FFFFFF" },
            { label: "Outstanding", val: totalOutstanding, color: "#EF4444" },
            { label: "Total Paid", val: totalPaid, color: "#10B981" },
            { label: "Monthly EMIs", val: totalMonthlyEmi, color: "#00CFE8" }
          ].map((item, idx) => (
            <div key={idx} style={{ backgroundColor: "#0B1224", border: "1px solid #1E293B", padding: "16px 20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>{item.label}</span>
              <span style={{ fontSize: "20px", fontWeight: 800, color: item.color }}>₹{item.val.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>
            <span>Overall repayment progress</span>
            <span>{overallRepaymentPct}% completed</span>
          </div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#0B1224", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${overallRepaymentPct}%`, height: "100%", backgroundColor: "#2563EB", transition: "width 0.3s ease" }} />
          </div>
        </div>
      </div>

      {openAdd && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
          <div style={{ backgroundColor: "#141D32", width: "520px", padding: "24px", borderRadius: "20px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: "16px", border: "1px solid #232E48", position: "relative" }}>
            <button onClick={() => setOpenAdd(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#64748B", cursor: "pointer" }}>
              <X style={{ width: "18px", height: "18px" }} />
            </button>
            <div style={{ borderBottom: "1px solid #232E48", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FolderPlus style={{ width: "16px", height: "16px", color: "#00CFE8" }} />
              <strong style={{ fontSize: "15px", color: "#FFFFFF" }}>Add New Loan</strong>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8" }}>Loan Type *</label>
                <select value={loanType} onChange={e => setLoanType(e.target.value)} style={{ padding: "10px", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#FFFFFF", backgroundColor: "#0B1224", outline: "none" }}>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Other">Other Type</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8" }}>Lender Name *</label>
                <input type="text" value={lender} onChange={e => setLender(e.target.value)} placeholder="e.g. HDFC Bank" style={{ padding: "10px", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#FFFFFF", backgroundColor: "#0B1224", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8" }}>Principal Amount (₹) *</label>
                <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="0" style={{ padding: "10px", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#FFFFFF", backgroundColor: "#0B1224", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8" }}>Interest Rate (% p.a.) *</label>
                <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="8.5" style={{ padding: "10px", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#FFFFFF", backgroundColor: "#0B1224", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8" }}>EMI Plan Frequency *</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ padding: "10px", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#FFFFFF", backgroundColor: "#0B1224", outline: "none" }}>
                  <option value="Daily">Daily Basis</option>
                  <option value="Weekly">Weekly Basis</option>
                  <option value="Monthly">Monthly Basis</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8" }}>Tenure Length Count *</label>
                <input type="number" value={tenure} onChange={e => setTenure(e.target.value)} placeholder="120" style={{ padding: "10px", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#FFFFFF", backgroundColor: "#0B1224", outline: "none" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8" }}>EMI Due Base Day</label>
                <input type="number" value={dueDate} onChange={e => setDueDate(e.target.value)} placeholder="1" style={{ padding: "10px", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#FFFFFF", backgroundColor: "#0B1224", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8" }}>Start Calendar Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: "10px", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#FFFFFF", backgroundColor: "#0B1224", outline: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8" }}>Notes (optional)</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any specific notations..." style={{ padding: "10px", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#FFFFFF", backgroundColor: "#0B1224", outline: "none" }} />
            </div>
            <button onClick={handleCreateLoan} style={{ padding: "12px", backgroundColor: "#00CFE8", color: "#0B1224", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginTop: "4px" }}>Add Loan Account Node</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        {loans.map((l, i) => {
          const cap = parseFloat(l.principal) || 0;
          const remainingAmount = parseFloat(l.remainingAmount) || 0;
          const isOverpaid = remainingAmount < 0;
          
          const displayLabelAmount = Math.abs(remainingAmount);
          const paid = Math.max(0, cap - remainingAmount);
          const ratio = cap > 0 ? Math.min(Math.round((paid / cap) * 100), 100) : 0;
          const accentColor = designPalette[i % designPalette.length];

          return (
            <div key={l.id || i} style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
              <div style={{ width: "100%", height: "4px", backgroundColor: accentColor }} />
              
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <button onClick={() => { setEditingIdx(i); setEditRemaining(remainingAmount.toString()); }} style={{ background: "none", border: "none", color: "#60A5FA", cursor: "pointer" }}>
                    <Edit2 style={{ width: "14px", height: "14px" }} />
                  </button>
                  <button onClick={() => setActiveStatementIdx(activeStatementIdx === i ? null : i)} style={{ background: "none", border: "none", color: "#00CFE8", cursor: "pointer" }}>
                    <Receipt style={{ width: "14px", height: "14px" }} />
                  </button>
                  <button onClick={() => handleDelete(i)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}>
                    <Trash2 style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px dashed #334155", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {l.avatar ? <img src={l.avatar} alt="loan badge" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera style={{ width: "16px", height: "16px", color: "#475569" }} />}
                    <input type="file" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader();
                        r.onloadend = () => handlePhotoUpload(i, r.result as string);
                        r.readAsDataURL(file);
                      }
                    }} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>{l.lender}</h3>
                    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      <span style={{ fontSize: "9px", backgroundColor: "#0B1224", color: "#94A3B8", padding: "2px 6px", borderRadius: "4px" }}>{l.loanType}</span>
                      <span style={{ fontSize: "9px", backgroundColor: "#0B1224", color: "#00CFE8", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>₹{l.emi}/{l.frequency === "Daily" ? "day" : l.frequency === "Weekly" ? "wk" : "mo"}</span>
                    </div>
                  </div>
                </div>

                <div style={{ width: "100%", height: "8px", backgroundColor: "#0B1224", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${ratio}%`, height: "100%", backgroundColor: accentColor }} />
                </div>

                {editingIdx === i && (
                  <div style={{ display: "flex", gap: "6px", backgroundColor: "#0B1224", padding: "8px", borderRadius: "8px" }}>
                    <input type="number" value={editRemaining} onChange={e => setEditRemaining(e.target.value)} style={{ padding: "6px", borderRadius: "6px", backgroundColor: "#141D32", color: "#FFFFFF", border: "1px solid #334155", fontSize: "12px", width: "110px" }} />
                    <button onClick={() => saveInlineEdit(idx)} style={{ padding: "4px 8px", backgroundColor: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "11px" }}>Save</button>
                    <button onClick={() => setEditingIdx(null)} style={{ padding: "4px 8px", backgroundColor: "#64748B", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "11px" }}>X</button>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px dashed #232E48", paddingTop: "12px" }}>
                  <input type="number" value={payingIdx === i ? payAmount : ""} onChange={e => { setPayingIdx(i); setPayAmount(e.target.value); }} placeholder="Payment Amount (₹)" style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "12px", outline: "none" }} />
                  <button onClick={() => handleManualPayment(i)} style={{ padding: "8px 16px", backgroundColor: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Pay Now</button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94A3B8" }}>
                  <div>
                    {isOverpaid ? (
                      <span style={{ color: "#10B981", fontWeight: "700" }}>₹{displayLabelAmount.toLocaleString()} Surplus Advance</span>
                    ) : (
                      <>
                        <strong style={{ color: "#FFFFFF", fontSize: "14px" }}>₹{displayLabelAmount.toLocaleString()}</strong> remaining
                      </>
                    )}
                  </div>
                  <span>{isOverpaid ? "100%" : `${ratio}%`} paid</span>
                </div>
              </div>
            </div>
          );
        })}
        {loans.length === 0 && (
          <div style={{ color: "#64748B", fontSize: "13px", padding: "20px", gridColumn: "1/-1", textAlign: "center" }}>No outstanding liability or active debt matrices logged.</div>
        )}
      </div>

      {activeStatementIdx !== null && (
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "20px", padding: "24px", marginTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #232E48", paddingBottom: "12px", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>Account Statement Ledger Logs</h3>
              <small style={{ color: "#94A3B8" }}>Audit trail for liability registry: {loans[activeStatementIdx]?.lender}</small>
            </div>
            <button onClick={() => setActiveStatementIdx(null)} style={{ padding: "4px 12px", backgroundColor: "#232E48", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>Close Panel</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(loans[activeStatementIdx]?.statements || []).map((st: any, sIdx: number) => (
              <div key={sIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0B1224", padding: "12px 16px", borderRadius: "10px", border: "1px solid #232E48" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Calendar style={{ width: "14px", height: "14px", color: "#64748B" }} />
                  <div>
                    <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>{st.date}</span>
                    <strong style={{ fontSize: "13px", color: "#FFFFFF" }}>{st.desc}</strong>
                  </div>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: st.type === "CREDIT" ? "#10B981" : "#EF4444" }}>
                  {st.type === "CREDIT" ? "+" : "-"} ₹{st.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}