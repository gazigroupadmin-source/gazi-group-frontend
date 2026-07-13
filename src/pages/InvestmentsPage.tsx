import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Camera, Receipt, Calendar } from "lucide-react";

type TabType = "portfolio" | "direct" | "mf";

export default function InvestmentsPage({ onSync }: { onSync?: () => void }) {
  const userEmail = localStorage.getItem("userEmail") || "Guest User";
  
  // Navigation Routing Toggle Control
  const [activeTab, setActiveTab] = useState<TabType>("portfolio");
  
  // Data Storage Registries Pools
  const [directInvestments, setDirectInvestments] = useState<any[]>([]);
  const [mutualFunds, setMutualFunds] = useState<any[]>([]);
  
  // Index Trackers for Statement Drawers
  const [activeStatementAssetId, setActiveStatementId] = useState<string | null>(null);
  const [activeStatementType, setActiveStatementType] = useState<"DIRECT" | "MF" | null>(null);

  // Popups Visibility Flags
  const [openDirectModal, setOpenDirectModal] = useState(false);
  const [openMfModal, setOpenMfModal] = useState(false);

  // Inline Editing Tracking Indexes State
  const [editingDirectId, setEditingDirectId] = useState<string | null>(null);
  const [editDirectCurrent, setEditDirectCurrent] = useState("");
  const [editingMfId, setEditingMfId] = useState<string | null>(null);
  const [editMfCurrent, setEditMfCurrent] = useState("");

  // --- EXACT SCREENSHOT MATCHED FORM INPUT FIELDS: DIRECT ---
  const [assetType, setAssetType] = useState("Stock");
  const [assetName, setAssetName] = useState("");
  const [directInvested, setDirectInvested] = useState("0");
  const [directCurrent, setDirectCurrent] = useState("");
  const [directUnits, setDirectUnits] = useState("");
  const [directPricePerUnit, setDirectPricePerUnit] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("2026-07-11");
  const [directNotes, setDirectNotes] = useState("");

  // --- EXACT SCREENSHOT MATCHED FORM INPUT FIELDS: MUTUAL FUNDS ---
  const [fundName, setFundName] = useState("");
  const [fundHouse, setFundHouse] = useState("");
  const [invType, setInvType] = useState("Lumpsum");
  const [mfCategory, setMfCategory] = useState("");
  const [mfInvested, setMfInvested] = useState("0");
  const [mfCurrent, setMfCurrent] = useState("");
  const [mfNav, setMfNav] = useState("0.00");
  const [mfUnits, setMfUnits] = useState("0.000");
  const [mfStartDate, setMfStartDate] = useState("2026-07-11");

  // ⚡ FIXED: USER ISOLATION DATA LOADING MATRIX WITH ZERO-DATA DEFAULTS FOR FRESH SIGN UPS
  useEffect(() => {
    const savedDirect = localStorage.getItem(`directInvestList_${userEmail}`);
    const savedMf = localStorage.getItem(`mfInvestList_${userEmail}`);
    
    if (savedDirect) {
      setDirectInvestments(JSON.parse(savedDirect));
    } else {
      // Root defaults are only initialized if the user is the primary admin node, else stays absolute zero
      const isRootAdmin = userEmail.toLowerCase() === "saifulgazi646@gmail.com" || userEmail.toLowerCase() === "saifulgazi66@gmail.com";
      const defaultDirect = isRootAdmin ? [
        { id: "1", type: "Other", name: "AXIS BANK PPF", invested: 1000, current: 1059, units: 1, pricePerUnit: 1059, date: "2026-07-04", notes: "Held 7d", avatar: "", history: [{ date: "2026-07-04", desc: "Initial Investment Node Allocated", amount: 1000, type: "DEBIT" }] },
        { id: "2", type: "Other", name: "AXIS NPS", invested: 500, current: 459, units: 1, pricePerUnit: 459, date: "2026-07-04", notes: "Held 7d", avatar: "", history: [{ date: "2026-07-04", desc: "Initial Investment Node Allocated", amount: 500, type: "DEBIT" }] },
        { id: "3", type: "Other", name: "TDS", invested: 405, current: 405, units: 1, pricePerUnit: 405, date: "2026-07-04", notes: "Held 7d", avatar: "", history: [{ date: "2026-07-04", desc: "Tax Safe Settlement Entry", amount: 405, type: "DEBIT" }] },
        { id: "4", type: "Bond", name: "MUMBAI ROOM", invested: 15000, current: 15000, units: 1, pricePerUnit: 15000, date: "2026-07-04", notes: "Held 7d", avatar: "", history: [{ date: "2026-07-04", desc: "Real-Estate Liquidity Bond", amount: 15000, type: "DEBIT" }] },
        { id: "5", type: "Cryptocurrency", name: "BIT COIN", invested: 200, current: 129, units: 1, pricePerUnit: 129, date: "2026-07-04", notes: "Held 7d", avatar: "", history: [{ date: "2026-07-04", desc: "Crypto Core Position Taken", amount: 200, type: "DEBIT" }] }
      ] : [];
      setDirectInvestments(defaultDirect);
      localStorage.setItem(`directInvestList_${userEmail}`, JSON.stringify(defaultDirect));
    }

    if (savedMf) {
      setMutualFunds(JSON.parse(savedMf));
    } else {
      const isRootAdmin = userEmail.toLowerCase() === "saifulgazi646@gmail.com" || userEmail.toLowerCase() === "saifulgazi66@gmail.com";
      const defaultMf = isRootAdmin ? [
        { id: "1", name: "SBI ELSS TAX SEVAR FUND", fundHouse: "SBI", invType: "Lumpsum", category: "Tax Saver", invested: 3000, current: 3134, nav: 3134, units: 1, startDate: "2026-07-01", avatar: "", history: [{ date: "2026-07-01", desc: "Initial Lumpsum Deployment", amount: 3000, type: "DEBIT" }] },
        { id: "2", name: "ICICI GOLD ETF", fundHouse: "ICICI", invType: "SIP", category: "Gold", invested: 1200, current: 1250, nav: 100, units: 12, startDate: "2026-06-08", avatar: "", history: [{ date: "2026-06-08", desc: "SIP Automated Mandate Trigger", amount: 1200, type: "DEBIT" }] }
      ] : [];
      setMutualFunds(defaultMf);
      localStorage.setItem(`mfInvestList_${userEmail}`, JSON.stringify(defaultMf));
    }
  }, [userEmail, openDirectModal, openMfModal]);

  // --- ACTIONS SYSTEM CONTROLLERS ---
  const handleCreateDirect = () => {
    if (!assetName || !directInvested) return;
    const inv = parseFloat(directInvested || "0");
    const cur = parseFloat(directCurrent || directInvested || "0");

    const updatedList = [...directInvestments];
    updatedList.push({
      id: Date.now().toString(),
      type: assetType,
      name: assetName.toUpperCase().trim(),
      invested: inv,
      current: cur,
      units: parseFloat(directUnits || "1"),
      pricePerUnit: parseFloat(directPricePerUnit || cur.toString()),
      date: purchaseDate,
      notes: directNotes || "Active Entry Holdings",
      avatar: "",
      history: [{ date: purchaseDate, desc: "Asset Base Initialized", amount: inv, type: "DEBIT" }]
    });

    localStorage.setItem(`directInvestList_${userEmail}`, JSON.stringify(updatedList));
    setDirectInvestments(updatedList);
    setAssetName(""); setDirectInvested("0"); setDirectCurrent(""); setDirectUnits(""); setDirectPricePerUnit(""); setDirectNotes("");
    setOpenDirectModal(false);
    if (onSync) onSync();
  };

  const handleCreateMf = () => {
    if (!fundName || !mfInvested) return;
    const inv = parseFloat(mfInvested || "0");
    const cur = parseFloat(mfCurrent || mfInvested || "0");

    const updatedList = [...mutualFunds];
    updatedList.push({
      id: Date.now().toString(),
      name: fundName.toUpperCase().trim(),
      fundHouse: fundHouse.toUpperCase().trim() || "GENERAL",
      invType,
      category: mfCategory || "Growth Setup",
      invested: inv,
      current: cur,
      nav: parseFloat(mfNav || "0"),
      units: parseFloat(mfUnits || "0"),
      startDate: mfStartDate,
      avatar: "",
      history: [{ date: mfStartDate, desc: `${invType} Initial Subscription Deployment`, amount: inv, type: "DEBIT" }]
    });

    localStorage.setItem(`mfInvestList_${userEmail}`, JSON.stringify(updatedList));
    setMutualFunds(updatedList);
    setFundName(""); setFundHouse(""); setMfInvested("0"); setMfCurrent(""); setMfNav("0.00"); setMfUnits("0.000");
    setOpenMfModal(false);
    if (onSync) onSync();
  };

  const saveInlineDirectEdit = (id: string) => {
    const updated = directInvestments.map(item => {
      if (item.id === id) {
        const nextVal = parseFloat(editDirectCurrent || "0");
        item.history.push({ date: new Date().toISOString().slice(0, 10), desc: "Valuation Calibration", amount: nextVal, type: "DEBIT" });
        return { ...item, current: nextVal };
      }
      return item;
    });
    localStorage.setItem(`directInvestList_${userEmail}`, JSON.stringify(updated));
    setDirectInvestments(updated);
    setEditingDirectId(null);
    if (onSync) onSync();
  };

  const saveInlineMfEdit = (id: string) => {
    const updated = mutualFunds.map(item => {
      if (item.id === id) {
        const nextVal = parseFloat(editMfCurrent || "0");
        item.history.push({ date: new Date().toISOString().slice(0, 10), desc: "NAV Calibration Adjust", amount: nextVal, type: "DEBIT" });
        return { ...item, current: nextVal };
      }
      return item;
    });
    localStorage.setItem(`mfInvestList_${userEmail}`, JSON.stringify(updated));
    setMutualFunds(updated);
    setEditingMfId(null);
    if (onSync) onSync();
  };

  const handleDirectPhoto = (idx: number, base64: string) => {
    const updated = [...directInvestments];
    updated[idx].avatar = base64;
    localStorage.setItem(`directInvestList_${userEmail}`, JSON.stringify(updated));
    setDirectInvestments(updated);
  };

  const handleMfPhoto = (idx: number, base64: string) => {
    const updated = [...mutualFunds];
    updated[idx].avatar = base64;
    localStorage.setItem(`mfInvestList_${userEmail}`, JSON.stringify(updated));
    setMutualFunds(updated);
  };

  const handleDeleteDirect = (id: string) => {
    const updated = directInvestments.filter(item => item.id !== id);
    localStorage.setItem(`directInvestList_${userEmail}`, JSON.stringify(updated));
    setDirectInvestments(updated);
    if (activeStatementAssetId === id) setActiveStatementId(null);
    if (onSync) onSync();
  };

  const handleDeleteMf = (id: string) => {
    const updated = mutualFunds.filter(item => item.id !== id);
    localStorage.setItem(`mfInvestList_${userEmail}`, JSON.stringify(updated));
    setMutualFunds(updated);
    if (activeStatementAssetId === id) setActiveStatementId(null);
    if (onSync) onSync();
  };

  // --- REDUCE EVALUATIONS ENGINE ---
  const directTotalInv = directInvestments.reduce((sum, item) => sum + (parseFloat(item.invested) || 0), 0);
  const directTotalCur = directInvestments.reduce((sum, item) => sum + (parseFloat(item.current) || 0), 0);
  const mfTotalInv = mutualFunds.reduce((sum, item) => sum + (parseFloat(item.invested) || 0), 0);
  const mfTotalCur = mutualFunds.reduce((sum, item) => sum + (parseFloat(item.current) || 0), 0);

  const globalTotalInvested = directTotalInv + mfTotalInv;
  const globalCurrentValue = directTotalCur + mfTotalCur;
  const globalTotalGainLoss = globalCurrentValue - globalTotalInvested;

  const selectedStatementAsset = activeStatementType === "DIRECT" 
    ? directInvestments.find(d => d.id === activeStatementAssetId) 
    : mutualFunds.find(m => m.id === activeStatementAssetId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", width: "100%", fontFamily: "system-ui, sans-serif", textAlign: "left", backgroundColor: "#0B1224", padding: "24px", borderRadius: "20px", boxSizing: "border-box", color: "#FFFFFF", minHeight: "100%" }}>
      
      {/* 🚀 BANNER TOP */}
      <div>
        <h1 style={{ fontSize: "30px", fontWeight: 800, margin: 0, letterSpacing: "-0.6px" }}>Investments</h1>
        <p style={{ color: "#94A3B8", fontSize: "13px", marginTop: "4px" }}>Track wealth across all asset classes</p>
      </div>

      {/* 💳 BLOCKS MATRIX */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px" }}>
          <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 600 }}>TOTAL INVESTED</span>
          <h2 style={{ fontSize: "26px", fontWeight: 800, margin: 0, marginTop: "4px", color: "#FFFFFF" }}>₹{globalTotalInvested.toLocaleString('en-IN')}</h2>
        </div>
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px" }}>
          <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 600 }}>CURRENT VALUE</span>
          <h2 style={{ fontSize: "26px", fontWeight: 800, margin: 0, marginTop: "4px", color: "#60A5FA" }}>₹{globalCurrentValue.toLocaleString('en-IN')}</h2>
        </div>
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px" }}>
          <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 600 }}>TOTAL GAIN / LOSS</span>
          <h2 style={{ fontSize: "26px", fontWeight: 800, margin: 0, marginTop: "4px", color: globalTotalGainLoss >= 0 ? "#10B981" : "#EF4444" }}>
            {globalTotalGainLoss >= 0 ? "+" : ""}₹{globalTotalGainLoss.toLocaleString('en-IN')}
          </h2>
        </div>
      </div>

      {/* 🔄 TABS CONTROLLER CONTAINER */}
      <div style={{ display: "flex", gap: "10px", backgroundColor: "#141D32", padding: "4px", borderRadius: "12px", width: "max-content", border: "1px solid #232E48" }}>
        {(["portfolio", "direct", "mf"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", backgroundColor: activeTab === tab ? "#2563EB" : "transparent", color: "#FFFFFF" }}>
            {tab === "portfolio" ? "Portfolio" : tab === "direct" ? "Direct Investments" : "Mutual Funds"}
          </button>
        ))}
      </div>

      {/* 🌟 🌟 VIEW 1: PORTFOLIO MAIN TAB RENDERING 🌟 🌟 */}
      {activeTab === "portfolio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
            <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", padding: "24px", borderRadius: "16px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "15px" }}>Asset Allocation Overview</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", minHeight: "150px" }}>
                <div style={{ width: "110px", height: "110px", borderRadius: "50%", border: "12px solid #00CFE8", borderTopColor: "#7367F0", display: "flex", alignItems: "center", justifyContent: "center" }} />
                <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div><span style={{ color: "#7367F0" }}>●</span> Direct Assets Mapped Logs</div>
                  <div><span style={{ color: "#00CFE8" }}>●</span> Mutual Funds Assets Pool</div>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h3 style={{ margin: "0 0 10px 0" }}>Performance Shield Benchmarking</h3>
              <div style={{ width: "100%", height: "12px", backgroundColor: "#0B1224", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: "70%", height: "100%", backgroundColor: "#10B981" }} />
              </div>
              <span style={{ fontSize: "11px", color: "#94A3B8", marginTop: "8px" }}>Active Capital Allocation Yield Vector Matrix</span>
            </div>
          </div>

          <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: 700 }}>All Holdings — Performance Metrics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[...directInvestments, ...mutualFunds].map((h, idx) => {
                const gain = (parseFloat(h.current) || 0) - (parseFloat(h.invested) || 0);
                const isProfit = gain >= 0;
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0B1224", padding: "14px 20px", borderRadius: "12px", border: "1px solid #232E48" }}>
                    <div><strong>{h.name}</strong><br /><small style={{ color: "#64748B" }}>{h.type || h.category || "Asset"}</small></div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700 }}>₹{(parseFloat(h.current) || 0).toLocaleString()}</span>
                      <small style={{ display: "block", color: isProfit ? "#10B981" : "#EF4444", fontWeight: 700, marginTop: "2px" }}>
                        {isProfit ? "+" : ""}₹{gain.toLocaleString()}
                      </small>
                    </div>
                  </div>
                );
              })}
              {[...directInvestments, ...mutualFunds].length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>No active assets registered inside this profile workspace.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 🌟 VIEW 2: DIRECT INVESTMENTS 🌟 🌟 */}
      {activeTab === "direct" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#94A3B8" }}>Holdings Registry Active Node Deck</span>
            <button onClick={() => setOpenDirectModal(true)} style={{ padding: "8px 16px", backgroundColor: "#2563EB", border: "none", borderRadius: "8px", color: "#FFF", fontWeight: 700, cursor: "pointer" }}>+ Add Investment</button>
          </div>

          {openDirectModal && (
            <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 8, 22, 0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
              <div style={{ backgroundColor: "#141D32", width: "480px", padding: "24px", borderRadius: "20px", border: "1px solid #232E48", display: "flex", flexDirection: "column", gap: "14px", position: "relative" }}>
                <button onClick={() => setOpenDirectModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#64748B" }}>×</button>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Add Investment</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Type *</label>
                    <select value={assetType} onChange={e => setAssetType(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }}>
                      <option value="Stock">Stock</option><option value="Gold">Gold</option><option value="Fixed Deposit">Fixed Deposit</option><option value="Bond">Bond</option><option value="Cryptocurrency">Cryptocurrency</option><option value="Other">Other</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Name / Symbol *</label>
                    <input placeholder="e.g. HDFC Bank, Bitcoin" value={assetName} onChange={e => setAssetName(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Invested Amount (₹) *</label>
                    <input type="number" value={directInvested} onChange={e => setDirectInvested(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Current Value (₹)</label>
                    <input type="number" placeholder="Defaults to Invested" value={directCurrent} onChange={e => setDirectCurrent(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Units / Quantity</label>
                    <input type="number" placeholder="Optional" value={directUnits} onChange={e => setDirectUnits(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Purchase Price (₹/unit)</label>
                    <input type="number" placeholder="Per unit" value={directPricePerUnit} onChange={e => setDirectPricePerUnit(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", color: "#94A3B8" }}>Purchase Date *</label>
                  <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", color: "#94A3B8" }}>Notes</label>
                  <input placeholder="Optional notes..." value={directNotes} onChange={e => setDirectNotes(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                </div>

                <button onClick={handleCreateDirect} style={{ padding: "12px", backgroundColor: "#2563EB", border: "none", color: "#FFF", fontWeight: 700, borderRadius: "10px", cursor: "pointer" }}>Add Investment</button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {directInvestments.map((d, idx) => {
              const gain = (parseFloat(d.current) || 0) - (parseFloat(d.invested) || 0);
              const isProfit = gain >= 0;

              return (
                <div key={d.id || idx} style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px", position: "relative" }}>
                  <div style={{ position: "absolute", top: "18px", right: "18px", display: "flex", gap: "10px", alignItems: "center" }}>
                    <button onClick={() => { setEditingDirectId(d.id); setEditDirectCurrent(d.current.toString()); }} style={{ background: "none", border: "none", color: "#60A5FA", cursor: "pointer" }}><Edit2 size={13} /></button>
                    <button onClick={() => { setActiveStatementId(d.id); setActiveStatementType("DIRECT"); }} style={{ background: "none", border: "none", color: "#00CFE8", cursor: "pointer" }}><Receipt size={13} /></button>
                    <button onClick={() => handleDeleteDirect(d.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={13} /></button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px dashed #334155", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {d.avatar ? <img src={d.avatar} alt="attach" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera size={14} color="#64748B" />}
                      <input type="file" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onloadend = () => handleDirectPhoto(idx, r.result as string);
                          r.readAsDataURL(file);
                        }
                      }} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "15px", textTransform: "uppercase" }}>{d.name}</h4>
                      <span style={{ fontSize: "10px", color: "#64748B" }}>{d.type || "Asset Class"} Node</span>
                    </div>
                  </div>

                  {editingDirectId === d.id && (
                    <div style={{ display: "flex", gap: "6px", backgroundColor: "#0B1224", padding: "8px", borderRadius: "8px",延MBL: "10px", marginBottom: "10px" }}>
                      <input type="number" value={editDirectCurrent} onChange={e => setEditDirectCurrent(e.target.value)} style={{ padding: "4px", borderRadius: "4px", backgroundColor: "#141D32", color: "#FFF", border: "1px solid #334155", fontSize: "12px", width: "120px" }} />
                      <button onClick={() => saveInlineDirectEdit(d.id)} style={{ padding: "4px 8px", backgroundColor: "#10B981", color: "#FFF", border: "none", borderRadius: "4px", fontSize: "11px" }}>Update</button>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
                    <div><span style={{ color: "#64748B" }}>Invested:</span> <br /><strong>₹{d.invested.toLocaleString()}</strong></div>
                    <div><span style={{ color: "#64748B" }}>Current Value:</span> <br /><strong style={{ color: "#60A5FA" }}>₹{d.current.toLocaleString()}</strong></div>
                    <div><span style={{ color: "#64748B" }}>Quantity Units:</span> <br /><span>{d.units || 1} units</span></div>
                    <div><span style={{ color: "#64748B" }}>Net Returns:</span> <br /><span style={{ color: isProfit ? "#10B981" : "#EF4444", fontWeight: 700 }}>₹{gain.toLocaleString()}</span></div>
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748B", marginTop: "12px", borderTop: "1px dashed #232E48", paddingTop: "8px" }}>📝 Notes Log: {d.notes}</div>
                </div>
              );
            })}
            {directInvestments.length === 0 && (
              <div style={{ color: "#64748B", fontSize: "13px", padding: "20px", gridColumn: "1/-1", textAlign: "center" }}>No active investments logged inside this matrix node yet.</div>
            )}
          </div>
        </div>
      )}

      {/* 🌟 🌟 VIEW 3: MUTUAL FUNDS 🌟 🌟 */}
      {activeTab === "mf" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ backgroundColor: "#141D32", padding: "16px", borderRadius: "12px", border: "1px solid #232E48" }}>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>FUNDS REGISTERED</span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "18px" }}>{mutualFunds.length} Active</h3>
            </div>
            <div style={{ backgroundColor: "#141D32", padding: "16px", borderRadius: "12px", border: "1px solid #232E48" }}>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>TOTAL INVESTED</span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "18px" }}>₹{mfTotalInv.toLocaleString()}</h3>
            </div>
            <div style={{ backgroundColor: "#141D32", padding: "16px", borderRadius: "12px", border: "1px solid #232E48" }}>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>CURRENT VALUE</span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "18px", color: "#60A5FA" }}>₹{mfTotalCur.toLocaleString()}</h3>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setOpenMfModal(true)} style={{ padding: "8px 16px", backgroundColor: "#2563EB", border: "none", borderRadius: "8px", color: "#FFF", fontWeight: 700, cursor: "pointer" }}>+ Add Fund</button>
          </div>

          {openMfModal && (
            <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
              <div style={{ backgroundColor: "#141D32", width: "520px", padding: "24px", borderRadius: "20px", border: "1px solid #232E48", display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
                <button onClick={() => setOpenMfModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#64748B" }}>×</button>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Add Mutual Fund</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Fund Name *</label>
                    <input placeholder="e.g. HDFC Flexi Cap" value={fundName} onChange={e => setFundName(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Fund House *</label>
                    <input placeholder="e.g. HDFC AMC" value={fundHouse} onChange={e => setFundHouse(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Investment Type *</label>
                    <select value={invType} onChange={e => setInvType(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }}>
                      <option value="Lumpsum">Lumpsum</option><option value="SIP">SIP</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Category</label>
                    <input placeholder="Large Cap, ELSS..." value={mfCategory} onChange={e => setMfCategory(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Total Invested (₹) *</label>
                    <input type="number" value={mfInvested} onChange={e => setMfInvested(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Current Value (₹)</label>
                    <input type="number" placeholder="Defaults to Invested" value={mfCurrent} onChange={e => setMfCurrent(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Current NAV (₹) *</label>
                    <input type="text" value={mfNav} onChange={e => setMfNav(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", color: "#94A3B8" }}>Units *</label>
                    <input type="text" value={mfUnits} onChange={e => setMfUnits(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", color: "#94A3B8" }}>Start Date</label>
                  <select value={mfStartDate} onChange={e => setMfStartDate(e.target.value)} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155" }}>
                    <option value="2026-07-11">11/07/2026</option>
                    <option value="2026-08-01">01/08/2026</option>
                  </select>
                </div>
                
                <button onClick={handleCreateMf} style={{ padding: "12px", backgroundColor: "#2563EB", color: "#FFF", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", marginTop: "4px" }}>Add Mutual Fund</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mutualFunds.map((m, idx) => {
              const gain = (parseFloat(m.current) || 0) - (parseFloat(m.invested) || 0);
              const pct = m.invested > 0 ? ((gain / m.invested) * 100).toFixed(2) : "0.00";
              const isProfit = gain >= 0;

              return (
                <div key={m.id || idx} style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px", position: "relative" }}>
                  <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                    <button onClick={() => { setEditingMfId(m.id); setEditMfCurrent(m.current.toString()); }} style={{ background: "none", border: "none", color: "#60A5FA", cursor: "pointer" }}><Edit2 size={13} /></button>
                    <button onClick={() => { setActiveStatementId(m.id); setActiveStatementType("MF"); }} style={{ background: "none", border: "none", color: "#00CFE8", cursor: "pointer" }}><Receipt size={13} /></button>
                    <button onClick={() => handleDeleteMf(m.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={13} /></button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px dashed #334155", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {m.avatar ? <img src={m.avatar} alt="attach" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera size={14} color="#64748B" />}
                      <input type="file" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onloadend = () => handleMfPhoto(idx, r.result as string);
                          r.readAsDataURL(file);
                        }
                      }} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>{m.name}</h3>
                      <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                        <span style={{ fontSize: "9px", backgroundColor: "#0B1224", color: "#FFF", padding: "2px 6px", borderRadius: "4px" }}>{m.invType}</span>
                        <span style={{ fontSize: "9px", backgroundColor: "#0B1224", color: "#94A3B8", padding: "2px 6px", borderRadius: "4px" }}>{m.category}</span>
                      </div>
                    </div>
                  </div>

                  {editingMfId === m.id && (
                    <div style={{ display: "flex", gap: "6px", backgroundColor: "#0B1224", padding: "8px", borderRadius: "8px", marginTop: "10px" }}>
                      <input type="number" value={editMfCurrent} onChange={e => setEditMfCurrent(e.target.value)} style={{ padding: "4px", borderRadius: "4px", backgroundColor: "#141D32", color: "#FFF", border: "1px solid #334155", fontSize: "12px", width: "120px" }} />
                      <button onClick={() => saveInlineMfEdit(m.id)} style={{ padding: "4px 8px", backgroundColor: "#10B981", color: "#FFF", border: "none", borderRadius: "4px", fontSize: "11px" }}>Update</button>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", fontSize: "13px", borderTop: "1px dashed #232E48", paddingTop: "14px", marginTop: "14px" }}>
                    <div><span style={{ color: "#64748B" }}>Invested:</span><br /><strong>₹{(parseFloat(m.invested) || 0).toLocaleString()}</strong></div>
                    <div><span style={{ color: "#64748B" }}>Current Value:</span><br /><strong style={{ color: "#60A5FA" }}>₹{(parseFloat(m.current) || 0).toLocaleString()}</strong></div>
                    <div><span style={{ color: "#64748B" }}>Returns:</span><br /><span style={{ color: isProfit ? "#10B981" : "#EF4444", fontWeight: 700 }}>₹{gain.toLocaleString()} ({isProfit ? "+" : ""}{pct}%)</span></div>
                    <div><span style={{ color: "#64748B" }}>NAV / Units:</span><br /><span>₹{m.nav} • {m.units} units</span></div>
                  </div>
                </div>
              );
            })}
            {mutualFunds.length === 0 && (
              <div style={{ color: "#64748B", fontSize: "13px", padding: "20px", textAlign: "center" }}>No mutual fund configurations provisioned inside loop records.</div>
            )}
          </div>
        </div>
      )}

      {/* 📊 DYNAMIC STATEMENT LEDGER DRAW WINDOW INTERACTION ELEMENT */}
      {activeStatementAssetId && selectedStatementAsset && (
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", padding: "24px", borderRadius: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #232E48", paddingBottom: "12px", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>Asset Ledger Statements</h3>
              <small style={{ color: "#94A3B8" }}>Audit trail log history stream for: <strong>{selectedStatementAsset.name}</strong></small>
            </div>
            <button onClick={() => setActiveStatementId(null)} style={{ padding: "4px 12px", backgroundColor: "#232E48", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>Dismiss Grid</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(selectedStatementAsset.history || []).map((st: any, sIdx: number) => (
              <div key={sIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0B1224", padding: "12px 16px", borderRadius: "10px", border: "1px solid #232E48" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Calendar style={{ width: "14px", height: "14px", color: "#64748B" }} />
                  <div>
                    <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>{st.date}</span>
                    <strong style={{ fontSize: "13px", color: "#FFFFFF" }}>{st.desc}</strong>
                  </div>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#10B981" }}>
                  ₹{st.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}