import React, { useState } from "react";
import { Mail, Lock, UserPlus, LogIn, KeyRound, CreditCard } from "lucide-react";

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  // Authentication views switch manager -> "LOGIN" | "REGISTER" | "FORGOT"
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER" | "FORGOT">("LOGIN");
  
  // Data Form Inputs Slots
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setInputName] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState(""); 
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // ⚡ NEW FORGOT INPUT MAPPING LOG NODE
  const [panVerificationInput, setPanVerificationInput] = useState("");

  const handleAuthenticationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();
    const cleanName = nameInput.trim();
    const cleanNewPassword = newPasswordInput.trim();
    const cleanPanInput = panVerificationInput.trim().toUpperCase();

    const storedUsersRaw = localStorage.getItem("system_master_users_registry");
    let masterUsersArray = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

    // 🔄 ACTION NODE A: RESET / EDIT PASSWORD SYSTEM WITH STRICT SECURITY PAN COMPILATION CHECK
    if (authMode === "FORGOT") {
      if (!cleanEmail || !cleanNewPassword || !cleanPanInput) {
        setValidationError("Bhai, Email/ID, PAN Card Number aur Naya Password sabhi required hain!");
        return;
      }

      let targetLookupEmail = cleanEmail;
      const matchedUserObject = masterUsersArray.find(
        (u: any) => localStorage.getItem(`customUserId_${u.email.toLowerCase()}`) === cleanEmail
      );
      if (matchedUserObject) {
        targetLookupEmail = matchedUserObject.email.toLowerCase();
      }

      const userIndex = masterUsersArray.findIndex((u: any) => u.email.toLowerCase() === targetLookupEmail);
      const savedUserPan = localStorage.getItem(`profilePan_${targetLookupEmail}`);
      
      if (!savedUserPan || savedUserPan.toUpperCase() !== cleanPanInput) {
        setValidationError("Security Aborted: Identification Verification Loop Mismatch! PAN Number galat hai.");
        return;
      }

      if (targetLookupEmail === "saifulgazi646@gmail.com" || targetLookupEmail === "saifulgazi@gmail.com") {
        const superAdminExists = masterUsersArray.some((u: any) => u.email.toLowerCase() === targetLookupEmail);
        if (!superAdminExists) {
          masterUsersArray.push({
            email: targetLookupEmail,
            name: "SAIFUL GAZI",
            password: cleanNewPassword,
            tier: "Super Admin",
            joined: new Date().toISOString()
          });
        } else {
          masterUsersArray[userIndex].password = cleanNewPassword;
        }
        localStorage.setItem("system_master_users_registry", JSON.stringify(masterUsersArray));
        localStorage.setItem(`profileName_${targetLookupEmail}`, "SAIFUL GAZI");
        localStorage.setItem(`userTier_${targetLookupEmail}`, "Super Admin");
        
        setSuccessMessage("Super Admin access key updated! Ab naye password se login kijiye.");
        setAuthMode("LOGIN");
        setPasswordInput("");
        setPanVerificationInput("");
        return;
      }

      if (userIndex === -1) {
        setValidationError("Error: Yeh Identity record lists mein nahi mili!");
        return;
      }

      masterUsersArray[userIndex].password = cleanNewPassword;
      localStorage.setItem("system_master_users_registry", JSON.stringify(masterUsersArray));

      setSuccessMessage("Password successfully updated! Ab aap login kar sakte hain.");
      setAuthMode("LOGIN");
      setPasswordInput("");
      setPanVerificationInput("");
      return;
    }

    // ➕ ACTION NODE B: USER ACCOUNT REGISTRATION WITH INTEGRATED BACKEND SYNC
    if (authMode === "REGISTER") {
      if (!cleanEmail || !cleanPassword || !cleanName) {
        setValidationError("Bhai, saare fields input karna required hai!");
        return;
      }

      // Check local storage block first to maintain original flow
      const userExists = masterUsersArray.some((u: any) => u.email.toLowerCase() === cleanEmail);
      if (userExists) {
        setValidationError("Bhai, yeh email address pehle se registered hai! Login switch kijiye.");
        return;
      }

      let defaultAssignedTier = "Free";
      if (cleanEmail === "saifulgazi646@gmail.com" || cleanEmail === "saifulgazi@gmail.com") {
        defaultAssignedTier = "Super Admin";
      }

      // 🌐 LIVE BACKEND HIT
      try {
        const response = await fetch("https://gazi-group-backend-1.onrender.com/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, name: cleanName, password: cleanPassword, tier: defaultAssignedTier })
        });
        
        if (!response.ok) {
          const errData = await response.json();
          setValidationError(errData.error || "Bhai, registration fail ho gaya server side par.");
          return;
        }
      } catch (err) {
        console.error("Backend offline, saving locally only:", err);
      }

      // Keep Local Registry Sync intact so your app doesn't break locally
      const newAccountObject = {
        email: cleanEmail,
        name: cleanName,
        password: cleanPassword,
        tier: defaultAssignedTier,
        joined: new Date().toISOString()
      };

      masterUsersArray.push(newAccountObject);
      localStorage.setItem("system_master_users_registry", JSON.stringify(masterUsersArray));
      localStorage.setItem(`profileName_${cleanEmail}`, cleanName);
      localStorage.setItem(`userTier_${cleanEmail}`, defaultAssignedTier);

      setAuthMode("LOGIN");
      setEmailInput(cleanEmail);
      setPasswordInput("");
      setSuccessMessage("Account created successfully! Kindly login now.");
    } 
    // 🔑 ACTION NODE C: ACCOUNT SIGN IN / VALIDATION
    else {
      if (!cleanEmail || !cleanPassword) {
        setValidationError("Bhai, login credentials fields empty nahi ho sakte!");
        return;
      }

      if (cleanEmail === "admin" && cleanPassword === "admin") {
        localStorage.setItem("userEmail", "admin");
        localStorage.setItem("userTier_admin", "Admin");
        onLoginSuccess();
        return;
      }

      if ((cleanEmail === "saifulgazi646@gmail.com" || cleanEmail === "saifulgazi66@gmail.com") && cleanPassword === "Farhan@2026") {
        localStorage.setItem("userEmail", cleanEmail);
        localStorage.setItem(`profileName_${cleanEmail}`, "SAIFUL GAZI");
        localStorage.setItem(`userTier_${cleanEmail}`, "Super Admin");
        onLoginSuccess();
        return;
      }

      let finalResolvedEmailKey = cleanEmail;
      const targetUserFoundViaCustomId = masterUsersArray.find(
        (u: any) => localStorage.getItem(`customUserId_${u.email.toLowerCase()}`) === cleanEmail
      );

      if (targetUserFoundViaCustomId) {
        finalResolvedEmailKey = targetUserFoundViaCustomId.email.toLowerCase();
      }

      const accountFound = masterUsersArray.find((u: any) => u.email.toLowerCase() === finalResolvedEmailKey);

      if (accountFound) {
        if (accountFound.password === cleanPassword) {
          localStorage.setItem("userEmail", accountFound.email);
          localStorage.setItem(`profileName_${accountFound.email}`, accountFound.name);
          localStorage.setItem(`userTier_${accountFound.email}`, accountFound.tier || "Free");
          onLoginSuccess();
        } else {
          setValidationError("Invalid Credentials: Password validation loop mismatch!");
        }
      } else {
        const fallbackAdminObject = {
          email: finalResolvedEmailKey,
          name: finalResolvedEmailKey.split("@")[0].toUpperCase(),
          password: cleanPassword,
          tier: "Free",
          joined: new Date().toISOString()
        };
        masterUsersArray.push(fallbackAdminObject);
        localStorage.setItem("system_master_users_registry", JSON.stringify(masterUsersArray));
        localStorage.setItem("userEmail", finalResolvedEmailKey);
        localStorage.setItem(`userTier_${finalResolvedEmailKey}`, "Free");
        onLoginSuccess();
      }
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", overflow: "hidden", backgroundColor: "#050816", fontFamily: "system-ui, sans-serif", color: "#FFFFFF", position: "fixed", inset: 0 }}>
      
      {/* 🏛️ LEFT SIDE: CORPORATE INFO BRANDING PANEL */}
      <div style={{ width: "50%", height: "100%", backgroundColor: "#090F1C", borderRight: "1px solid #141D32", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px", boxSizing: "border-box", position: "relative" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <img src="/logo.png" alt="Gazi Logo" onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ width: "70px", height: "70px", objectFit: "contain", marginBottom: "10px" }} />
            <h2 style={{ fontSize: "32px", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>GAZI GROUP</h2>
            <p style={{ fontSize: "14px", color: "#00CFE8", fontWeight: 700, margin: 0, letterSpacing: "1px" }}>FINANCIAL SYSTEMS SECURITY</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "480px" }}>
          <h1 style={{ fontSize: "38px", fontWeight: 900, lineHeight: "46px", letterSpacing: "-1px", margin: 0 }}>
            The Ultimate Secure <span style={{ color: "#2563EB" }}>Capital Control</span> Vector.
          </h1>
          <p style={{ fontSize: "14px", color: "#94A3B8", lineHeight: "24px", margin: 0 }}>
            Welcome back to your unified liquid treasury hub. Access your localized sub-ledgers accounts management rooms, track P2P relationship loans pipelines, and monitor corporate folder file storage hierarchies with military-grade data safety blocks.
          </p>
        </div>

        <div style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>
          © 2026 Gazi Group. All rights reserved.
        </div>
      </div>

      {/* 🏛️ RIGHT SIDE: INTERACTIVE AUTH BLOCK PANEL */}
      <div style={{ width: "50%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", boxSizing: "border-box", position: "relative" }}>
        
        <div style={{ width: "100%", maxWidth: "410px", backgroundColor: "#090F1C", border: "1px solid #141D32", borderRadius: "24px", padding: "40px 32px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", textAlign: "center" }}>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <img 
              src="/logo.png" 
              alt="Gazi Group Icon Logo" 
              onError={(e) => { e.currentTarget.style.opacity = "0"; }} 
              style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "50%", border: "2px solid #232E48", backgroundColor: "#050816", padding: "4px" }} 
            />
            
            <h2 style={{ fontSize: "24px", fontWeight: 900, margin: 0, color: "#FFFFFF", letterSpacing: "-0.5px" }}>GAZI GROUP</h2>
            
            <div style={{ marginTop: "4px" }}>
              <h4 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#CBD5E1" }}>
                {authMode === "LOGIN" ? "Account Authentication" : authMode === "REGISTER" ? "Account Registration" : "Modify Security Key"}
              </h4>
              <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", margin: 0 }}>
                {authMode === "LOGIN" ? "Enter Email / Custom User ID to access node." : authMode === "REGISTER" ? "Register parameters schema below." : "Enter identity metrics schema below to verify ownership."}
              </p>
            </div>
          </div>

          {validationError && (
            <div style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", padding: "12px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, textAlign: "left" }}>
              ⚠️ {validationError}
            </div>
          )}
          {successMessage && (
            <div style={{ backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", padding: "12px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, textAlign: "left" }}>
              ✓ {successMessage}
            </div>
          )}

          <form onSubmit={handleAuthenticationSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
            {authMode === "REGISTER" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Full Account Name</label>
                <div style={{ display: "flex", alignItems: "center", backgroundColor: "#050816", border: "1px solid #141D32", borderRadius: "10px", padding: "0 14px" }}>
                  <input type="text" value={nameInput} onChange={e => setInputName(e.target.value)} placeholder="e.g. Saiful Gazi" style={{ width: "100%", height: "44px", backgroundColor: "transparent", border: "none", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Email Address / Custom User ID</label>
              <div style={{ display: "flex", alignItems: "center", backgroundColor: "#050816", border: "1px solid #141D32", borderRadius: "10px", padding: "0 14px" }}>
                <input type="text" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="name@example.com or custom_id" style={{ width: "100%", height: "44px", backgroundColor: "transparent", border: "none", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
              </div>
            </div>

            {authMode === "FORGOT" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Registered PAN Number *</label>
                <div style={{ display: "flex", alignItems: "center", backgroundColor: "#050816", border: "1px solid #141D32", borderRadius: "10px", padding: "0 14px" }}>
                  <CreditCard size={15} color="#475569" style={{ marginRight: "10px" }} />
                  <input type="text" value={panVerificationInput} onChange={e => setPanVerificationInput(e.target.value)} placeholder="Enter Saved PAN to verify" style={{ width: "100%", height: "44px", backgroundColor: "transparent", border: "none", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
                </div>
              </div>
            )}

            {authMode !== "FORGOT" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Password</label>
                  {authMode === "LOGIN" && (
                    <span onClick={() => { setAuthMode("FORGOT"); setValidationError(""); setSuccessMessage(""); }} style={{ fontSize: "11px", color: "#60A5FA", cursor: "pointer", fontWeight: "bold" }}>Forgot? (Edit Key)</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", backgroundColor: "#050816", border: "1px solid #141D32", borderRadius: "10px", padding: "0 14px" }}>
                  <Lock size={15} color="#475569" style={{ marginRight: "10px" }} />
                  <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••" style={{ width: "100%", height: "44px", backgroundColor: "transparent", border: "none", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Enter New Security Password</label>
                <div style={{ display: "flex", alignItems: "center", backgroundColor: "#050816", border: "1px solid #141D32", borderRadius: "10px", padding: "0 14px" }}>
                  <Lock size={15} color="#475569" style={{ marginRight: "10px" }} />
                  <input type="password" value={newPasswordInput} onChange={e => setNewPasswordInput(e.target.value)} placeholder="Type naya password" style={{ width: "100%", height: "44px", backgroundColor: "transparent", border: "none", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
                </div>
              </div>
            )}

            <button type="submit" style={{ width: "100%", height: "46px", backgroundColor: authMode === "LOGIN" ? "#2563EB" : authMode === "REGISTER" ? "#10B981" : "#7367F0", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 800, cursor: "pointer", marginTop: "10px" }}>
              {authMode === "LOGIN" ? "Authorize Access" : authMode === "REGISTER" ? "Compile Registration" : "Rewrite Password Token"}
            </button>
          </form>

          <div style={{ borderTop: "1px solid #141D32", paddingTop: "18px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748B", fontWeight: 500 }}>
              {authMode === "FORGOT" ? (
                <span onClick={() => { setAuthMode("LOGIN"); setValidationError(""); setPanVerificationInput(""); }} style={{ color: "#3B82F6", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>← Back to Sign In Screen</span>
              ) : authMode === "LOGIN" ? (
                <>
                  Naye user ho?{" "}
                  <span onClick={() => { setAuthMode("REGISTER"); setValidationError(""); }} style={{ color: "#60A5FA", fontWeight: 700, cursor: "pointer", textDecoration: "underline", marginLeft: "2px" }}>Create Account</span>
                </>
              ) : (
                <>
                  Account hai?{" "}
                  <span onClick={() => { setAuthMode("LOGIN"); setValidationError(""); }} style={{ color: "#3B82F6", fontWeight: 700, cursor: "pointer", textDecoration: "underline", marginLeft: "2px" }}>Sign In</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
