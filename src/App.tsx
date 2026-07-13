import React, { useState, useEffect } from "react";
import DashboardPage from "./pages/DashboardPage";
import BankAccountsPage from "./pages/BankAccountsPage";
import TransactionsPage from "./pages/TransactionsPage"; 
import InvestmentsPage from "./pages/InvestmentsPage";
import LoansPage from "./pages/LoansPage";
import SavingsGoalsPage from "./pages/SavingsGoalsPage"; 
import BudgetsPage from "./pages/BudgetsPage";
import AuthPage from "./pages/AuthPage";

import ProfilePage from "./pages/ProfilePage";
import FilesPage from "./pages/FilesPage";
import PersonPage from "./pages/PersonPage";
import SuperAdminPage from "./pages/SuperAdminPage";

import { LayoutDashboard, Building2, ArrowLeftRight, TrendingUp, ShieldAlert, PieChart, User, LogOut, FolderHeart, Files, Users, X, QrCode, Mail } from "lucide-react";

type ActivePage = "dashboard" | "cards" | "transactions" | "investments" | "loans" | "budgets" | "savings-goals" | "profile" | "files" | "superadmin" | "person";

// ⚡ BACKEND BACKBONE BASE URL - HOSTED LOCAL TO YOUR MACHINE FOR PHONE AND COMPUTER INTER-WIRE settle
const BACKEND_SERVER_API = "https://gazi-group-backend-1.onrender.com/api";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [userEmail, setUserEmail] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [userTier, setUserTier] = useState("Free"); 
  const [allUsersList, setAllUsersList] = useState<any[]>([]);

  // PREMIUM PLANS PAYMENT SYSTEM STATE ARCHITECTURE OVERLAYS
  const [openSubscriptionGate, setOpenSubscriptionGate] = useState(false);
  const [chosenPlanCost, setChosenPlanCost] = useState<string | null>(null);

  // QR Code Image Load Fallback Flag State
  const [qrImageError, setQrImageError] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      
      let determinedTier = "Free";
      const savedTier = localStorage.getItem(`userTier_${email}`);
      
      if (email.toLowerCase() === "saifulgazi646@gmail.com" || email.toLowerCase() === "saifulgazi646@gmail.com") {
        determinedTier = "Super Admin";
      } else if (savedTier) {
        determinedTier = savedTier;
      } else if (email === "admin") {
        determinedTier = "Admin";
      }

      localStorage.setItem(`userTier_${email}`, determinedTier);
      setUserTier(determinedTier);

      // 🔄 LIVE BACKEND SYNC POOL WITH FALLBACK ADAPTIVE ENGINE
      const fetchLiveSystemUsersRegistry = async () => {
        try {
          const response = await fetch(`${BACKEND_SERVER_API}/users`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });
          if (response.ok) {
            const cloudUsersData = await response.json();
            setAllUsersList(cloudUsersData);
            // Sync fallback mirror cache registry inside localStorage nodes safely
            localStorage.setItem("system_master_users_registry", JSON.stringify(cloudUsersData));
          } else {
            const activeSystemUsers = JSON.parse(localStorage.getItem("system_master_users_registry") || "[]");
            setAllUsersList(activeSystemUsers);
          }
        } catch (err) {
          // If server instance node is offline, read from isolation framework local arrays
          const activeSystemUsers = JSON.parse(localStorage.getItem("system_master_users_registry") || "[]");
          setAllUsersList(activeSystemUsers);
        }
      };

      fetchLiveSystemUsersRegistry();
    }
  }, [refreshTrigger, userEmail]);

  const triggerGlobalSync = () => setRefreshTrigger(prev => prev + 1);

  if (!isLoggedIn) {
    return <AuthPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const profileName = localStorage.getItem(`profileName_${userEmail}`) || "RK Ahaan";

  const menuItems = [
    { token: "dashboard" as ActivePage, label: "Dashboard", icon: LayoutDashboard },
    { token: "cards" as ActivePage, label: "Bank Accounts", icon: Building2 },
    { token: "transactions" as ActivePage, label: "Transactions", icon: ArrowLeftRight },
    { token: "investments" as ActivePage, label: "Assets", icon: TrendingUp },
    { token: "loans" as ActivePage, label: "Loan & Debt", icon: ShieldAlert },
  ];

  // 🛠️ PROCESS ADMIN TIER LIVE SYNCHRONIZATION OUTBOUND APIS TO NODE ENVIRONMENT
  const handleModifyUserTier = async (targetEmail: string, nextTier: string) => {
    localStorage.setItem(`userTier_${targetEmail}`, nextTier);
    
    try {
      const response = await fetch(`${BACKEND_SERVER_API}/users/update-tier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, tier: nextTier })
      });
      if (response.ok) {
        console.log("Cloud sync completed for role modifications.");
      }
    } catch (e) {
      console.log("Local standalone tier modification executed successfully.");
    }

    alert(`User access configuration mapped to level tier: ${nextTier}`);
    triggerGlobalSync();
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", position: "fixed", top: 0, left: 0, backgroundColor: "#0B1224" }}>
      
      {/* SIDEBAR NAVIGATION COLUMN */}
      <aside style={{ width: "250px", minWidth: "250px", height: "100%", backgroundColor: "#090F1C", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid #141D32" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "24px 20px", borderBottom: "1px solid #141D32" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#141D32", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/logo.png" alt="Logo" onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div>
              <h4 style={{ color: "#FFFFFF", margin: 0, fontSize: "16px", fontWeight: 800 }}>GAZI GROUP</h4>
              <small style={{ color: "#00CFE8", fontSize: "10px", fontWeight: 700 }}>VAULT SYSTEM</small>
            </div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "20px 14px" }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.token;
              return (
                <button key={item.token} onClick={() => setActivePage(item.token)} style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", padding: "12px 16px", borderRadius: "12px", border: "none", backgroundColor: isActive ? "#2563EB" : "transparent", color: "#FFFFFF", textAlign: "left", fontSize: "13px", cursor: "pointer" }}>
                  <Icon style={{ width: "16px", height: "16px", color: isActive ? "#FFFFFF" : "#64748B" }} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button onClick={() => setActivePage("person")} style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", padding: "12px 16px", borderRadius: "12px", border: "none", backgroundColor: activePage === "person" ? "#2563EB" : "transparent", color: "#FFFFFF", textAlign: "left", fontSize: "13px", cursor: "pointer" }}><Users style={{ width: "16px", height: "16px", color: "#64748B" }} /><span>Person Ledger</span></button>
            <button onClick={() => setActivePage("savings-goals")} style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", padding: "12px 16px", borderRadius: "12px", border: "none", backgroundColor: activePage === "savings-goals" ? "#2563EB" : "transparent", color: "#FFFFFF", textAlign: "left", fontSize: "13px", cursor: "pointer" }}><FolderHeart style={{ width: "16px", height: "16px", color: "#64748B" }} /><span>Savings Goals</span></button>
            <button onClick={() => setActivePage("budgets")} style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", padding: "12px 16px", borderRadius: "12px", border: "none", backgroundColor: activePage === "budgets" ? "#2563EB" : "transparent", color: "#FFFFFF", textAlign: "left", fontSize: "13px", cursor: "pointer" }}><PieChart style={{ width: "16px", height: "16px", color: "#64748B" }} /><span>Budget</span></button>

            {(userTier === "Admin" || userTier === "Super Admin" || userTier === "Prime") && (
              <button onClick={() => setActivePage("files")} style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", padding: "12px 16px", borderRadius: "12px", border: "none", backgroundColor: activePage === "files" ? "#10B981" : "transparent", color: "#FFFFFF", textAlign: "left", fontSize: "13px", cursor: "pointer" }}><Files style={{ width: "16px", height: "16px", color: "#FFFFFF" }} /><span>Files Storage</span></button>
            )}

            <button onClick={() => setActivePage("profile")} style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", padding: "12px 16px", borderRadius: "12px", border: "none", backgroundColor: activePage === "profile" ? "#2563EB" : "transparent", color: "#FFFFFF", textAlign: "left", fontSize: "13px", cursor: "pointer" }}><User style={{ width: "16px", height: "16px", color: "#64748B" }} /><span>Identity Profile</span></button>
          </nav>
        </div>

        <div style={{ padding: "0 14px 20px 14px" }}>
          <button onClick={() => { localStorage.removeItem("userEmail"); window.location.reload(); }} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", borderRadius: "12px", border: "none", backgroundColor: "transparent", color: "#EF4444", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}><LogOut style={{ width: "16px", height: "16px" }} /><span>Sign Out</span></button>
        </div>
      </aside>

      {/* VIEWPORT CONTROLLER */}
      <main style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: "60px", backgroundColor: "#090F1C", borderBottom: "1px solid #141D32", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
          <div style={{ fontSize: "13px", color: "#94A3B8" }}>GAZI GROUP Core Matrix Financial Network Terminal</div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            
            <div 
              onClick={() => { if (userTier !== "Super Admin" && userTier !== "Admin") setOpenSubscriptionGate(true); else if (userTier === "Super Admin") setActivePage("superadmin"); }} 
              style={{ padding: "6px 14px", backgroundColor: userTier === "Free" ? "rgba(239,68,68,0.12)" : "rgba(37,99,236,0.15)", color: userTier === "Free" ? "#EF4444" : "#3B82F6", borderRadius: "6px", fontSize: "11px", fontWeight: 800, cursor: "pointer", border: "1px solid transparent" }}
            >
              {userTier.toUpperCase()} SYSTEM NODE
            </div>
            
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontWeight: 700, fontSize: "12px" }}>
              {profileName ? profileName.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </header>

        {/* SUBSCRIPTION PLANS PAYMENT OVERLAY MODAL */}
        {openSubscriptionGate && (
          <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999999 }}>
            <div style={{ backgroundColor: "#141D32", width: "520px", padding: "32px", borderRadius: "24px", border: "1px solid #232E48", display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
              
              <button onClick={() => { setOpenSubscriptionGate(false); setChosenPlanCost(null); setQrImageError(false); }} style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={18}/></button>
              
              <div style={{ borderBottom: "1px solid #232E48", paddingBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Unlock Gazi Premium Vault License</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94A3B8" }}>Choose a tier plan to lift data operational framework limits.</p>
              </div>

              {!chosenPlanCost ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div onClick={() => setChosenPlanCost("₹99 / Month")} style={{ backgroundColor: "#0B1224", border: "1px solid #232E48", padding: "18px", borderRadius: "14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><strong style={{ display: "block", fontSize: "14px", color: "#FFF" }}>Standard Monthly Access</strong><small style={{ color: "#64748B" }}>Billed every 30 days cycle loop</small></div>
                    <strong style={{ color: "#00CFE8", fontSize: "16px" }}>₹99 / Mo</strong>
                  </div>
                  <div onClick={() => setChosenPlanCost("₹399 / Year")} style={{ backgroundColor: "#0B1224", border: "2px solid #2563EB", padding: "18px", borderRadius: "14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><strong style={{ display: "block", fontSize: "14px", color: "#FFF" }}>Corporate Annual Premium Plan</strong><small style={{ color: "#10B981", fontWeight: "bold" }}>🔥 Best Value Scheme Saved 60%</small></div>
                    <strong style={{ color: "#10B981", fontSize: "16px" }}>₹399 / Yr</strong>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center" }}>
                  
                  {/* PREMIUM QR CODE TARGETING THE PUBLIC FOLDER FILE */}
                  <div style={{ backgroundColor: "#FFF", padding: "12px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "160px", minHeight: "160px" }}>
                    {!qrImageError ? (
                      <img 
                        src="/qr-payment.png" 
                        alt="Payment QR Ingestion File" 
                        onError={() => setQrImageError(true)} 
                        style={{ width: "180px", height: "180px", objectFit: "contain" }} 
                      />
                    ) : (
                      <div style={{ width: "180px", height: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#000", gap: "8px" }}>
                        <QrCode size={100}/>
                        <span style={{ fontSize: "10px", fontWeight: "bold" }}>[ qr-payment.png missing ]</span>
                      </div>
                    )}
                  </div>

                  <div style={{ backgroundColor: "#0B1224", padding: "14px", borderRadius: "12px", border: "1px solid #232E48", width: "100%", boxSizing: "border-box" }}>
                    <span style={{ fontSize: "11px", color: "#64748B", display: "block", fontWeight: "bold" }}>SELECTED COMPILATION LICENSE RATE:</span>
                    <strong style={{ fontSize: "16px", color: "#00CFE8" }}>{chosenPlanCost}</strong>
                    <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "8px", lineHeight: "16px", textAlign: "left" }}>
                      ⚠️ **Verification Rule:** Your primary account holder name matching profile registry and the origin transaction bank settlement account name **MUST** correspond identically to process activation.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%", textAlign: "left", borderTop: "1px dashed #232E48", paddingTop: "14px" }}>
                    <small style={{ color: "#64748B", fontSize: "11px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}><Mail size={12}/> OFFICIAL SUPPORT REGISTRY WIRE:</small>
                    <strong style={{ fontSize: "13px", color: "#FFF" }}>gazigroup.admin@gmail.com</strong>
                    <p style={{ fontSize: "11px", color: "#64748B", margin: "4px 0 0 0", lineHeight: "16px" }}>
                      Agar 24 ghante ke andar prime subscription activation verification status execute nahi hota hai, toh isi email address pe apna payment successful screen transaction snapshot profile credentials screenshot ke sath forward karein.
                    </p>
                  </div>

                  <button onClick={() => setChosenPlanCost(null)} style={{ background: "none", border: "none", color: "#2563EB", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}>← View Alternative Plans</button>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          <div style={{ maxWidth: "1150px", margin: "0 auto", width: "100%" }}>
            
            {activePage === "dashboard" && <DashboardPage key={refreshTrigger} />}
            {activePage === "cards" && <BankAccountsPage key={refreshTrigger} onSync={triggerGlobalSync} />}
            {activePage === "transactions" && <TransactionsPage key={refreshTrigger} />}
            {activePage === "investments" && <InvestmentsPage key={refreshTrigger} onSync={triggerGlobalSync} />}
            {activePage === "loans" && <LoansPage key={refreshTrigger} onSync={triggerGlobalSync} />}
            {activePage === "savings-goals" && <SavingsGoalsPage key={refreshTrigger} onSync={triggerGlobalSync} />}
            {activePage === "budgets" && <BudgetsPage key={refreshTrigger} onSync={triggerGlobalSync} />}
            {activePage === "files" && <FilesPage />}
            {activePage === "person" && <PersonPage p2pRelations={[]} p2pName="" p2pAmount="" p2pType="" p2pNotes="" setP2pName={()=>{}} setP2pAmount={()=>{}} setP2pType={()=>{}} setP2pNotes={()=>{}} handleAddP2PRelation={()=>{}} handleDeleteP2PRelation={()=>{}} />}

            {activePage === "profile" && (
              <ProfilePage
                userEmail={userEmail} userTier={userTier} profileName={profileName} profileAvatar=""
                inputName="" inputPhone="" inputAddress="" inputPan="" inputAadhaar=""
                setInputName={()=>{}} setInputPhone={()=>{}} setInputAddress={()=>{}} setInputPan={()=>{}} setInputAadhaar={()=>{}}
                handleSaveChanges={()=>{}} triggerGlobalSync={triggerGlobalSync}
              />
            )}

            {activePage === "superadmin" && userTier === "Super Admin" && (
              <SuperAdminPage allUsersList={allUsersList} userEmail={userEmail} handleModifyUserTier={handleModifyUserTier} />
            )}

          </div>
        </div>
      </main>

    </div>
  );
}
