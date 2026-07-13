import React, { useState, useEffect } from "react";
import { UserPlus, CreditCard, ShieldCheck } from "lucide-react";

export default function SuperAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSystemUsers = async () => {
      try {
        const response = await fetch("http://gazi-group-backend-1.onrender.com/api/users");
        if (!response.ok) throw new Error("Database nodes payload communication failure.");
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setErrorMessage("System Mismatch: Unable to connect to MongoDB system server registry.");
        setLoading(false);
      }
    };
    fetchSystemUsers();
  }, []);

  const changeUserTierNode = async (email: string, targetTier: string) => {
    try {
      const response = await fetch("http://gazi-group-backend-1.onrender.com/api/users/update-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier: targetTier })
      });
      if (response.ok) {
        // State mutation mapping updates locally instantly
        setUsers((prev: any) =>
          prev.map((u: any) => (u.email === email ? { ...u, tier: targetTier } : u))
        );
      }
    } catch (err) {
      console.error("Failed to commit live tier update:", err);
    }
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", backgroundColor: "#050816", fontFamily: "system-ui, sans-serif", color: "#FFFFFF", padding: "60px 40px", boxSizing: "border-box" }}>
      
      {/* HEADER SECTION NODE */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid #141D32", paddingBottom: "30px", marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ShieldCheck size={32} color="#00CFE8" />
          <h1 style={{ fontSize: "32px", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>SUPER ADMIN SYSTEM SUB-LEDGER</h1>
        </div>
        <p style={{ fontSize: "14px", color: "#64748B", margin: 0 }}>
          Manage global access control vectors, live profile sync parameters, and update account hierarchy privileges directly on MongoDB cluster nodes.
        </p>
      </div>

      {/* COMPONENT INTERACTION STATES LAYERS */}
      {errorMessage && (
        <div style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", padding: "16px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, marginBottom: "20px", maxWidth: "600px" }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {loading ? (
        <div style={{ color: "#00CFE8", fontSize: "14px", fontWeight: 700, letterSpacing: "1px" }}>
          🔄 COMPILING REALTIME SYSTEM DATABASE NODES REGISTRY...
        </div>
      ) : (
        <div style={{ width: "100%", backgroundColor: "#090F1C", border: "1px solid #141D32", borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#111A2E", borderBottom: "1px solid #141D32", color: "#94A3B8" }}>
                <th style={{ padding: "18px 24px", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>Account Holder Matrix</th>
                <th style={{ padding: "18px 24px", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>Secure Network Email</th>
                <th style={{ padding: "18px 24px", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>System Level Tier Status</th>
                <th style={{ padding: "18px 24px", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "center" }}>Access Overrides Switch</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#475569", fontWeight: 600 }}>
                    No system records available inside the MongoDB Cluster instance collection.
                  </td>
                </tr>
              ) : (
                users.map((user: any, index: number) => (
                  <tr key={index} style={{ borderBottom: "1px solid #141D32", backgroundColor: index % 2 === 0 ? "transparent" : "#0c1424" }}>
                    <td style={{ padding: "18px 24px", fontWeight: 700, color: "#FFFFFF" }}>{user.name}</td>
                    <td style={{ padding: "18px 24px", color: "#CBD5E1" }}>{user.email}</td>
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{ backgroundColor: user.tier === "Super Admin" ? "rgba(115,103,240,0.12)" : user.tier === "Admin" ? "rgba(37,99,235,0.12)" : "rgba(16,185,129,0.12)", color: user.tier === "Super Admin" ? "#7367F0" : user.tier === "Admin" ? "#2563EB" : "#10B981", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>
                        {user.tier || "Free"}
                      </span>
                    </td>
                    <td style={{ padding: "18px 24px", textAlign: "center" }}>
                      <select 
                        value={user.tier || "Free"} 
                        onChange={(e) => changeUserTierNode(user.email, e.target.value)}
                        style={{ backgroundColor: "#050816", color: "#FFFFFF", border: "1px solid #232E48", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: 600, outline: "none", cursor: "pointer" }}
                      >
                        <option value="Free">Set Tier: Free</option>
                        <option value="VIP">Set Tier: VIP</option>
                        <option value="Admin">Set Tier: Admin</option>
                        <option value="Super Admin">Set Tier: Super Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
