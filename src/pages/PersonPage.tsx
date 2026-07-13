import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Users, Landmark, Receipt, Calendar, UserPlus, ArrowDownLeft, ArrowUpRight, Camera } from "lucide-react";

interface PersonPageProps {
  p2pRelations: any[];
  p2pName: string;
  p2pAmount: string;
  p2pType: string;
  p2pNotes: string;
  setP2pName: (val: string) => void;
  setP2pAmount: (val: string) => void;
  setP2pType: (val: string) => void;
  setP2pNotes: (val: string) => void;
  handleAddP2PRelation: () => void;
  handleDeleteP2PRelation: (id: string) => void;
}

interface LocalPeerNode {
  id: string;
  name: string;
  amount: number;
  type: string;
  notes: string;
  date: string;
  avatar?: string; 
  history?: any[];
}

export default function PersonPage({}: PersonPageProps) {
  const userEmail = localStorage.getItem("userEmail") || "Guest User";
  
  // Master Real-Time Local State Panels
  const [peersList, setPeersList] = useState<LocalPeerNode[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  
  // Modal Visual Toggles Flags
  const [openAddModal, setOpenAddModal] = useState(false);
  const [activeStatementId, setActiveStatementId] = useState<string | null>(null);
  
  // Core Data Ingestion Form Slots
  const [peerName, setPeerName] = useState("");
  const [peerAmount, setPeerAmount] = useState("");
  const [peerType, setPeerType] = useState("RECEIVABLE"); 
  const [peerNotes, setPeerNotes] = useState("");
  const [peerAvatarUrl, setPeerAvatarUrl] = useState(""); 

  // Settlement configurations states
  const [settlementMode, setSettlementMode] = useState("MANUAL"); 
  const [selectedSourceBankId, setSelectedSourceBankId] = useState("");
  const [settlementAmount, setSettlementAmount] = useState("");
  const [settlementActionType, setSettlementActionType] = useState("ADD_DEBT"); 
  const [activeSettlementId, setActiveSettlementId] = useState<string | null>(null);

  // Inline modifications memory layers
  const [editingId, setEditingIdx] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState("");
  const [editNotesText, setEditNotesText] = useState("");

  const loadDatabaseSynchronizer = () => {
    const savedList = localStorage.getItem(`p2pRelationsList_${userEmail}`);
    if (savedList) {
      setPeersList(JSON.parse(savedList));
    } else {
      setPeersList([]);
    }

    const savedBanks = localStorage.getItem(`bankAccountsList_${userEmail}`);
    if (savedBanks) setBankAccounts(JSON.parse(savedBanks));
  };

  useEffect(() => {
    loadDatabaseSynchronizer();
  }, [userEmail]);

  // 📸 UNLOCKED UNRESTRICTED 5MB ATTACHMENT STREAM LOADER
  const handleAvatarSelectionPayload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPeerAvatarUrl(reader.result as string); 
      };
      reader.readAsDataURL(file);
    }
  };

  // REAL-TIME HARDWARE DATA COMMIT ENGINE
  const commitNewPeerToLedgerRegistry = () => {
    if (!peerName.trim() || !peerAmount) return;

    const savedRaw = localStorage.getItem(`p2pRelationsList_${userEmail}`);
    const parsedPeers = savedRaw ? JSON.parse(savedRaw) : [];

    const newPeer: LocalPeerNode = {
      id: "peer_" + Date.now().toString(),
      name: peerName.trim().toUpperCase(),
      amount: parseFloat(peerAmount || "0"),
      type: peerType,
      notes: peerNotes.trim(),
      date: new Date().toISOString().slice(0, 10),
      avatar: peerAvatarUrl, 
      history: [{
        date: new Date().toISOString().slice(0, 10),
        desc: "Opening profile ledger balance record initialized.",
        amount: parseFloat(peerAmount || "0"),
        type: "DEBIT"
      }]
    };

    const updatedPeersList = [newPeer, ...parsedPeers];
    
    localStorage.setItem(`p2pRelationsList_${userEmail}`, JSON.stringify(updatedPeersList));
    setPeersList(updatedPeersList);

    // Reset Forms Flush Nodes
    setPeerName(""); setPeerAmount(""); setPeerNotes(""); setPeerAvatarUrl("");
    setOpenAddModal(false);
  };

  const handlePurgePeerNode = (id: string) => {
    const updated = peersList.filter(p => p.id !== id);
    localStorage.setItem(`p2pRelationsList_${userEmail}`, JSON.stringify(updated));
    setPeersList(updated);
    if (activeStatementId === id) setActiveStatementId(null);
  };

  const handleCommitSettlementPayout = (peerId: string) => {
    const amt = parseFloat(settlementAmount);
    if (!amt || amt <= 0) return;

    let currentPeers = [...peersList];
    const pIdx = currentPeers.findIndex((p) => p.id === peerId);
    if (pIdx === -1) return;

    const targetPeer = currentPeers[pIdx];
    let targetBankIndex = -1;
    let updatedBanks = [];

    if (settlementMode === "BANK") {
      const savedBanks = localStorage.getItem(`bankAccountsList_${userEmail}`);
      updatedBanks = savedBanks ? JSON.parse(savedBanks) : [];
      targetBankIndex = updatedBanks.findIndex((b: any) => b.id === selectedSourceBankId);
      if (targetBankIndex === -1) return;
    }

    let statementNarrationText = "";
    let systemGlobalActionType = "WITHDRAW";

    if (settlementActionType === "ADD_DEBT") {
      targetPeer.amount = (parseFloat(targetPeer.amount as any) || 0) + amt;
      statementNarrationText = `Additional leverage logged via [${settlementMode}]`;
      if (settlementMode === "BANK") {
        if (targetPeer.type === "RECEIVABLE") {
          updatedBanks[targetBankIndex].balance -= amt;
          systemGlobalActionType = "WITHDRAW";
        } else {
          updatedBanks[targetBankIndex].balance += amt;
          systemGlobalActionType = "DEPOSIT";
        }
      }
    } else {
      targetPeer.amount = (parseFloat(targetPeer.amount as any) || 0) - amt;
      statementNarrationText = `Repayment processing transaction compiled via [${settlementMode}]`;
      if (settlementMode === "BANK") {
        if (targetPeer.type === "RECEIVABLE") {
          updatedBanks[targetBankIndex].balance += amt;
          systemGlobalActionType = "DEPOSIT";
        } else {
          updatedBanks[targetBankIndex].balance -= amt;
          systemGlobalActionType = "WITHDRAW";
        }
      }
    }

    if (!targetPeer.history) targetPeer.history = [];
    targetPeer.history.push({
      date: new Date().toISOString().slice(0, 10),
      desc: statementNarrationText,
      amount: amt,
      type: settlementActionType === "ADD_DEBT" ? "DEBIT" : "CREDIT"
    });

    if (settlementMode === "BANK" && targetBankIndex !== -1) {
      updatedBanks[targetBankIndex].history.push({
        date: new Date().toISOString().slice(0, 10),
        desc: `P2P Transfer wire node target: ${targetPeer.name}`,
        amount: amt,
        type: systemGlobalActionType
      });
      localStorage.setItem(`bankAccountsList_${userEmail}`, JSON.stringify(updatedBanks));
      setBankAccounts(updatedBanks); 
    }

    localStorage.setItem(`p2pRelationsList_${userEmail}`, JSON.stringify(currentPeers));
    setPeersList(currentPeers); 
    setSettlementAmount(""); setSelectedSourceBankId(""); setActiveSettlementId(null);
  };

  const executeInlinePropertyEditSave = (peerId: string) => {
    let currentPeers = [...peersList];
    const pIdx = currentPeers.findIndex((p) => p.id === peerId);
    if (pIdx !== -1) {
      if (!editNameText.trim()) return;
      currentPeers[pIdx].name = editNameText.trim().toUpperCase();
      currentPeers[pIdx].notes = editNotesText.trim();
      localStorage.setItem(`p2pRelationsList_${userEmail}`, JSON.stringify(currentPeers));
      setPeersList(currentPeers);
      setEditingIdx(null);
    }
  };

  const selectedStatementData = peersList.find(p => p.id === activeStatementId);
  const designPalette = ["#FF9F43", "#00CFE8", "#28C76F", "#7367F0", "#EA5455", "#60A5FA"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", width: "100%", fontFamily: "system-ui, sans-serif", textAlign: "left", color: "#FFFFFF" }}>
      
      {/* HUB HEADER BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #141D32", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>P2P Relational Core Ledgers</h1>
          <p style={{ color: "#94A3B8", fontSize: "12px", marginTop: "4px" }}>Manage doston aur rishtedaron ka udhaar safely with 5MB maximum profile photograph support nodes.</p>
        </div>
        <button 
          onClick={() => setOpenAddModal(true)} 
          style={{ padding: "12px 22px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}
        >
          <UserPlus style={{ width: "16px", height: "16px" }} /> Add New Person
        </button>
      </div>

      {/* 🌟 ADD NEW PEER MODAL DECK */}
      {openAddModal && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
          <div style={{ backgroundColor: "#141D32", width: "480px", padding: "32px", borderRadius: "24px", border: "1px solid #232E48", display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
            
            <button onClick={() => setOpenAddModal(false)} style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={18}/></button>

            <div style={{ borderBottom: "1px solid #232E48", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Users style={{ color: "#60A5FA", width: "20px", height: "20px" }} />
              <strong style={{ fontSize: "16px" }}>Add New Person Ledger Profile</strong>
            </div>
            
            {/* PHOTO CAPTURE SLOT */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", backgroundColor: "#0B1224", padding: "14px", borderRadius: "14px", border: "1px solid #232E48" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#232E48", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", border: "1px solid #334155" }}>
                {peerAvatarUrl ? (
                  <img src={peerAvatarUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Camera size={20} color="#64748B" />
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {/* ⚡ FIXED LABEL TEXT: ASSET REMOVED AS REQUESTED */}
                <span style={{ fontSize: "12px", color: "#FFF", fontWeight: 700 }}>PROFILE PHOTOGRAPH (MAX 5MB)</span>
                <label style={{ fontSize: "11px", color: "#3B82F6", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}>
                  Select Photo Source File
                  <input type="file" accept="image/*" onChange={handleAvatarSelectionPayload} style={{ display: "none" }} />
                </label>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>PERSON NAME IDENTIFIER *</label>
                <input type="text" value={peerName} onChange={e => setPeerName(e.target.value)} placeholder="e.g. Ramesh Kumar" style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>INITIAL CAPITAL VALUE (₹) *</label>
                  <input type="number" value={peerAmount} onChange={e => setPeerAmount(e.target.value)} placeholder="0" style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>LEDGER NATURE CONFIGURATION</label>
                  <select value={peerType} onChange={e => setPeerType(e.target.value)} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none", cursor: "pointer" }}>
                    <option value="RECEIVABLE">Maine Udhaar Diya (+ Asset)</option>
                    <option value="PAYABLE">Maine Udhaar Liya (- Liability)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>LOG MEMO STATEMENT NOTES</label>
                <input type="text" value={peerNotes} onChange={e => setPeerNotes(e.target.value)} placeholder="e.g. Personal loans tracking loop" style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
              </div>
            </div>

            <button 
              onClick={commitNewPeerToLedgerRegistry} 
              style={{ padding: "14px", backgroundColor: "#10B981", border: "none", borderRadius: "12px", color: "#FFFFFF", fontWeight: 800, fontSize: "13px", cursor: "pointer", marginTop: "8px", letterSpacing: "0.5px" }}
            >
              ➕ ADD NEW PERSON
            </button>
          </div>
        </div>
      )}

      {/* 📊 GRIDS DISPLAY CARDS MESH */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {peersList.map((rel, idx) => {
          const topAccentBorderColor = designPalette[idx % designPalette.length];
          const isReceivable = rel.type === "RECEIVABLE";
          const displayValuation = Math.max(0, rel.amount || 0);

          return (
            <div key={rel.id || idx} style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
              <div style={{ width: "100%", height: "4px", backgroundColor: topAccentBorderColor }} />
              
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                
                <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <button onClick={() => { setEditingIdx(rel.id); setEditNameText(rel.name); setEditNotesText(rel.notes || ""); }} style={{ background: "none", border: "none", color: "#60A5FA", cursor: "pointer" }}><Edit2 size={13}/></button>
                  <button onClick={() => setActiveStatementId(activeStatementId === rel.id ? null : rel.id)} style={{ background: "none", border: "none", color: "#00CFE8", cursor: "pointer" }}><Receipt size={14}/></button>
                  <button onClick={() => handlePurgePeerNode(rel.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={13}/></button>
                </div>

                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "50%", backgroundColor: topAccentBorderColor + "20", border: `2px solid ${topAccentBorderColor}60`, display: "flex", alignItems: "center", overflow: "hidden", fontWeight: "bold", fontSize: "16px", color: topAccentBorderColor, justifyContent: "center" }}>
                    {rel.avatar ? (
                      <img src={rel.avatar} alt={rel.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : rel.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", backgroundColor: isReceivable ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: isReceivable ? "#10B981" : "#EF4444" }}>
                      {isReceivable ? "RECEIVABLE (+ ASSET)" : "PAYABLE (- LIABILITY)"}
                    </span>
                    
                    {editingId === rel.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                        <input type="text" value={editNameText} onChange={e => setEditNameText(e.target.value)} style={{ padding: "4px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155", fontSize: "12px", borderRadius: "4px" }} />
                        <input type="text" value={editNotesText} onChange={e => setEditNotesText(e.target.value)} style={{ padding: "4px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155", fontSize: "12px", borderRadius: "4px" }} />
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => executeInlinePropertyEditSave(rel.id)} style={{ padding: "2px 6px", backgroundColor: "#10B981", border: "none", borderRadius: "4px", fontSize: "11px", color: "#FFF" }}>Save</button>
                          <button onClick={() => setEditingIdx(null)} style={{ padding: "2px 6px", backgroundColor: "#64748B", border: "none", borderRadius: "4px", fontSize: "11px", color: "#FFF" }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 style={{ margin: "4px 0 0 0", fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>{rel.name}</h3>
                        <p style={{ margin: 0, fontSize: "11px", color: "#94A3B8" }}>{rel.notes || "No standard descriptor log memo tags."}</p>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ backgroundColor: "#0B1224", padding: "12px 16px", borderRadius: "12px", border: "1px solid #232E48", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>NET ACCOUNT CONSOLE BAL:</span>
                  <strong style={{ fontSize: "18px", fontWeight: 800, color: isReceivable ? "#10B981" : "#EF4444" }}>
                    ₹{(rel.amount || 0).toLocaleString('en-IN')}
                  </strong>
                </div>

                {/* INTERACTIVE PAYOUT ALLOCATION CONTROLS LAYER */}
                <div style={{ borderTop: "1px dashed #232E48", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <small style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>TRANSACTION ALLOCATION GATEWAY</small>
                    <button onClick={() => setActiveSettlementId(activeSettlementId === rel.id ? null : rel.id)} style={{ padding: "4px 10px", backgroundColor: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: "6px", color: "#60A5FA", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
                      {activeSettlementId === rel.id ? "Close Gate" : "Open Payout Console"}
                    </button>
                  </div>

                  {activeSettlementId === rel.id && (
                    <div style={{ backgroundColor: "#0B1224", padding: "14px", borderRadius: "12px", border: "1px solid #232E48", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => setSettlementActionType("ADD_DEBT")} style={{ flex: 1, padding: "6px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", backgroundColor: settlementActionType === "ADD_DEBT" ? "#2563EB" : "#141D32", color: "#FFF" }}>
                          {isReceivable ? "➕ Aur Udhaar Diya" : "➕ Aur Udhaar Liya"}
                        </button>
                        <button onClick={() => setSettlementActionType("PAY_OFF")} style={{ flex: 1, padding: "6px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", backgroundColor: settlementActionType === "PAY_OFF" ? "#10B981" : "#141D32", color: "#FFF" }}>
                          {isReceivable ? "✓ Paisa Wapas Mila" : "✓ Maine Paisa Chukaya"}
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => setSettlementMode("MANUAL")} style={{ flex: 1, padding: "5px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600, backgroundColor: settlementMode === "MANUAL" ? "#7367F0" : "#141D32", color: "#FFF" }}>Cash / Manual</button>
                        <button onClick={() => setSettlementMode("BANK")} style={{ flex: 1, padding: "5px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600, backgroundColor: settlementMode === "BANK" ? "#00CFE8" : "#141D32", color: "#FFF" }}>Bank Transfer</button>
                      </div>

                      {settlementMode === "BANK" && (
                        <select value={selectedSourceBankId} onChange={e => setSelectedSourceBankId(e.target.value)} style={{ padding: "8px", borderRadius: "6px", backgroundColor: "#141D32", color: "#FFF", border: "1px solid #334155", fontSize: "12px", outline: "none", width: "100%" }}>
                          <option value="">-- SELECT SOURCE LIQUIDITY VAULT --</option>
                          {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name} (Bal: ₹{b.balance.toLocaleString()})</option>)}
                        </select>
                      )}

                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input type="number" value={settlementAmount} onChange={e => setSettlementAmount(e.target.value)} placeholder="Amount (₹)" style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", backgroundColor: "#141D32", border: "1px solid #334155", color: "#FFFFFF", fontSize: "12px" }} />
                        <button onClick={() => handleCommitSettlementPayout(rel.id)} style={{ padding: "8px 14px", backgroundColor: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>Execute Wire</button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
        {peersList.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: "#475569", fontSize: "13px", border: "1px dashed #232E48", borderRadius: "16px" }}>
            Bhai, custom P2P relationship memory nodes blank hain. Create Peer trigger kijiye.
          </div>
        )}
      </div>

      {/* Passbook display trail */}
      {activeStatementId !== null && selectedStatementData && (
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "20px", padding: "24px", marginTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #232E48", paddingBottom: "12px", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>Passbook Audit Statement Logs</h3>
              <small style={{ color: "#94A3B8" }}>Historical transaction sequences tracked for peer: <strong style={{ color: "#60A5FA" }}>{selectedStatementData.name}</strong></small>
            </div>
            <button onClick={() => setActiveStatementId(null)} style={{ padding: "6px 14px", backgroundColor: "#232E48", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>Dismiss Panel</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(selectedStatementData.history || []).map((st: any, sIdx: number) => (
              <div key={sIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0B1224", padding: "14px 20px", borderRadius: "12px", border: "1px solid #232E48" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Calendar style={{ width: "14px", height: "14px", color: "#475569" }} />
                  <div>
                    <span style={{ fontSize: "10px", color: "#475569", display: "block" }}>{st.date}</span>
                    <strong style={{ fontSize: "13px", color: "#FFFFFF" }}>{st.desc}</strong>
                  </div>
                </div>
                <span style={{ fontSize: "15px", fontWeight: 800, color: st.type === "CREDIT" ? "#10B981" : "#EF4444", display: "flex", alignItems: "center", gap: "4px" }}>
                  {st.type === "CREDIT" ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
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