import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, FolderPlus, X, PieChart, Sparkles, LayoutGrid } from "lucide-react";

export default function BudgetsPage({ onSync }: { onSync: () => void }) {
  const userEmail = localStorage.getItem("userEmail") || "Guest User";
  const [budgets, setBudgets] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  
  // States for form and inline edits
  const [selectedCategory, setSelectedCategory] = useState("FOOD");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [showCardsView, setShowCardsView] = useState(true);
  
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState("");

  useEffect(() => {
    const data = localStorage.getItem(`budgetsList_${userEmail}`);
    let loadedBudgets = data ? JSON.parse(data) : [];

    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const lastResetMonth = localStorage.getItem(`budgetLastReset_${userEmail}`);

    if (loadedBudgets.length > 0 && lastResetMonth && lastResetMonth !== currentMonthKey) {
      loadedBudgets = loadedBudgets.map((b: any) => ({ ...b, spent: 0 }));
      localStorage.setItem(`budgetsList_${userEmail}`, JSON.stringify(loadedBudgets));
      localStorage.setItem(`budgetLastReset_${userEmail}`, currentMonthKey);
    } else if (!lastResetMonth) {
      localStorage.setItem(`budgetLastReset_${userEmail}`, currentMonthKey);
    }

    if (loadedBudgets.length === 0 && !data) {
      loadedBudgets = [
        { category: "FOOD", amount: 4760, spent: 0, tag: "Food & Dining" },
        { category: "DALY EXPANSE", amount: 1500, spent: 0, tag: "Personal Care" },
        { category: "LOAN", amount: 15000, spent: 0, tag: "EMI" },
        { category: "HOME TRANSFORE", amount: 10000, spent: 0, tag: "Shopping" },
        { category: "FEUL", amount: 9000, spent: 0, tag: "Fuel" },
        { category: "RENT", amount: 5700, spent: 0, tag: "Rent" },
        { category: "INVESTMENT", amount: 3000, spent: 0, tag: "Other" }
      ];
      localStorage.setItem(`budgetsList_${userEmail}`, JSON.stringify(loadedBudgets));
    }
    
    setBudgets(loadedBudgets);
  }, [userEmail]);

  const handleCreateBudget = () => {
    if (!amount) return;
    const finalCategory = selectedCategory === "CUSTOM" ? customCategory.toUpperCase() : selectedCategory;
    if (!finalCategory) return;

    const current = [...budgets];
    current.push({
      id: Date.now().toString(),
      category: finalCategory,
      amount: parseFloat(amount || "0"),
      spent: 0,
      tag: selectedCategory === "CUSTOM" ? "Custom Allocation" : "Monthly Allowance"
    });
    localStorage.setItem(`budgetsList_${userEmail}`, JSON.stringify(current));
    setBudgets(current);
    setAmount(""); setCustomCategory("");
    setOpenAdd(false);
    onSync();
  };

  const handleDelete = (idx: number) => {
    const current = [...budgets];
    current.splice(idx, 1);
    localStorage.setItem(`budgetsList_${userEmail}`, JSON.stringify(current));
    setBudgets(current);
    onSync();
  };

  const startInlineEdit = (idx: number, currentAmount: number) => {
    setEditingIdx(idx);
    setEditAmount(currentAmount.toString());
  };

  const saveInlineEdit = (idx: number) => {
    const current = [...budgets];
    current[idx].amount = parseFloat(editAmount || "0");
    localStorage.setItem(`budgetsList_${userEmail}`, JSON.stringify(current));
    setBudgets(current);
    setEditingIdx(null);
    onSync();
  };

  const totalBudget = budgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (parseFloat(b.spent) || 0), 0);
  const remaining = totalBudget - totalSpent;
  const overallUsedPct = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
  const alertCount = budgets.filter(b => (b.spent / b.amount) >= 0.85).length;

  const designPalette = ["#FF9F43", "#00CFE8", "#28C76F", "#7367F0", "#EA5455", "#E83E8C", "#60A5FA"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%", fontFamily: "system-ui, -apple-system, sans-serif", textAlign: "left", position: "relative", backgroundColor: "#0B1224", padding: "24px", borderRadius: "20px", boxSizing: "border-box", minHeight: "100%" }}>
      
      {/* 🌟 PREMIUM FLOATING MODAL OVERLAY */}
      {openAdd && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
          <div style={{ backgroundColor: "#141D32", width: "480px", padding: "36px", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: "24px", border: "1px solid #1E293B", position: "relative" }}>
            
            <button onClick={() => setOpenAdd(false)} style={{ position: "absolute", top: "28px", right: "28px", background: "#1E293B", border: "none", color: "#94A3B8", cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X style={{ width: "16px", height: "16px" }} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #1E293B", paddingBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6" }}>
                <FolderPlus style={{ width: "20px", height: "20px" }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.3px" }}>Add Budget Capsule</h3>
                <small style={{ color: "#64748B", fontSize: "12px" }}>Allocate maximum dynamic capital ceiling logs.</small>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.5px" }}>TARGET FIELD TYPE</label>
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)} 
                style={{ padding: "14px", border: "1px solid #334155", borderRadius: "12px", fontSize: "14px", color: "#FFFFFF", fontWeight: 700, backgroundColor: "#0B1224", width: "100%", outline: "none", cursor: "pointer" }}
              >
                <option value="FOOD">🍔 FOOD & DINING</option>
                <option value="DALY EXPANSE">💼 DAILY EXPENSES</option>
                <option value="LOAN">🏛️ LOAN EMI DECK</option>
                <option value="HOME TRANSFORE">🛒 HOME SHOPPING</option>
                <option value="FEUL">⛽ FUEL TRAVEL</option>
                <option value="RENT">🏠 HOUSE RENT METRIC</option>
                <option value="INVESTMENT">📈 ASSET INVESTMENT POOL</option>
                <option value="CUSTOM">✨ REGISTER CUSTOM SEGMENT...</option>
              </select>
            </div>

            {selectedCategory === "CUSTOM" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.5px" }}>CUSTOM ENTRY IDENTIFIER</label>
                <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="e.g., GAMING SUBSCRIPTIONS" style={{ padding: "14px", border: "1px solid #334155", borderRadius: "12px", fontSize: "14px", color: "#FFFFFF", fontWeight: 700, width: "100%", boxSizing: "border-box", outline: "none", backgroundColor: "#0B1224" }} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.5px" }}>MONTHLY THRESHOLD LIMIT CAP (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter numeric valuation amount" style={{ padding: "14px", border: "1px solid #334155", borderRadius: "12px", fontSize: "14px", color: "#FFFFFF", fontWeight: 700, width: "100%", boxSizing: "border-box", outline: "none", backgroundColor: "#0B1224" }} />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button onClick={handleCreateBudget} style={{ flex: 1, padding: "16px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "14px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 66px 20px rgba(37,99,235,0.3)" }}>Deploy Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 TOP HERO BANNER ROW */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", margin: 0, letterSpacing: "-0.8px" }}>Budgets</h1>
          <p style={{ color: "#94A3B8", fontSize: "13px", margin: "4px 0 0 0", fontWeight: 500 }}>July 2026 • 30 Days Isolated Dark Cycle Grid</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", backgroundColor: "#141D32", padding: "4px", borderRadius: "12px", border: "1px solid #232E48" }}>
            <button onClick={() => setShowCardsView(true)} style={{ padding: "8px 16px", border: "none", borderRadius: "9px", backgroundColor: showCardsView ? "#2563EB" : "transparent", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <LayoutGrid style={{ width: "14px", height: "14px" }} /> Cards
            </button>
            <button onClick={() => setShowCardsView(false)} style={{ padding: "8px 16px", border: "none", borderRadius: "9px", backgroundColor: !showCardsView ? "#2563EB" : "transparent", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <PieChart style={{ width: "14px", height: "14px" }} /> Analytics
            </button>
          </div>
          <button onClick={() => setOpenAdd(true)} style={{ padding: "12px 24px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 14px rgba(37,99,235,0.4)" }}>
            <Plus style={{ width: "16px", height: "16px" }} /> Add Budget
          </button>
        </div>
      </div>

      {/* 💳 METRIC CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        {[
          { title: "Total Budget Limit", val: totalBudget, color: "#3B82F6" },
          { title: "Total Spent Real-time", val: totalSpent, color: "#EF4444" },
          { title: "Remaining Safe Margin", val: remaining, color: "#10B981" },
          { title: "Active Volatility Alerts", val: alertCount, color: alertCount > 0 ? "#EF4444" : "#F59E0B", isAlert: true }
        ].map((c, idx) => (
          <div key={idx} style={{ background: "#141D32", border: "1px solid #232E48", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
            <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.title}</span>
            <span style={{ fontSize: "26px", fontWeight: 800, color: c.color, letterSpacing: "-0.5px" }}>
              {c.isAlert && c.val === 0 ? "0 System Alerts" : `₹${c.val.toLocaleString('en-IN')}`}
            </span>
          </div>
        ))}
      </div>

      {/* 🟢 OVERALL EFFICIENCY TRACK BAR */}
      <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles style={{ width: "16px", height: "16px", color: "#10B981" }} />
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>Overall Monthly Efficiency Health</span>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 800, color: "#10B981", backgroundColor: "rgba(16,185,129,0.15)", padding: "4px 12px", borderRadius: "20px" }}>{overallUsedPct}% used</span>
        </div>
        <div style={{ width: "100%", height: "12px", backgroundColor: "#0B1224", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ width: `${overallUsedPct}%`, height: "100%", background: "linear-gradient(90deg, #3B82F6, #10B981)", borderRadius: "6px" }} />
        </div>
      </div>

      {/* 🔄 CARDS VIEW */}
      {showCardsView ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
          {budgets.map((b, i) => {
            const cap = parseFloat(b.amount) || 0;
            const consumed = parseFloat(b.spent) || 0;
            const left = Math.max(0, cap - consumed);
            const ratio = cap > 0 ? Math.min(Math.round((consumed / cap) * 100), 100) : 0;
            const accentColor = designPalette[i % designPalette.length];
            const isCritical = ratio >= 85;

            return (
              <div key={i} style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "16px", overflow: "hidden", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
                <div style={{ width: "100%", height: "4px", backgroundColor: accentColor }} />
                
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  
                  <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
                    <button onClick={() => startInlineEdit(i, cap)} style={{ background: "none", border: "none", color: "#60A5FA", cursor: "pointer", padding: "2px" }} title="Edit Limit">
                      <Edit2 style={{ width: "15px", height: "15px" }} />
                    </button>
                    <button onClick={() => handleDelete(i)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "2px" }} title="Delete Block">
                      <Trash2 style={{ width: "15px", height: "15px" }} />
                    </button>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", margin: 0, textTransform: "uppercase", letterSpacing: "0.3px" }}>{b.category}</h3>
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                      <span style={{ fontSize: "10px", backgroundColor: "#0B1224", color: "#94A3B8", padding: "3px 8px", borderRadius: "6px", border: "1px solid #232E48" }}>{b.tag || "Personal Care"}</span>
                      <span style={{ fontSize: "10px", backgroundColor: "#0B1224", color: "#94A3B8", padding: "3px 8px", borderRadius: "6px", border: "1px solid #232E48" }}>Monthly</span>
                      <span style={{ fontSize: "10px", backgroundColor: isCritical ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: isCritical ? "#EF4444" : "#10B981", padding: "3px 8px", borderRadius: "6px", fontWeight: 800 }}>
                        {isCritical ? "Overlimit" : "On Track"}
                      </span>
                    </div>
                  </div>

                  <div style={{ width: "100%", height: "10px", backgroundColor: "#0B1224", borderRadius: "5px", overflow: "hidden", marginTop: "6px", position: "relative" }}>
                    <div style={{ width: `${ratio}%`, height: "100%", backgroundColor: accentColor, borderRadius: "5px" }} />
                    <div style={{ position: "absolute", left: "68%", top: 0, bottom: 0, width: "2px", backgroundColor: "rgba(255,255,255,0.3)" }} />
                  </div>

                  {editingIdx === i ? (
                    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} style={{ padding: "6px", border: "1px solid #334155", borderRadius: "6px", backgroundColor: "#0B1224", color: "#FFFFFF", fontSize: "12px", width: "100px" }} />
                      <button onClick={() => saveInlineEdit(i)} style={{ padding: "4px 8px", backgroundColor: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>Save</button>
                      <button onClick={() => setEditingIdx(null)} style={{ padding: "4px 8px", backgroundColor: "#64748B", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "11px" }}>X</button>
                    </div>
                  ) : null}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px dashed #232E48", paddingTop: "12px", fontSize: "13px" }}>
                    <div>
                      <span style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "15px" }}>₹{consumed.toLocaleString()} spent</span>
                      <small style={{ display: "block", color: "#94A3B8", fontSize: "12px", marginTop: "4px", fontWeight: 600 }}>₹{left.toLocaleString()} left</small>
                    </div>
                    <span style={{ color: "#94A3B8", fontSize: "11px", fontWeight: 700 }}>{ratio}% of ₹{cap.toLocaleString()}</span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ANALYTICS VIEW OVERHAUL */
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", padding: "32px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#FFFFFF" }}>Consumption Analytics Metric Node</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94A3B8" }}>Real-time usage comparisons matching dark matrix parameters.</p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {budgets.map((b, i) => {
              const cap = parseFloat(b.amount) || 0;
              const consumed = parseFloat(b.spent) || 0;
              const ratio = cap > 0 ? Math.min(Math.round((consumed / cap) * 100), 100) : 0;
              
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700 }}>
                    <span style={{ color: "#CBD5E1" }}>{b.category}</span>
                    <span style={{ color: "#94A3B8" }}>₹{consumed.toLocaleString()} / ₹{cap.toLocaleString()} ({ratio}%)</span>
                  </div>
                  <div style={{ width: "100%", height: "16px", backgroundColor: "#0B1224", borderRadius: "6px", overflow: "hidden", border: "1px solid #232E48" }}>
                    <div style={{ width: `${ratio || 4}%`, height: "100%", background: `linear-gradient(90deg, ${designPalette[i % designPalette.length]}, #3B82F6)`, borderRadius: "6px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}