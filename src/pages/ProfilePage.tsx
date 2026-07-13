import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, CreditCard, Shield, Save, Camera, Lock, X } from "lucide-react";

interface ProfilePageProps {
  userEmail: string;
  userTier: string;
  profileName: string;
  profileAvatar: string;
  inputName: string;
  inputPhone: string;
  inputAddress: string;
  inputPan: string;
  inputAadhaar: string;
  setInputName: (val: string) => void;
  setInputPhone: (val: string) => void;
  setInputAddress: (val: string) => void;
  setInputPan: (val: string) => void;
  setInputAadhaar: (val: string) => void;
  handleSaveChanges: () => void;
  triggerGlobalSync: () => void;
}

export default function ProfilePage({ userEmail, userTier, triggerGlobalSync }: ProfilePageProps) {
  // Localized state for isolation - HAR EK FIELD 100% WAPAS AA GAYA HAI
  const [localName, setLocalName] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [localPan, setLocalPan] = useState("");
  const [localAadhaar, setLocalAadhaar] = useState("");
  const [localAvatar, setLocalAvatar] = useState(""); // Profile photo storage
  
  // ⚡ CUSTOM USER ID & PASSWORD MODAL ARCHITECTURE POOLS
  const [customUserId, setCustomUserId] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [modalError, setModalError] = useState("");
  const [isUserIdFrozen, setIsUserIdFrozen] = useState(false);

  useEffect(() => {
    // Unique keys ensure zero data leakage between different users
    setLocalName(localStorage.getItem(`profileName_${userEmail}`) || "");
    setLocalPhone(localStorage.getItem(`profilePhone_${userEmail}`) || "");
    setLocalAddress(localStorage.getItem(`profileAddress_${userEmail}`) || "");
    setLocalPan(localStorage.getItem(`profilePan_${userEmail}`) || "");
    setLocalAadhaar(localStorage.getItem(`profileAadhaar_${userEmail}`) || "");
    setLocalAvatar(localStorage.getItem(`profileAvatar_${userEmail}`) || "");
    
    // Fetch Custom User ID mapping token node
    const savedCustomId = localStorage.getItem(`customUserId_${userEmail}`) || "";
    setCustomUserId(savedCustomId);
    
    // 🔒 FREEZE CONDITION CHECK ENGINE
    if (savedCustomId.trim()) {
      setIsUserIdFrozen(true);
    } else {
      setIsUserIdFrozen(false);
    }
  }, [userEmail]);

  // 📸 Handle Photo Selection
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const commitIsolatedProfileChanges = () => {
    const trimmedId = customUserId.trim().toLowerCase();
    const cleanPan = localPan.trim().toUpperCase();

    // 🔒 Mandatory validation check parameter loop rule requirement
    if (!cleanPan) {
      alert("Bhai, Profile mein PAN Number daalna mandatory hai!");
      return;
    }
    
    // Check if the target Custom User ID is already occupied by another session registry
    if (trimmedId && !isUserIdFrozen) {
      const storedUsersRaw = localStorage.getItem("system_master_users_registry");
      const masterUsersArray = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      
      const isIdTaken = masterUsersArray.some(
        (u: any) => 
          u.email.toLowerCase() !== userEmail.toLowerCase() && 
          localStorage.getItem(`customUserId_${u.email.toLowerCase()}`) === trimmedId
      );
      
      if (isIdTaken) {
        alert("Bhai, yeh Custom User ID pehle se kisi aur user ne li hui hai! Kripya doosri chuniye.");
        return;
      }
    }

    localStorage.setItem(`profileName_${userEmail}`, localName);
    localStorage.setItem(`profilePhone_${userEmail}`, localPhone);
    localStorage.setItem(`profileAddress_${userEmail}`, localAddress);
    localStorage.setItem(`profilePan_${userEmail}`, cleanPan);
    localStorage.setItem(`profileAadhaar_${userEmail}`, localAadhaar);
    localStorage.setItem(`profileAvatar_${userEmail}`, localAvatar);
    
    // Commit the custom credential string mapping only if not frozen inside memory layer strings
    if (!isUserIdFrozen && trimmedId) {
      localStorage.setItem(`customUserId_${userEmail}`, trimmedId);
      setIsUserIdFrozen(true);
    }
    
    alert("Profile configurations saved successfully!");
    triggerGlobalSync();
  };

  // 🛠️ PROCESS CHANGE PASSWORD SUBMIT INTERFACE LOGIC
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!currentPassword.trim() || !newPassword.trim()) {
      setModalError("Bhai, fields khali nahi ho sakte!");
      return;
    }

    const storedUsersRaw = localStorage.getItem("system_master_users_registry");
    let masterUsersArray = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
    
    const userIndex = masterUsersArray.findIndex((u: any) => u.email.toLowerCase() === userEmail.toLowerCase());

    if (userIndex !== -1) {
      if (masterUsersArray[userIndex].password !== currentPassword.trim()) {
        setModalError("Current password galat hai bhai!");
        return;
      }
      
      masterUsersArray[userIndex].password = newPassword.trim();
      localStorage.setItem("system_master_users_registry", JSON.stringify(masterUsersArray));
      
      alert("Password successfully updated!");
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordModal(false);
    } else {
      setModalError("System registry mismatch error found!");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", textAlign: "left", width: "100%", color: "#FFFFFF", fontFamily: "system-ui, sans-serif" }}>
      
      {/* 🌟 HEADER SECTION WITH LOGIN EMAIL DISPLAY CHOTE LETTERS MEIN */}
      <div>
        <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>Identity Profile</h1>
        <p style={{ color: "#00CFE8", fontSize: "12px", marginTop: "4px", fontWeight: 700, letterSpacing: "0.5px" }}>{userEmail}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "28px", alignItems: "start" }}>
        
        {/* LEFT STATUS PANEL WITH AVATAR UPLOAD */}
        <div style={{ backgroundColor: "#090F1C", border: "1px solid #141D32", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
          
          <div style={{ position: "relative" }}>
            <div style={{ width: "90px", height: "90px", borderRadius: "50%", backgroundColor: "#232E48", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 800, overflow: "hidden", border: "2px solid #334155" }}>
              {localAvatar ? (
                <img src={localAvatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                localName ? localName.charAt(0).toUpperCase() : "U"
              )}
            </div>
            <label style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "#2563EB", padding: "8px", borderRadius: "50%", cursor: "pointer" }}>
              <Camera size={14} color="#FFF" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
            </label>
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>{localName || "NEW USER"}</h3>
            <small style={{ color: "#64748B", fontSize: "11px", wordBreak: "break-all" }}>{userEmail}</small>
          </div>
          <div style={{ padding: "4px 12px", backgroundColor: "rgba(37,99,236,0.12)", color: "#3B82F6", borderRadius: "6px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>
            {userTier} Access Node
          </div>

          {/* PASSWORD ACCESS MODIFIER BUTTON */}
          <button 
            onClick={() => { setShowPasswordModal(true); setModalError(""); }} 
            style={{ width: "100%", padding: "10px", backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "10px", color: "#60A5FA", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "10px" }}
          >
            <Lock size={12}/> Change Security Password
          </button>
        </div>

        {/* RIGHT INPUT PANEL - SARE DESIGN FIELDS APNE ASLI ROOP MEIN HAI */}
        <div style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "20px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* CUSTOM USER ID MAPPING SECTION WITH FREEZE LOCK SYSTEM */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", backgroundColor: "#090F1C", padding: "16px", borderRadius: "12px", border: "1px dashed #232E48" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "11px", color: "#00CFE8", fontWeight: 700 }}>CUSTOM UNIQUE USER ID LOGIN CREDENTIAL</label>
              {isUserIdFrozen && <span style={{ fontSize: "10px", backgroundColor: "rgba(239,68,68,0.15)", color: "#EF4444", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>🔒 LOCKED / FROZEN</span>}
            </div>
            <input 
              type="text" 
              value={customUserId} 
              disabled={isUserIdFrozen}
              onChange={e => setCustomUserId(e.target.value)} 
              placeholder="Create unique user ID (Once saved, it cannot be changed later)" 
              style={{ padding: "12px", borderRadius: "10px", backgroundColor: isUserIdFrozen ? "#050816" : "#0B1224", border: "1px solid #232E48", color: isUserIdFrozen ? "#64748B" : "#FFFFFF", fontSize: "13px", outline: "none", cursor: isUserIdFrozen ? "not-allowed" : "text" }} 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}><User size={12} style={{ marginRight: "4px" }}/> FULL NAME</label>
              <input type="text" value={localName} onChange={e => setLocalName(e.target.value)} placeholder="Enter name" style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}><Phone size={12} style={{ marginRight: "4px" }}/> MOBILE NUMBER</label>
              <input type="text" value={localPhone} onChange={e => setLocalPhone(e.target.value)} placeholder="Enter mobile" style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}><MapPin size={12} style={{ marginRight: "4px" }}/> ADDRESS</label>
            <input type="text" value={localAddress} onChange={e => setLocalAddress(e.target.value)} placeholder="Enter full address" style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}><CreditCard size={12} style={{ marginRight: "4px" }}/> PAN NUMBER * (MANDATORY)</label>
              <input type="text" value={localPan} onChange={e => setLocalPan(e.target.value)} placeholder="Enter PAN Number" style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}><Shield size={12} style={{ marginRight: "4px" }}/> AADHAAR NUMBER</label>
              <input type="text" value={localAadhaar} onChange={e => setLocalAadhaar(e.target.value)} placeholder="Enter Aadhaar" style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
            </div>
          </div>

          {/* ⚠️ HIGHLY VISIBLE RED WARNING ALERTS BOX FOR PAN COMPLIANCE */}
          <div style={{ padding: "14px 18px", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px dashed #EF4444", borderRadius: "12px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <p style={{ margin: 0, fontSize: "12px", color: "#FCA5A5", fontWeight: 600, lineHeight: "18px" }}>
              <strong style={{ color: "#EF4444", fontWeight: 800 }}>ATTENTION RECOVERY PROTOCOL WARNING:</strong> PAN Number dena mandatory hai. Agar aapka PAN Number profile mein save nahi hoga, toh password bhoolne ki sthiti mein <strong style={{ color: "#FFF", underline: "true" }}>'Forgot Password' Reset system kisi bhi haal mein kaam nahi karega</strong>.
            </p>
          </div>

          <button 
            onClick={commitIsolatedProfileChanges}
            style={{ width: "100%", padding: "14px", backgroundColor: "#2563EB", border: "none", borderRadius: "12px", color: "#FFFFFF", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px" }}
          >
            <Save size={16}/> Save Profile Details
          </button>
        </div>
      </div>

      {/* CENTRIC POPUP MODAL SCREEN OVERLAY FOR SECURE PASSWORD RESET CHANGE ENGINE */}
      {showPasswordModal && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999999 }}>
          <div style={{ backgroundColor: "#141D32", width: "440px", padding: "28px", borderRadius: "24px", border: "1px solid #232E48", display: "flex", flexDirection: "column", gap: "20px", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            
            <button 
              onClick={() => setShowPasswordModal(false)} 
              style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}
            >
              <X size={18} />
            </button>

            <div style={{ borderBottom: "1px solid #232E48", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>Update Security Key</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748B" }}>Rewrite password cache parameter logs for your active account node.</p>
            </div>

            {modalError && (
              <div style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600 }}>
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>CURRENT PASSWORD</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  placeholder="••••••••" 
                  style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #334155", color: "#FFF", fontSize: "13px", outline: "none" }} 
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>NEW PASSWORD</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="Minimum complex alphanumeric logs" 
                  style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#0B1224", border: "1px solid #334155", color: "#FFF", fontSize: "13px", outline: "none" }} 
                />
              </div>

              <button 
                type="submit" 
                style={{ width: "100%", padding: "14px", backgroundColor: "#2563EB", border: "none", borderRadius: "12px", color: "#FFFFFF", fontSize: "13px", fontWeight: 800, cursor: "pointer", marginTop: "6px" }}
              >
                Confirm Token Rewrite
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}