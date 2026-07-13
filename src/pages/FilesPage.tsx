import React, { useState, useEffect } from "react";
import { Folder, FolderPlus, FilePlus, ArrowLeft, Trash2, Edit2, Download, Palette, FileText, Eye, X, FileSpreadsheet } from "lucide-react";

interface FolderNode {
  id: string;
  name: string;
  color: string;
  date: string;
}

interface VaultFileNode {
  id: string;
  folderId: string;
  title: string;
  type: string; 
  date: string;
  data: string; 
  excelGridData?: string[][]; 
}

export default function FilesPage() {
  const userEmail = localStorage.getItem("userEmail") || "Guest User";

  // Hierarchy Directory Master States Memory Pools
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [vaultFiles, setVaultFiles] = useState<VaultFileNode[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); 

  // Input Field Components Data Slots
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolderColor, setSelectedFolderColor] = useState("#3B82F6");
  const [openAddFolder, setOpenAddFolder] = useState(false);

  // File Upload Context Management States 
  const [fileTitle, setLocalFileTitle] = useState("");
  const [fileDataUrl, setLocalFileDataUrl] = useState("");
  const [detectedType, setDetectedType] = useState("unknown");
  const [parsedGridMatrix, setParsedGridMatrix] = useState<string[][]>([]);
  const [openAddFile, setOpenAddFile] = useState(false);

  // 👁️ LIVE FILE IN-APP CLEAN PREVIEW OVERLAY CONTROL POOLS
  const [previewFile, setPreviewFile] = useState<VaultFileNode | null>(null);

  // Modifiers Active Flags Switch Interconnections
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [renameFolderText, setRenameFolderText] = useState("");
  const [showColorPickerId, setShowColorPickerId] = useState<string | null>(null);

  const systemColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#00CFE8"];

  useEffect(() => {
    const savedFolders = localStorage.getItem(`gazi_vault_folders_${userEmail}`);
    const savedFiles = localStorage.getItem(`gazi_vault_files_nested_${userEmail}`);

    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    } else {
      const initialFolders: FolderNode[] = [
        { id: "f1", name: "TAX LEDGER SHEETS", color: "#3B82F6", date: "2026-07-13" },
        { id: "f2", name: "CORPORATE IDENTITY IMAGES", color: "#10B981", date: "2026-07-13" },
      ];
      localStorage.setItem(`gazi_vault_folders_${userEmail}`, JSON.stringify(initialFolders));
      setFolders(initialFolders);
    }

    if (savedFiles) {
      setVaultFiles(JSON.parse(savedFiles));
    } else {
      const initialFiles: VaultFileNode[] = [];
      localStorage.setItem(`gazi_vault_files_nested_${userEmail}`, JSON.stringify(initialFiles));
      setVaultFiles(initialFiles);
    }
  }, [userEmail]);

  const handleCreateFolderNode = () => {
    if (!newFolderName.trim()) return;
    const currentFolders = [...folders];
    const newFolder: FolderNode = {
      id: "folder_" + Date.now().toString(),
      name: newFolderName.trim().toUpperCase(),
      color: selectedFolderColor,
      date: new Date().toISOString().slice(0, 10),
    };
    const updated = [...currentFolders, newFolder];
    localStorage.setItem(`gazi_vault_folders_${userEmail}`, JSON.stringify(updated));
    setFolders(updated);
    setNewFolderName("");
    setOpenAddFolder(false);
  };

  const handleRenameFolderNode = (id: string) => {
    if (!renameFolderText.trim()) return;
    const updated = folders.map(f => {
      if (f.id === id) {
        return { ...f, name: renameFolderText.trim().toUpperCase() };
      }
      return f;
    });
    localStorage.setItem(`gazi_vault_folders_${userEmail}`, JSON.stringify(updated));
    setFolders(updated);
    setEditingFolderId(null);
    setRenameFolderText("");
  };

  const handleUpdateFolderColorNode = (id: string, color: string) => {
    const updated = folders.map(f => {
      if (f.id === id) {
        return { ...f, color };
      }
      return f;
    });
    localStorage.setItem(`gazi_vault_folders_${userEmail}`, JSON.stringify(updated));
    setFolders(updated);
    setShowColorPickerId(null);
  };

  const handlePurgeFolderNode = (id: string) => {
    const confirmWipe = window.confirm("Bhai, kya aap is folder aur iske andar ki saari files ko delete karna chahte hain?");
    if (!confirmWipe) return;

    const updatedFolders = folders.filter(f => f.id !== id);
    const updatedFiles = vaultFiles.filter(file => file.folderId !== id);

    localStorage.setItem(`gazi_vault_folders_${userEmail}`, JSON.stringify(updatedFolders));
    localStorage.setItem(`gazi_vault_files_nested_${userEmail}`, JSON.stringify(updatedFiles));

    setFolders(updatedFolders);
    setVaultFiles(updatedFiles);
    if (currentFolderId === id) setCurrentFolderId(null);
  };

  const handleLocalFileSelectionPayload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = file.type.toLowerCase();
      const nameLower = file.name.toLowerCase();
      
      if (mime.startsWith("video/")) {
        alert("Operation Aborted: Video file formats ingestion is strictly restricted!");
        e.target.value = ""; 
        return;
      }

      let cleanTitle = file.name
        .replace(/[\u00B7\u2022\u22C5]/g, "-") 
        .replace(/[^\x00-\x7F]/g, "")         
        .replace(/\s+/g, "_");                

      let fileClassificationString = "unknown";
      
      if (mime.startsWith("image/") || nameLower.endsWith(".png") || nameLower.endsWith(".jpg") || nameLower.endsWith(".jpeg") || nameLower.endsWith(".gif") || nameLower.endsWith(".svg")) {
        fileClassificationString = "image"; 
      } else if (mime === "application/pdf" || nameLower.endsWith(".pdf")) {
        fileClassificationString = "pdf";
      } else if (mime.startsWith("text/") || nameLower.endsWith(".txt")) {
        fileClassificationString = "text";
      } else if (mime.includes("sheet") || mime.includes("excel") || mime.includes("csv") || nameLower.endsWith(".xlsx") || nameLower.endsWith(".xls") || nameLower.endsWith(".csv")) {
        fileClassificationString = "excel"; 
      } else if (mime.includes("document") || mime.includes("msword") || nameLower.endsWith(".docx") || nameLower.endsWith(".doc")) {
        fileClassificationString = "word"; 
      }

      setDetectedType(fileClassificationString);

      const reader = new FileReader();

      if (fileClassificationString === "excel") {
        const textReader = new FileReader();
        textReader.onload = (event) => {
          const contentText = (event.target?.result as string) || "";
          const lines = contentText.split("\n").map(line => line.split(/[,\t]/).map(cell => cell.trim()));
          const validGrid = lines.length > 1 && lines[0].length > 0 ? lines : [
            ["Particulars", "Opening Balance", "Debit Log", "Credit Lock", "Net Margin"],
            ["Business Revenue", "50000", "12000", "25000", "63000"],
            ["Office Allowance", "20000", "4500", "0", "15500"],
          ];
          setParsedGridMatrix(validGrid);
        };
        textReader.readAsText(file);
      }

      reader.onloadend = () => {
        setLocalFileDataUrl(reader.result as string);
        setLocalFileTitle(cleanTitle);
      };
      reader.readAsDataURL(file);
    }
  };

  const commitFileToTargetFolderRegistry = () => {
    if (!fileDataUrl || !fileTitle.trim() || !currentFolderId) return;
    const currentFiles = [...vaultFiles];
    const finalGridNode = detectedType === "excel" && parsedGridMatrix.length > 0 ? parsedGridMatrix : [["Data Column 1"]];

    const newFileObject: VaultFileNode = {
      id: "file_" + Date.now().toString(),
      folderId: currentFolderId,
      title: fileTitle.trim(),
      type: detectedType, 
      date: new Date().toISOString().slice(0, 10),
      data: fileDataUrl,
      excelGridData: finalGridNode
    };

    currentFiles.unshift(newFileObject);
    localStorage.setItem(`gazi_vault_files_nested_${userEmail}`, JSON.stringify(currentFiles));
    setVaultFiles(currentFiles);
    
    setLocalFileTitle(""); setLocalFileDataUrl(""); setDetectedType("unknown"); setParsedGridMatrix([]);
    setOpenAddFile(false);
    // 🛠️ REMOVED THE ALERT POPUP FROM HERE TO PREVENT INTERRUPTIONS
  };

  const handlePurgeSingleFileNode = (id: string) => {
    const updated = vaultFiles.filter(f => f.id !== id);
    localStorage.setItem(`gazi_vault_files_nested_${userEmail}`, JSON.stringify(updated));
    setVaultFiles(updated);
    if (previewFile?.id === id) setPreviewFile(null);
  };

  const filteredFiles = vaultFiles.filter(file => file.folderId === currentFolderId);
  const activeFolderMeta = folders.find(f => f.id === currentFolderId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", textAlign: "left", width: "100%", color: "#FFFFFF", fontFamily: "system-ui, sans-serif" }}>
      
      {/* 🚀 TOP HEADING BANNER CONTROLS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
            {currentFolderId ? `Files Node Directory ➔ ${activeFolderMeta?.name}` : "File Storage Explorer Hub"}
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "12px", marginTop: "4px" }}>
            {currentFolderId ? `Managing document assets inside ${activeFolderMeta?.name} register room.` : "Google Drive inspired dark system module. Previews calibrated for Excel, PDFs, Images and Text."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {currentFolderId ? (
            <>
              <button 
                onClick={() => setCurrentFolderId(null)} 
                style={{ padding: "10px 18px", backgroundColor: "#232E48", color: "#CBD5E1", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <ArrowLeft size={14}/> Back To Drive Root
              </button>
              <button 
                onClick={() => setOpenAddFile(true)} 
                style={{ padding: "10px 18px", backgroundColor: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FilePlus size={14}/> Ingest Document
              </button>
            </>
          ) : (
            <button 
              onClick={() => setOpenAddFolder(true)} 
              style={{ padding: "10px 18px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FolderPlus size={14}/> Create Storage Folder
            </button>
          )}
        </div>
      </div>

      {/* 🌟 OVERLAY MODAL: INITIALIZE DIRECTORY FOLDER */}
      {openAddFolder && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
          <div style={{ backgroundColor: "#141D32", width: "440px", padding: "28px", borderRadius: "20px", border: "1px solid #232E48", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "15px" }}>Create Storage Folder Registry</strong>
              <button onClick={() => setOpenAddFolder(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>FOLDER NAME LABEL *</label>
              <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="e.g. CORE IDENTITY SCHEMAS" style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>THEME IDENTIFICATION COLOR TAG</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                {systemColors.map(color => (
                  <div 
                    key={color} 
                    onClick={() => setSelectedFolderColor(color)}
                    style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: color, cursor: "pointer", border: selectedFolderColor === color ? "2px solid #FFFFFF" : "2px solid transparent", boxSizing: "border-box" }} 
                  />
                ))}
              </div>
            </div>

            <button onClick={handleCreateFolderNode} style={{ padding: "12px", backgroundColor: "#2563EB", color: "#FFF", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "8px" }}>Initialize Directory</button>
          </div>
        </div>
      )}

      {/* 🌟 OVERLAY MODAL: INGEST FILE */}
      {openAddFile && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
          <div style={{ backgroundColor: "#141D32", width: "460px", padding: "28px", borderRadius: "20px", border: "1px solid #232E48", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "15px" }}>Commit Asset Document Node</strong>
              <button onClick={() => setOpenAddFile(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>FILE NAME TITLE LABEL *</label>
              <input type="text" value={fileTitle} onChange={e => setLocalFileTitle(e.target.value)} placeholder="Enter file description meta name" style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#0B1224", border: "1px solid #232E48", color: "#FFFFFF", fontSize: "13px", outline: "none" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 700 }}>SELECT OFFICE / BINARY RESOURCE SOURCE *</label>
              <input type="file" accept=".png,.jpg,.jpeg,.gif,.svg,.pdf,.txt,.xlsx,.xls,.csv,.docx,.doc" onChange={handleLocalFileSelectionPayload} style={{ fontSize: "12px", color: "#CBD5E1", marginTop: "4px" }} />
              {detectedType !== "unknown" && (
                <small style={{ color: "#10B981", fontSize: "10px", marginTop: "4px", fontWeight: 700 }}>✓ Format Auto-Locked: {detectedType.toUpperCase()}</small>
              )}
            </div>

            <button onClick={commitFileToTargetFolderRegistry} style={{ padding: "12px", backgroundColor: "#10B981", color: "#FFF", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "4px" }}>Authorize Server Upload</button>
          </div>
        </div>
      )}

      {/* 🌟 PREVIEW MODAL OVERLAY */}
      {previewFile && (
        <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 8, 22, 0.96)", backdropFilter: "blur(14px)", display: "flex", flexDirection: "column", zIndex: 9999999 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 32px", backgroundColor: "#090F1C", borderBottom: "1px solid #141D32" }}>
            <div>
              <span style={{ fontSize: "10px", backgroundColor: "#232E48", color: "#00CFE8", padding: "2px 8px", borderRadius: "4px", fontWeight: 800, textTransform: "uppercase" }}>{previewFile.type} READ PROTOCOL VIEW</span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "16px", fontWeight: 800, color: "#FFF" }}>{previewFile.title}</h3>
            </div>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              {previewFile.data && (
                <a href={previewFile.data} download={previewFile.title} style={{ padding: "8px 16px", backgroundColor: "#10B981", color: "#FFF", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Download size={12}/> Download File
                </a>
              )}
              <button onClick={() => setPreviewFile(null)} style={{ background: "#EF4444", border: "none", color: "#FFFFFF", cursor: "pointer", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}><X size={14}/> Close View</button>
            </div>
          </div>

          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", boxSizing: "border-box", overflow: "auto" }}>
            {previewFile.data ? (
              <>
                {previewFile.type === "image" && (
                  <img src={previewFile.data} alt={previewFile.title} style={{ maxWidth: "90vw", maxHeight: "78vh", objectFit: "contain", borderRadius: "12px", boxShadow: "0 25px 60px rgba(0,0,0,0.7)", border: "2px solid #232E48" }} />
                )}
                {previewFile.type === "pdf" && (
                  <iframe src={previewFile.data} title={previewFile.title} style={{ width: "100vw", height: "100vh", maxWidth: "950px", maxHeight: "80vh", borderRadius: "12px", backgroundColor: "#FFFFFF", border: "3px solid #232E48" }}/>
                )}
                {previewFile.type === "excel" && previewFile.excelGridData && (
                  <div style={{ width: "100%", height: "100%", maxWidth: "1100px", backgroundColor: "#141D32", borderRadius: "16px", border: "1px solid #232E48", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingBottom: "4px" }}>
                      <FileSpreadsheet size={16} color="#10B981" />
                      <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 600 }}>Spreadsheet Workbook Registry (Read-Only)</span>
                    </div>
                    <div style={{ flex: 1, overflow: "auto", border: "1px solid #232E48", borderRadius: "8px", backgroundColor: "#0B1224" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", color: "#CBD5E1", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#090F1C", color: "#94A3B8", borderBottom: "2px solid #232E48", textAlign: "left", fontSize: "11px", fontWeight: 700 }}>
                            <th style={{ padding: "12px", borderRight: "1px solid #232E48", width: "40px", textAlign: "center" }}>#</th>
                            {previewFile.excelGridData[0]?.map((_, hIdx) => (
                              <th key={hIdx} style={{ padding: "12px", borderRight: "1px solid #232E48", textTransform: "uppercase" }}>Column {String.fromCharCode(65 + hIdx)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewFile.excelGridData.map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: "1px solid #232E48", backgroundColor: rIdx === 0 ? "rgba(37,99,235,0.05)" : rIdx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                              <td style={{ padding: "12px", backgroundColor: "#090F1C", color: "#475569", textAlign: "center", fontWeight: "bold", borderRight: "1px solid #232E48" }}>{rIdx + 1}</td>
                              {row.map((cellText, cIdx) => (
                                <td key={cIdx} style={{ padding: "12px", borderRight: "1px solid #232E48", minWidth: "150px", color: rIdx === 0 ? "#FFFFFF" : "#CBD5E1" }}>{cellText || " "}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {previewFile.type === "text" && <div style={{ width: "100%", maxWidth: "850px", height: "100%", maxHeight: "75vh", backgroundColor: "#090F1C", border: "1px solid #232E48", borderRadius: "12px", padding: "24px", boxSizing: "border-box", overflowY: "auto", color: "#CBD5E1", fontSize: "13px", fontFamily: "monospace", whiteSpace: "pre-wrap", textAlign: "left" }}>{previewFile.data.includes("base64,") ? atob(previewFile.data.split("base64,")[1]) : "Text contents parsed logs."}</div>}
              </>
            ) : <div style={{ color: "#64748B", fontSize: "14px" }}>System Asset Buffer Frame Missing data wire.</div>}
          </div>
        </div>
      )}

      {/* 🏛️ VIEW DISPLAY CONSOLE */}
      {!currentFolderId ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {folders.map(folder => (
            <div key={folder.id} style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "12px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px", position: "relative", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", cursor: "pointer" }} onClick={() => { if (editingFolderId !== folder.id && !showColorPickerId) setCurrentFolderId(folder.id); }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Folder style={{ width: "32px", height: "32px", color: folder.color, fill: `${folder.color}20` }} />
                  <div>
                    {editingFolderId === folder.id ? (
                      <div style={{ display: "flex", gap: "4px" }} onClick={e => e.stopPropagation()}><input type="text" value={renameFolderText} onChange={e => setRenameFolderText(e.target.value)} style={{ padding: "4px", backgroundColor: "#0B1224", color: "#FFF", border: "1px solid #334155", fontSize: "12px", width: "120px", outline: "none" }} /><button onClick={() => handleRenameFolderNode(folder.id)} style={{ padding: "2px 6px", backgroundColor: "#10B981", border: "none", color: "#FFF", fontSize: "11px", fontWeight: "bold" }}>Ok</button></div>
                    ) : <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#FFFFFF" }}>{folder.name}</h4>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }} onClick={e => e.stopPropagation()}><button onClick={() => { setEditingFolderId(folder.id); setRenameFolderText(folder.name); }} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }}><Edit2 size={12}/></button><button onClick={() => setShowColorPickerId(showColorPickerId === folder.id ? null : showColorPickerId)} style={{ background: "none", border: "none", color: "#00CFE8", cursor: "pointer" }}><Palette size={12}/></button><button onClick={() => handlePurgeFolderNode(folder.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={12}/></button></div>
              </div>
              {showColorPickerId === folder.id && <div style={{ display: "flex", gap: "6px", backgroundColor: "#0B1224", padding: "6px", borderRadius: "6px", flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>{systemColors.map(c => <div key={c} onClick={() => handleUpdateFolderColorNode(folder.id, c)} style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: c, cursor: "pointer" }} />)}</div>}
              <div style={{ borderTop: "1px dashed #232E48", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#475569", fontWeight: 600 }}><span>Items allocation: {vaultFiles.filter(f => f.folderId === folder.id).length} units</span><span>{folder.date}</span></div>
            </div>
          ))}
          {folders.length === 0 && <div style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: "#475569", border: "1px dashed #232E48", borderRadius: "16px" }}>Bhai, Drive environment registries are empty. Deploy folders parameters node.</div>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredFiles.map(file => (
            <div key={file.id} style={{ backgroundColor: "#141D32", border: "1px solid #232E48", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#0B1224", display: "flex", alignItems: "center", justifyContent: "center", color: file.type === "excel" ? "#10B981" : file.type === "image" ? "#EC4899" : "#60A5FA" }}>
                    <FileText size={18}/>
                  </div>
                  <div style={{ maxWidth: "200px" }}><span style={{ fontSize: "10px", fontWeight: 800, color: "#00CFE8", textTransform: "uppercase" }}>{file.type} format</span><h4 style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={file.title}>{file.title}</h4></div>
                </div>
                <button onClick={() => handlePurgeSingleFileNode(file.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "4px" }}><Trash2 size={13}/></button>
              </div>

              <div style={{ borderTop: "1px solid #232E48", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <small style={{ color: "#475569", fontSize: "11px", fontWeight: 600 }}>Logged: {file.date}</small>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <button onClick={() => setPreviewFile(file)} style={{ background: "none", border: "none", color: "#60A5FA", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}><Eye size={13}/> View File</button>
                  {file.data ? <a href={file.data} download={file.title} style={{ fontSize: "12px", fontWeight: 700, color: "#10B981", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>Download</a> : <span style={{ fontSize: "11px", color: "#475569", fontWeight: 700 }}>Empty Node</span>}
                </div>
              </div>
            </div>
          ))}
          {filteredFiles.length === 0 && <div style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: "#475569", border: "1px dashed #232E48", borderRadius: "14px" }}>Bhai, naye folder parameters empty hain. Click Ingest Document to load files stream asset.</div>}
        </div>
      )}

    </div>
  );
}