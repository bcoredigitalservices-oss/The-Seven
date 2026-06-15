"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Send, 
  Printer, 
  Check, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  User, 
  Lock, 
  FileCheck2,
  Upload,
  X,
  Save,
  LayoutDashboard
} from "lucide-react";

interface ProposalItem {
  id: string;
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  hours?: string;
}

interface ProposalSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
}

export default function ProposalBuilderPage() {
  const { userProfile } = useSevenStore();
  const [docType, setDocType] = useState<"single" | "multi">("single");
  const [docAudience, setDocAudience] = useState<"b2b" | "b2c">("b2b");
  const [docFormat, setDocFormat] = useState<"proposal" | "quote">("proposal");
  
  // Provisioned By Details (Our Company - fully editable)
  const [ourCompanyName, setOurCompanyName] = useState("B-Core Digital Services LLC");
  const [ourCompanyAddress, setOurCompanyAddress] = useState("7 Broad Street, Suite 4100, New York, NY 10004");
  const [ourCompanyEmail, setOurCompanyEmail] = useState("infrastructure@bcore.digital");
  const [ourCompanyTaxId, setOurCompanyTaxId] = useState("EIN Tax: 94-8820371");

  // Client & Info State
  const [clientName, setClientName] = useState("Acme Global Technologies");
  const [clientContact, setClientContact] = useState("Sarah Jenkins (VP of Engineering)");
  const [clientEmail, setClientEmail] = useState("sjenkins@acmeglobal.com");
  const [clientAddress, setClientAddress] = useState("100 Enterprise Way, Suite 400, San Francisco, CA");
  const [clientTaxId, setClientTaxId] = useState("US-94-1234567");
  const [proposalTitle, setProposalTitle] = useState("Enterprise Cloud Infrastructure Modernization");
  
  // Tax & Hours Selectiveness
  const [applyTax, setApplyTax] = useState(false);
  const [taxRate, setTaxRate] = useState(15); // %
  const [showHours, setShowHours] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  const formatCurrency = (amount: number) => {
    if (currency === "INR") {
      return `₹${amount.toLocaleString("en-IN")}`;
    }
    return `$${amount.toLocaleString("en-US")}`;
  };
  
  // Multi-Page Sections
  const [execSummary, setExecSummary] = useState(
    "This proposal outlines our recommended strategy for scaling your application infrastructure. Our solution guarantees 99.99% uptime, reduced latency, and an optimized DevOps deployment pipeline tailored specifically to your enterprise workloads."
  );
  const [scopeOfWork, setScopeOfWork] = useState(
    "1. Architecture Review & Planning\n2. Implementation of Kubernetes Cluster across multi-region AWS setup\n3. Integration of CI/CD Pipeline (GitHub Actions & Terraform)\n4. Security Audit & Pen Testing\n5. 24/7 Monitoring & Post-Launch Support"
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    "Net-30 payment terms. All project milestones require sign-off before proceeding. We retain intellectual property rights until final invoice clearance."
  );

  // Dynamic Custom Binder Sections
  const [sections, setSections] = useState<ProposalSection[]>([
    {
      id: "1",
      title: "1. EXECUTIVE SUMMARY & SOLUTION VISION",
      subtitle: "Solution Vision & Architectural Goals",
      content: "This proposal outlines our recommended strategy for scaling your application infrastructure. Our solution guarantees 99.99% uptime, reduced latency, and an optimized DevOps deployment pipeline tailored specifically to your workloads."
    },
    {
      id: "2",
      title: "2. SCOPE OF SERVICES & KEY DELIVERABLES",
      subtitle: "Scope & Objectives Breakdown",
      content: "1. Architecture Review & Planning\n2. Implementation of Kubernetes Cluster across multi-region AWS setup\n3. Integration of CI/CD Pipeline (GitHub Actions & Terraform)\n4. Security Audit & Pen Testing\n5. 24/7 Monitoring & Post-Launch Support"
    },
    {
      id: "3",
      title: "3. ORGANIZATIONAL CAPABILITIES",
      subtitle: "Enterprise Technical Leadership",
      content: "We leverage cutting edge cloud native protocols, real-time analytics orchestration, and enterprise scale design patterns. Our team represents leadership in cybersecurity hardening and site reliability engineering, ensuring that your organization receives absolute best-in-class product outcomes."
    }
  ]);
  
  // Signatures
  const [signName, setSignName] = useState(userProfile?.full_name || "Dhruv Kumar Dubey");
  const [signTitle, setSignTitle] = useState("Managing Director & Lead Solutions Architect");
  const [isDigitallySigned, setIsDigitallySigned] = useState(true);
  const [signingDate, setSigningDate] = useState(new Date().toLocaleDateString());
  const [docId, setDocId] = useState(() => `BCD-${Math.floor(100000 + Math.random() * 900000)}`);
  
  // Dashboard view and database save states
  const [viewMode, setViewMode] = useState<"builder" | "dashboard">("builder");
  const [savedProposals, setSavedProposals] = useState<any[]>([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  
  // Signature Image Upload
  const [uploadedSignUrl, setUploadedSignUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Items State (No qty/unit price, just name, description, minPrice, maxPrice, hours)
  const [items, setItems] = useState<ProposalItem[]>([
    {
      id: "1",
      name: "Cloud Architecture Design & Orchestration",
      description: "Custom Terraform templates, network segmentation, and multi-region AWS topology plan.",
      minPrice: 8000,
      maxPrice: 9500,
      hours: "40 hrs"
    },
    {
      id: "2",
      name: "Kubernetes Deployment & DevOps Integration",
      description: "Provisioning EKS clusters, load balancers, and Helm deployment scripts.",
      minPrice: 11000,
      maxPrice: 14000,
      hours: "60 hrs"
    },
    {
      id: "3",
      name: "Team Training & Knowledge Transfer",
      description: "Hands-on workshops, system administration guides, and runbook documentation.",
      minPrice: 2000,
      maxPrice: 3000,
      hours: "15 hrs"
    }
  ]);
  
  // Navigation for Multi-page preview
  const [activePreviewPage, setActivePreviewPage] = useState(1);
  
  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info">("success");

  const triggerToast = (msg: string, type: "success" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddItem = () => {
    const newItem: ProposalItem = {
      id: Math.random().toString(),
      name: "",
      description: "",
      minPrice: 0,
      maxPrice: 0,
      hours: ""
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ProposalItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === "minPrice" || field === "maxPrice") {
          return { ...item, [field]: parseFloat(value) || 0 };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Section Handlers
  const handleSectionChange = (id: string, field: keyof ProposalSection, value: string) => {
    setSections(sections.map(sec => sec.id === id ? { ...sec, [field]: value } : sec));
  };

  const handleAddSection = () => {
    setSections([...sections, {
      id: Math.random().toString(),
      title: `Section ${sections.length + 1}`,
      subtitle: "",
      content: ""
    }]);
    triggerToast("New custom section added.");
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(sec => sec.id !== id));
    triggerToast("Custom section removed.", "info");
  };

  // Upload Signature Image
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedSignUrl(reader.result as string);
        triggerToast("Signature image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSignatureImage = () => {
    setUploadedSignUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    triggerToast("Uploaded signature image removed.", "info");
  };

  // Calculations
  const subtotalMin = items.reduce((sum, item) => sum + item.minPrice, 0);
  const subtotalMax = items.reduce((sum, item) => sum + item.maxPrice, 0);
  
  const taxMin = applyTax ? (subtotalMin * taxRate) / 100 : 0;
  const taxMax = applyTax ? (subtotalMax * taxRate) / 100 : 0;

  const [isSending, setIsSending] = useState(false);

  const totalMin = subtotalMin + taxMin;
  const totalMax = subtotalMax + taxMax;

  // Print/PDF Handler
  const handlePrint = () => {
    triggerToast("Preparing document print-ready layouts...", "info");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Send Handler
  const handleSend = async () => {
    setIsSending(true);
    triggerToast("Compiling proposal and sending via email...", "info");
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/proposals/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          client_email: clientEmail,
          client_name: clientName,
          proposal_title: proposalTitle,
          amount_range: applyTax 
            ? `${formatCurrency(totalMin)} - ${formatCurrency(totalMax)}`
            : `${formatCurrency(subtotalMin)} - ${formatCurrency(subtotalMax)}`,
          sender_name: signName,
          sender_title: signTitle,
          terms: termsAndConditions,
          doc_id: docId
        })
      });

      if (res.ok) {
        const data = await res.json();
        triggerToast(data.message || "Proposal sent successfully!");
      } else {
        const err = await res.text();
        triggerToast(`Failed: ${err}`, "info");
      }
    } catch (e: any) {
      console.error(e);
      triggerToast(`Failed to send proposal: ${e.message}`, "info");
    } finally {
      setIsSending(false);
    }
  };

  // Dynamic pdf libraries loader helper (html2canvas-pro supports OKLCH colors used in Tailwind CSS v4)
  const loadPdfLibraries = () => {
    return new Promise<{ html2canvas: any, jsPDF: any }>((resolve) => {
      const loadJsPDF = () => {
        if ((window as any).jspdf) {
          resolve({
            html2canvas: (window as any).html2canvas,
            jsPDF: (window as any).jspdf.jsPDF
          });
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.onload = () => {
          resolve({
            html2canvas: (window as any).html2canvas,
            jsPDF: (window as any).jspdf.jsPDF
          });
        };
        document.body.appendChild(script);
      };

      if ((window as any).html2canvas) {
        loadJsPDF();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js";
      script.onload = () => {
        loadJsPDF();
      };
      document.body.appendChild(script);
    });
  };

  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);

  // WhatsApp Share Handler
  const handleShareWhatsApp = async () => {
    setIsSharingWhatsApp(true);
    triggerToast("Generating high-fidelity PDF document...", "info");
    try {
      const { html2canvas, jsPDF } = await loadPdfLibraries();
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const capturePage = async (pageId: string) => {
        const pageElement = document.getElementById(pageId);
        if (!pageElement) return null;
        
        const canvas = await html2canvas(pageElement, {
          scale: 2.0, // High-quality print output resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false
        });
        
        return canvas.toDataURL("image/jpeg", 0.95);
      };

      let pdfBlob: Blob;
      const pdfFileName = `${docId}_proposal.pdf`;

      if (docType === "single") {
        const img = await capturePage("pdf-page-1");
        if (!img) throw new Error("Could not render document layout.");
        pdf.addImage(img, "JPEG", 0, 0, 210, 297);
        pdfBlob = pdf.output("blob");
      } else {
        // Capture Page 1: Cover / Summary
        const img1 = await capturePage("pdf-page-1");
        if (!img1) throw new Error("Could not render Cover Page.");
        pdf.addImage(img1, "JPEG", 0, 0, 210, 297);

        // Capture Page 2: Scope
        const img2 = await capturePage("pdf-page-2");
        if (img2) {
          pdf.addPage();
          pdf.addImage(img2, "JPEG", 0, 0, 210, 297);
        }

        // Capture Page 3: Financials
        const img3 = await capturePage("pdf-page-3");
        if (img3) {
          pdf.addPage();
          pdf.addImage(img3, "JPEG", 0, 0, 210, 297);
        }

        pdfBlob = pdf.output("blob");
      }

      // Upload the PDF blob to the backend sharing gateway
      triggerToast("Uploading PDF to sharing gateway...", "info");
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", pdfBlob, pdfFileName);
        const uploadRes = await fetch(`/api/v1/proposals/upload?doc_id=${docId}`, {
          method: "POST",
          body: uploadFormData,
        });
        if (!uploadRes.ok) {
          console.warn("Upload to sharing gateway failed, proceeding with local file fallback.");
        }
      } catch (uploadErr) {
        console.error("Failed uploading PDF to server:", uploadErr);
      }

      const shareLink = `${window.location.origin}/api/v1/proposals/share/${docId}`;

      // Check if browser has native file sharing capability (typically mobile/tablet)
      if (navigator.share && navigator.canShare) {
        const file = new File([pdfBlob], pdfFileName, { type: "application/pdf" });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${docFormat === "proposal" ? "Business Proposal" : "Cost Quote"} - ${proposalTitle}`,
            text: `Please review the formal document ${docId} from B-Core Digital Services.`
          });
          triggerToast("Shared successfully!");
          return;
        }
      }

      // Desktop fallback: Redirect to WhatsApp Web with a direct link
      triggerToast("Opening WhatsApp...", "info");
      
      const totalText = applyTax 
        ? `${formatCurrency(totalMin)} - ${formatCurrency(totalMax)}`
        : `${formatCurrency(subtotalMin)} - ${formatCurrency(subtotalMax)}`;
      
      const text = `*B-Core Digital Services*\n*Proposal Title:* ${proposalTitle}\n*Ref:* ${docId}\n*Client:* ${clientName}\n*Estimated Range:* ${totalText}\n*Representative:* ${signName} (${signTitle})\n\n📄 *Direct PDF Link:* ${shareLink}`;
      const encodedText = encodeURIComponent(text);
      const url = `https://wa.me/?text=${encodedText}`;
      window.open(url, "_blank");
    } catch (error: any) {
      console.error("PDF generation/sharing failed:", error);
      triggerToast(`Failed to share PDF: ${error.message}`, "info");
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  const handleSave = async () => {
    setIsSavingDoc(true);
    triggerToast("Saving proposal data to database...", "info");
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          doc_id: docId,
          doc_type: docType,
          doc_format: docFormat,
          proposal_title: proposalTitle,
          client_name: clientName,
          client_contact: clientContact,
          client_email: clientEmail,
          client_address: clientAddress,
          our_company_name: ourCompanyName,
          our_company_address: ourCompanyAddress,
          our_company_email: ourCompanyEmail,
          our_company_tax_id: ourCompanyTaxId,
          currency: currency,
          show_timeline: showHours,
          apply_tax: applyTax,
          tax_percent: taxRate,
          sign_name: signName,
          sign_title: signTitle,
          sign_image: uploadedSignUrl,
          sections: sections,
          services: items
        })
      });

      if (res.ok) {
        triggerToast("Proposal saved to database successfully!");
      } else {
        const err = await res.text();
        triggerToast(`Failed to save: ${err}`, "info");
      }
    } catch (e: any) {
      console.error(e);
      triggerToast(`Error: ${e.message}`, "info");
    } finally {
      setIsSavingDoc(false);
    }
  };

  const fetchSavedProposals = async () => {
    setIsLoadingProposals(true);
    try {
      const token = localStorage.getItem("seven_token");
      const res = await fetch("/api/v1/proposals", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedProposals(data);
      } else {
        triggerToast("Failed to fetch saved proposals.", "info");
      }
    } catch (e: any) {
      console.error(e);
      triggerToast(`Error: ${e.message}`, "info");
    } finally {
      setIsLoadingProposals(false);
    }
  };

  const toggleViewMode = () => {
    if (viewMode === "builder") {
      setViewMode("dashboard");
      fetchSavedProposals();
    } else {
      setViewMode("builder");
    }
  };

  const handleLoadProposal = (prop: any) => {
    setDocId(prop.doc_id);
    setDocType(prop.doc_type || "single");
    setDocFormat(prop.doc_format || "proposal");
    setProposalTitle(prop.proposal_title || "");
    setClientName(prop.client_name || "");
    setClientContact(prop.client_contact || "");
    setClientEmail(prop.client_email || "");
    setClientAddress(prop.client_address || "");
    setOurCompanyName(prop.our_company_name || "B-Core Digital Services LLC");
    setOurCompanyAddress(prop.our_company_address || "");
    setOurCompanyEmail(prop.our_company_email || "");
    setOurCompanyTaxId(prop.our_company_tax_id || "");
    setCurrency(prop.currency || "USD");
    setShowHours(prop.show_timeline ?? false);
    setApplyTax(prop.apply_tax ?? false);
    setTaxRate(prop.tax_percent ?? 18.0);
    setSignName(prop.sign_name || "");
    setSignTitle(prop.sign_title || "");
    setUploadedSignUrl(prop.sign_image || null);
    if (prop.sections) {
      setSections(prop.sections);
    }
    if (prop.services) {
      setItems(prop.services);
    }
    setViewMode("builder");
    triggerToast(`Loaded document ${prop.doc_id} into builder.`);
  };

  // Reset Handler
  const handleReset = () => {
    setOurCompanyName("B-Core Digital Services LLC");
    setOurCompanyAddress("7 Broad Street, Suite 4100, New York, NY 10004");
    setOurCompanyEmail("infrastructure@bcore.digital");
    setOurCompanyTaxId("EIN Tax: 94-8820371");

    setClientName("Acme Global Technologies");
    setClientContact("Sarah Jenkins (VP of Engineering)");
    setClientEmail("sjenkins@acmeglobal.com");
    setClientAddress("100 Enterprise Way, Suite 400, San Francisco, CA");
    setClientTaxId("US-94-1234567");
    setProposalTitle("Enterprise Cloud Infrastructure Modernization");
    setApplyTax(false);
    setTaxRate(15);
    setUploadedSignUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setItems([
      {
        id: "1",
        name: "Cloud Architecture Design & Orchestration",
        description: "Custom Terraform templates, network segmentation, and multi-region AWS topology plan.",
        minPrice: 8000,
        maxPrice: 9500
      }
    ]);
    triggerToast("Builder forms reset to defaults.", "info");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Print-specific style layout block */}
      <style jsx="true" global="true">{`
        @media print {
          /* Hide all default layout wrappers */
          body, html, main, #__next, .min-h-screen, .flex-1 {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }
          
          /* Hide sidebar layout completely */
          aside, nav, header {
            display: none !important;
          }
          
          /* Hide configurator, header controls, and other non-print details */
          .no-print {
            display: none !important;
          }
          
          /* Set printable container full page */
          .print-full-page {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            display: block !important;
            overflow: visible !important;
            z-index: 9999999 !important;
          }
          
          #printable-document {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            page-break-after: always;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-zinc-950 border border-emerald-500/30 text-emerald-400 px-5 py-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] max-w-sm font-mono text-xs animate-in slide-in-from-right-4 duration-300">
          <FileCheck2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <p className="flex-1 leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800/80 pb-4 gap-4 no-print">
        <div>
          <p className="text-[10px] font-mono text-amber-400 tracking-[0.2em] uppercase">BUSINESS ENGINE</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1 flex items-center">
            <FileText className="w-6 h-6 mr-2.5 text-amber-400" />
            PROPOSAL & QUOTE BUILDER
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleViewMode}
            className="flex items-center space-x-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono hover:bg-zinc-850 hover:text-white transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{viewMode === "builder" ? "Saved Docs Dashboard" : "Back to Builder"}</span>
          </button>

          {viewMode === "builder" && (
            <>
              <button 
                onClick={handleSave}
                disabled={isSavingDoc}
                className="flex items-center space-x-2 px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono hover:bg-amber-500 hover:text-black transition-all disabled:opacity-50"
              >
                {isSavingDoc ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save</span>
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center space-x-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono hover:bg-zinc-850 hover:text-white transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center space-x-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-[#00E5FF] text-xs font-mono hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/30 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
              <button 
                onClick={handleShareWhatsApp}
                className="flex items-center space-x-2 px-3 py-1.5 rounded bg-emerald-600/10 border border-emerald-600/30 text-emerald-400 text-xs font-mono hover:bg-emerald-600 hover:text-white transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.473 1.452 5.372 1.453 5.485 0 9.948-4.469 9.952-9.959.002-2.661-1.034-5.163-2.917-7.049C17.17 1.764 14.673.727 12.01.727c-5.487 0-9.95 4.469-9.954 9.96-.001 2.056.536 4.062 1.554 5.823l-.99 3.616 3.703-.972zm11.233-6.666c-.302-.152-1.79-.882-2.072-.984-.282-.102-.487-.152-.691.152-.204.304-.79.984-.97 1.186-.18.203-.359.228-.661.076-.302-.152-1.274-.469-2.427-1.496-.897-.8-1.502-1.787-1.678-2.09-.176-.304-.019-.468.132-.619.136-.136.302-.353.454-.53.151-.177.202-.303.303-.505.101-.202.05-.379-.025-.531-.076-.152-.691-1.666-.947-2.278-.25-.601-.524-.52-.69-.526-.158-.005-.339-.006-.52-.006-.18 0-.474.067-.722.339-.248.272-.947.926-.947 2.26 0 1.333.972 2.624 1.107 2.806.136.18 1.912 2.919 4.631 4.095.647.28 1.152.447 1.545.572.651.207 1.243.178 1.71.109.522-.078 1.791-.733 2.043-1.442.252-.709.252-1.316.176-1.442-.076-.127-.282-.203-.584-.356z"/>
                </svg>
                <span>WhatsApp</span>
              </button>
              <button 
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center space-x-2 px-4 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono hover:bg-amber-500 hover:text-black transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isSending ? "Sending..." : "Send to Client"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Workspace grid */}
      {viewMode === "dashboard" ? (
        <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-6 space-y-6 flex-1 flex flex-col min-h-0 overflow-y-auto no-print">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-bold font-mono tracking-wider text-white">SAVED DOCUMENT DIRECTORY</h2>
              <p className="text-xs text-zinc-500 font-mono mt-1">Access and load previously finalized quotes or proposals</p>
            </div>
            <div className="text-[10px] font-mono text-zinc-450 bg-zinc-950 px-3 py-1.5 rounded border border-zinc-800">
              Total Records: {savedProposals.length}
            </div>
          </div>

          {isLoadingProposals ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-12">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-zinc-500 font-mono text-xs">Loading proposal data...</p>
            </div>
          ) : savedProposals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
              <FileText className="w-12 h-12 text-zinc-700" />
              <p className="text-zinc-500 font-mono text-sm">No saved documents found in the database.</p>
              <button 
                onClick={() => setViewMode("builder")}
                className="px-4 py-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono hover:bg-amber-500 hover:text-black transition-all"
              >
                Create First Proposal
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Document Title</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Created At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {savedProposals.map((prop) => (
                    <tr key={prop.doc_id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-amber-400">{prop.doc_id}</td>
                      <td className="py-4 px-4 text-zinc-250 truncate max-w-[200px]">{prop.proposal_title}</td>
                      <td className="py-4 px-4 text-zinc-400">
                        <div>{prop.client_name || "—"}</div>
                        <div className="text-[10px] text-zinc-600">{prop.client_email || "—"}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${prop.doc_format === "quote" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}>
                          {prop.doc_format}
                        </span>
                        <span className="text-[10px] text-zinc-500 ml-2 uppercase">({prop.doc_type})</span>
                      </td>
                      <td className="py-4 px-4 text-zinc-500">
                        {new Date(prop.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2.5">
                          <button 
                            onClick={() => handleLoadProposal(prop)}
                            className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition-all"
                          >
                            Load
                          </button>
                          <a 
                            href={`/api/v1/proposals/share/${prop.doc_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-750 hover:text-white transition-all text-center"
                          >
                            View PDF
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-0 overflow-y-auto xl:overflow-hidden pb-4">
        
        {/* Left Side: Configurator Fields */}
        <div className="flex flex-col space-y-6 overflow-y-auto custom-scrollbar xl:pr-1 min-h-0 no-print">
          
          {/* Section 1: Template Type Selector */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase border-b border-zinc-850 pb-2 flex items-center justify-between">
              <span>DOCUMENT CONFIGURATION</span>
              <span className="text-[10px] text-zinc-500 normal-case font-normal">Format rules & templates</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Page Length</label>
                <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-xs">
                  <button 
                    onClick={() => { setDocType("single"); setActivePreviewPage(1); }}
                    className={`py-1.5 rounded transition-all ${docType === "single" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Single-Page
                  </button>
                  <button 
                    onClick={() => { setDocType("multi"); setActivePreviewPage(1); }}
                    className={`py-1.5 rounded transition-all ${docType === "multi" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Multi-Page
                  </button>
                </div>
              </div>

              {/* Audience */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Audience Type</label>
                <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-xs">
                  <button 
                    onClick={() => setDocAudience("b2b")}
                    className={`py-1.5 rounded transition-all ${docAudience === "b2b" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    B2B Format
                  </button>
                  <button 
                    onClick={() => setDocAudience("b2c")}
                    className={`py-1.5 rounded transition-all ${docAudience === "b2c" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    B2C Format
                  </button>
                </div>
              </div>

              {/* Format */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Document Objective</label>
                <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-xs">
                  <button 
                    onClick={() => setDocFormat("proposal")}
                    className={`py-1.5 rounded transition-all ${docFormat === "proposal" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Proposal
                  </button>
                  <button 
                    onClick={() => setDocFormat("quote")}
                    className={`py-1.5 rounded transition-all ${docFormat === "quote" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Quote
                  </button>
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Currency</label>
                <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-xs">
                  <button 
                    onClick={() => setCurrency("USD")}
                    className={`py-1.5 rounded transition-all ${currency === "USD" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    USD ($)
                  </button>
                  <button 
                    onClick={() => setCurrency("INR")}
                    className={`py-1.5 rounded transition-all ${currency === "INR" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Provisioner Details (Editable company details) */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase border-b border-zinc-850 pb-2.5 flex items-center justify-between">
              <span>PROVISIONED BY DETAILS (OUR COMPANY)</span>
              <Building2 className="w-3.5 h-3.5 text-zinc-500" />
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Company Name</label>
                  <input 
                    type="text" 
                    value={ourCompanyName} 
                    onChange={e => setOurCompanyName(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Company Tax / Registry ID</label>
                  <input 
                    type="text" 
                    value={ourCompanyTaxId} 
                    onChange={e => setOurCompanyTaxId(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Contact Email</label>
                  <input 
                    type="text" 
                    value={ourCompanyEmail} 
                    onChange={e => setOurCompanyEmail(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Office Address</label>
                  <input 
                    type="text" 
                    value={ourCompanyAddress} 
                    onChange={e => setOurCompanyAddress(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Client & Project Details */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase border-b border-zinc-850 pb-2.5 flex items-center justify-between">
              <span>RECIPIENT & CONTEXT</span>
              <User className="w-3.5 h-3.5 text-zinc-500" />
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Proposal/Quote Title</label>
                  <input 
                    type="text" 
                    value={proposalTitle} 
                    onChange={e => setProposalTitle(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Client Company / Entity Name</label>
                  <input 
                    type="text" 
                    value={clientName} 
                    onChange={e => setClientName(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Client Contact Person</label>
                  <input 
                    type="text" 
                    value={clientContact} 
                    onChange={e => setClientContact(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Client Email Address</label>
                  <input 
                    type="email" 
                    value={clientEmail} 
                    onChange={e => setClientEmail(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Client Office Address</label>
                  <input 
                    type="text" 
                    value={clientAddress} 
                    onChange={e => setClientAddress(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Client Tax Registry ID</label>
                  <input 
                    type="text" 
                    disabled={docAudience === "b2c"} 
                    placeholder="B2C (N/A)"
                    value={docAudience === "b2b" ? clientTaxId : ""} 
                    onChange={e => setClientTaxId(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Scope & Descriptions (Multi-Page only) */}
          {docType === "multi" && (
            <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
              <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase border-b border-zinc-850 pb-2.5 flex items-center justify-between">
                <span>PROPOSAL BINDER SECTIONS</span>
                <button 
                  onClick={handleAddSection}
                  className="flex items-center space-x-1.5 px-2 py-1 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono hover:bg-amber-400 hover:text-black transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Section</span>
                </button>
              </h3>

              <div className="space-y-4">
                {sections.map((sec, idx) => (
                  <div key={sec.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-900 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-mono">SECTION #{idx + 1}</span>
                      <button 
                        onClick={() => handleRemoveSection(sec.id)} 
                        className="text-[#ff1744]/75 hover:text-[#ff1744] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Heading / Title</label>
                          <input 
                            type="text" 
                            value={sec.title} 
                            onChange={e => handleSectionChange(sec.id, "title", e.target.value)} 
                            className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Subheading / Subtitle</label>
                          <input 
                            type="text" 
                            placeholder="Optional subheading..."
                            value={sec.subtitle || ""} 
                            onChange={e => handleSectionChange(sec.id, "subtitle", e.target.value)} 
                            className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Paragraph Content</label>
                        <textarea 
                          value={sec.content} 
                          rows={4}
                          onChange={e => handleSectionChange(sec.id, "content", e.target.value)} 
                          className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Line Items Table (Pricing - Services & Chargeable Ranges) */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase border-b border-zinc-850 pb-2.5 flex items-center justify-between">
              <span>SERVICES & CHARGEABLE RANGES</span>
              <button 
                onClick={handleAddItem}
                className="flex items-center space-x-1.5 px-2 py-1 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-mono hover:bg-[#00E5FF] hover:text-black transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Add Service</span>
              </button>
            </h3>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-900 space-y-2 relative font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">SERVICE ITEM #{idx + 1}</span>
                    <button 
                      onClick={() => handleRemoveItem(item.id)} 
                      disabled={items.length <= 1}
                      className="text-[#ff1744]/75 hover:text-[#ff1744] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className={`grid grid-cols-1 ${showHours ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-2`}>
                    <input 
                      type="text" 
                      placeholder="Service Name"
                      value={item.name} 
                      onChange={e => handleItemChange(item.id, "name", e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    {showHours && (
                      <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5">
                        <span className="text-[9px] text-zinc-550 uppercase">Hrs</span>
                        <input 
                          type="text" 
                          placeholder="e.g. 40 hrs"
                          value={item.hours || ""} 
                          onChange={e => handleItemChange(item.id, "hours", e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-xs text-white font-bold"
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5">
                      <span className="text-[10px] text-zinc-500">MIN ($)</span>
                      <input 
                        type="number" 
                        min="0"
                        value={item.minPrice} 
                        onChange={e => handleItemChange(item.id, "minPrice", e.target.value)}
                        className="w-full bg-transparent border-none text-right outline-none text-xs text-white font-bold"
                      />
                    </div>
                    <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5">
                      <span className="text-[10px] text-zinc-500">MAX ($)</span>
                      <input 
                        type="number" 
                        min="0"
                        value={item.maxPrice} 
                        onChange={e => handleItemChange(item.id, "maxPrice", e.target.value)}
                        className="w-full bg-transparent border-none text-right outline-none text-xs text-white font-bold"
                      />
                    </div>
                  </div>
                  
                  <input 
                    type="text" 
                    placeholder="Short description of service deliverables..."
                    value={item.description} 
                    onChange={e => handleItemChange(item.id, "description", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1 text-[11px] text-zinc-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              ))}

              {/* Tax & Hours Toggle & Calculations */}
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-900 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="apply-tax-checkbox"
                      checked={applyTax} 
                      onChange={e => setApplyTax(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <label htmlFor="apply-tax-checkbox" className="text-zinc-400 cursor-pointer">Apply Selective Tax Rate</label>
                  </div>
                  {applyTax && (
                    <div className="flex items-center space-x-2">
                      <span className="text-zinc-500 text-[9px] tracking-wider">TAX RATE (%)</span>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={taxRate}
                        onChange={e => setTaxRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-12 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-center text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="show-hours-checkbox"
                      checked={showHours} 
                      onChange={e => setShowHours(e.target.checked)}
                      className="rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <label htmlFor="show-hours-checkbox" className="text-zinc-400 cursor-pointer">Include Hours/Timeline Column</label>
                  </div>
                </div>

                <div className="space-y-1 text-right border-t border-zinc-900 pt-2">
                  <p className="text-zinc-500">Subtotal Range: <span className="text-zinc-300 font-bold">{formatCurrency(subtotalMin)} - {formatCurrency(subtotalMax)}</span></p>
                  {applyTax && (
                    <p className="text-zinc-500">VAT/Tax ({taxRate}%): <span className="text-zinc-300 font-bold">{formatCurrency(taxMin)} - {formatCurrency(taxMax)}</span></p>
                  )}
                  <p className="text-amber-400 font-bold text-sm">
                    Estimated Total Range: {formatCurrency(totalMin)} - {formatCurrency(totalMax)}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Section 6: Representative Details, Digital Signature Image & Terms */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase border-b border-zinc-850 pb-2.5 flex items-center justify-between">
              <span>AUTHORIZED SIGNATURE & TERMS</span>
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Representative Name</label>
                  <input 
                    type="text" 
                    value={signName} 
                    onChange={e => setSignName(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Representative Title</label>
                  <input 
                    type="text" 
                    value={signTitle} 
                    onChange={e => setSignTitle(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Terms and services section form */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Terms & Services Section</label>
                <textarea 
                  value={termsAndConditions} 
                  rows={3}
                  onChange={e => setTermsAndConditions(e.target.value)} 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-400"
                  placeholder="Net-30 payment terms, milestones guidelines etc..."
                />
              </div>

              {/* Digital signature upload form item */}
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-900 space-y-3 font-mono text-xs">
                <p className="font-bold text-zinc-200 uppercase tracking-wider text-[10px]">Digital Signature Graphic</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[9px] text-zinc-500">Upload a picture of your handwritten signature to stamp on the document.</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    {uploadedSignUrl ? (
                      <div className="flex items-center space-x-2 border border-zinc-800 bg-zinc-900 p-1.5 rounded">
                        <img src={uploadedSignUrl} alt="Uploaded Sign" className="h-6 max-w-[100px] object-contain bg-white rounded p-0.5" />
                        <button 
                          onClick={handleRemoveSignatureImage}
                          className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Sign</span>
                      </button>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleSignatureUpload}
                      accept="image/*"
                      className="hidden" 
                    />
                  </div>
                </div>
              </div>


            </div>
          </div>

        </div>

        {/* Right Side: Professional High-Fidelity Preview Panel */}
        <div className="flex flex-col h-full min-h-[500px] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden relative">
          
          {/* Preview Header controls */}
          <div className="bg-[#111] px-5 py-3 border-b border-zinc-800 flex justify-between items-center font-mono text-xs select-none no-print">
            <span className="font-bold text-[#00E5FF] uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-ping" />
              Live Preview Screen
            </span>
            
            {docType === "multi" && (
              <div className="flex items-center space-x-3 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
                <button 
                  onClick={() => setActivePreviewPage(p => Math.max(1, p - 1))}
                  disabled={activePreviewPage === 1}
                  className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px]">Page {activePreviewPage} of 3</span>
                <button 
                  onClick={() => setActivePreviewPage(p => Math.min(3, p + 1))}
                  disabled={activePreviewPage === 3}
                  className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-1 bg-zinc-950 p-0.5 rounded border border-zinc-800 text-[9px] text-zinc-500">
              <span className="px-2 py-0.5 bg-zinc-900 text-white rounded font-bold uppercase">{docAudience}</span>
              <span className="px-2 py-0.5 uppercase">{docFormat}</span>
            </div>
          </div>

          {/* Actual physical page simulation wrapper */}
          <div className="flex-1 overflow-y-auto p-8 bg-zinc-950/40 flex justify-center custom-scrollbar print-full-page">
            
             {/* Styled Sheet document to match standard printed forms */}
            <div 
              id="printable-document"
              className="w-full max-w-[620px] bg-white text-zinc-900 p-8 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.6)] min-h-[792px] flex flex-col justify-between relative rounded-sm font-sans overflow-hidden"
              style={{
                fontSize: "12px",
                lineHeight: "1.5"
              }}
            >
              
              {/* Subtle watermark background for multi-page cover */}
              {docType === "multi" && activePreviewPage === 1 && (
                <div className="absolute inset-0 bg-[linear-gradient(rgba(10,26,92,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(10,26,92,0.02)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30 pointer-events-none" />
              )}

              {/* Global Subtle Watermark of B-Core logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0">
                <img 
                  src="/bcore1.png" 
                  alt="Watermark" 
                  className="w-4/5 max-w-[400px] object-contain grayscale" 
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png";
                  }}
                />
              </div>

              {/* Document Pages Container */}
              <div className="flex-1 flex flex-col z-10 relative">
                
                {/* ── Page 1 Content (Cover if Multi-page, Full Doc if Single-page) ── */}
                {((docType === "single") || (docType === "multi" && activePreviewPage === 1)) && (
                  <>
                    {/* Header: B-Core Uploaded Logo & Corporate Metadata */}
                    <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                      <div className="flex items-center">
                        {/* Render uploaded company logo */}
                        <img 
                          src="/bcore1.png" 
                          alt="B-Core Digital" 
                          className="h-36 md:h-44 max-w-[340px] w-auto object-contain block shrink-0 -my-12 -ml-8" 
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.src = "/logo.png";
                          }}
                        />
                      </div>
                      <div className="text-right font-mono text-[9px] text-zinc-500 leading-tight space-y-0.5">
                        <p className="font-bold text-zinc-800 uppercase tracking-widest text-[10px]">
                          {docFormat === "proposal" ? "BUSINESS PROPOSAL" : "FORMAL COST QUOTE"}
                        </p>
                        <p>REF: {docId}</p>
                        <p>DATE: {signingDate}</p>
                        <p>STATUS: CONFIDENTIAL</p>
                      </div>
                    </div>

                    {/* Meta info columns */}
                    <div className="grid grid-cols-2 gap-6 mt-4 pb-4 border-b border-zinc-100">
                      <div>
                        <p className="text-[9px] font-bold text-[#0a1a5c] uppercase tracking-wider mb-1">PROVISIONED BY:</p>
                        <p className="font-bold text-zinc-800">{ourCompanyName}</p>
                        <p className="text-zinc-500 text-[10px] leading-relaxed">
                          {ourCompanyAddress}<br />
                          {ourCompanyEmail}<br />
                          {ourCompanyTaxId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-[#0a1a5c] uppercase tracking-wider mb-1">PREPARED FOR:</p>
                        <p className="font-bold text-zinc-800">{clientName}</p>
                        <p className="text-zinc-500 text-[10px] leading-relaxed">
                          {clientContact}<br />
                          {clientAddress}<br />
                          {clientEmail}<br />
                          {docAudience === "b2b" && clientTaxId && (
                            <span className="font-mono text-[9px]">Tax ID: {clientTaxId}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Professional Proposal Title Banner */}
                    <div className="my-4 bg-[#0a1a5c] text-white p-4 rounded shadow-sm text-center">
                      <h2 className="text-sm md:text-base font-bold tracking-wider uppercase m-0 leading-normal">{proposalTitle}</h2>
                    </div>

                    {/* Single-Page: Render Item Table right here */}
                    {docType === "single" && (
                      <div className="space-y-6">
                        <p className="text-[10px] text-zinc-500 italic">
                          We are pleased to submit the following cost estimate and service deliverables breakdown for the project referenced above. Prices listed are estimated ranges.
                        </p>
                        
                        {/* Cost Breakdown Table (No Qty & Unit Price - aligned as requested) */}
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b-2 border-zinc-200 text-[#0a1a5c] text-[10px] font-bold uppercase tracking-wider">
                              <th className="py-2">Deliverable / Services</th>
                              {showHours && <th className="py-2 text-center w-24">Est. Hours</th>}
                              <th className="py-2 text-right">Chargeable Range</th>
                            </tr>
                          </thead>
                          <tbody className="text-[11px] divide-y divide-zinc-100">
                            {items.map(item => (
                              <tr key={item.id} className="hover:bg-zinc-50/50">
                                <td className="py-2.5 pr-4">
                                  <div className="font-semibold text-zinc-800">{item.name || "Untitled Service"}</div>
                                  {item.description && <div className="text-zinc-500 text-[10px] font-normal leading-normal">{item.description}</div>}
                                </td>
                                {showHours && (
                                  <td className="py-2.5 text-center font-mono text-zinc-700">
                                    {item.hours || "—"}
                                  </td>
                                )}
                                <td className="py-2.5 text-right font-mono font-bold text-zinc-800">
                                  {formatCurrency(item.minPrice)} - {formatCurrency(item.maxPrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Totals panel */}
                        <div className="flex justify-end pt-3">
                          <div className="w-72 font-mono text-[11px] space-y-1.5 border-t border-zinc-200 pt-3">
                            {applyTax ? (
                              <>
                                <div className="flex justify-between text-zinc-500">
                                  <span>SUBTOTAL RANGE:</span>
                                  <span className="font-bold text-zinc-700">{formatCurrency(subtotalMin)} - {formatCurrency(subtotalMax)}</span>
                                </div>
                                <div className="flex justify-between text-zinc-500">
                                  <span>ESTIMATED TAX ({taxRate}%):</span>
                                  <span className="font-bold text-zinc-700">{formatCurrency(taxMin)} - {formatCurrency(taxMax)}</span>
                                </div>
                                <div className="flex justify-between text-[#0a1a5c] font-bold border-t border-zinc-200 pt-1.5 text-xs">
                                  <span>ESTIMATED TOTAL:</span>
                                  <span>{formatCurrency(totalMin)} - {formatCurrency(totalMax)}</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex justify-between text-[#0a1a5c] font-bold border-t border-zinc-200 pt-1.5 text-xs">
                                <span>ESTIMATED TOTAL:</span>
                                <span>{formatCurrency(subtotalMin)} - {formatCurrency(subtotalMax)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Multi-Page cover additionals */}
                    {docType === "multi" && (
                      <div className="mt-8 space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-[#0a1a5c] uppercase font-mono tracking-wider">PROJECT EXECUTIVE SUMMARY</h4>
                          <p className="text-zinc-650 leading-relaxed text-[11px]">{execSummary}</p>
                        </div>
                        <div className="border-t border-zinc-200 pt-4 mt-auto flex justify-between items-end">
                          <div className="font-mono text-[9px] text-zinc-400">
                            <span>Confidential // Reference: {docId}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-700">Page 1 of 3 (Cover)</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── Page 2 Content (Multi-page only: Scope & Details) ── */}
                {docType === "multi" && activePreviewPage === 2 && (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Page Header */}
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-3 mb-6">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">SCOPE & OBJECTIVES // {docId}</span>
                        <img src="/bcore1.png" alt="B-Core Logo" className="h-16 w-auto object-contain -my-4 -mr-4" onError={e => e.currentTarget.src = "/logo.png"} />
                      </div>

                      <div className="space-y-6">
                        {sections.map((sec) => (
                          <div key={sec.id} className="space-y-2.5">
                            <h3 className="text-xs font-bold text-[#0a1a5c] uppercase font-mono tracking-widest border-b border-zinc-100 pb-1">
                              {sec.title}
                            </h3>
                            {sec.subtitle && (
                              <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider -mt-1.5 font-mono">
                                {sec.subtitle}
                              </p>
                            )}
                            <p className="text-zinc-650 leading-relaxed text-[11px] whitespace-pre-line">
                              {sec.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Page Footer */}
                    <div className="border-t border-zinc-200 pt-4 mt-auto flex justify-between items-center font-mono text-[9px] text-zinc-400">
                      <span>Confidential // Reference: {docId}</span>
                      <span className="text-right text-[10px] font-bold text-zinc-700">Page 2 of 3</span>
                    </div>
                  </div>
                )}

                {/* ── Page 3 Content (Multi-page only: Pricing & Terms) ── */}
                {docType === "multi" && activePreviewPage === 3 && (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Page Header */}
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-3 mb-6">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">COST ESTIMATION & SIGN-OFF // {docId}</span>
                        <img src="/bcore1.png" alt="B-Core Logo" className="h-16 w-auto object-contain -my-4 -mr-4" onError={e => e.currentTarget.src = "/logo.png"} />
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-2.5">
                          <h3 className="text-xs font-bold text-[#0a1a5c] uppercase font-mono tracking-widest border-b border-zinc-100 pb-1">
                            4. SERVICES & FINANCIAL BREAKDOWN
                          </h3>
                          <p className="text-zinc-500 text-[10px] italic">
                            All cost details specified below are estimated chargeable ranges in {currency}.
                          </p>
                          
                          {/* Cost Table (Aligned range format) */}
                          <table className="w-full border-collapse text-left mt-2">
                            <thead>
                              <tr className="border-b border-zinc-200 text-[#0a1a5c] text-[10px] font-bold uppercase tracking-wider">
                                <th className="py-2">Item Description</th>
                                {showHours && <th className="py-2 text-center w-24">Est. Hours</th>}
                                <th className="py-2 text-right">Chargeable Range</th>
                              </tr>
                            </thead>
                            <tbody className="text-[11px] divide-y divide-zinc-100">
                              {items.map(item => (
                                <tr key={item.id} className="hover:bg-zinc-50/50">
                                  <td className="py-2.5 pr-4">
                                    <div className="font-semibold text-zinc-800">{item.name || "Untitled Service"}</div>
                                    {item.description && <div className="text-zinc-500 text-[9px] font-normal leading-normal">{item.description}</div>}
                                  </td>
                                  {showHours && (
                                    <td className="py-2.5 text-center font-mono text-zinc-700">
                                      {item.hours || "—"}
                                    </td>
                                  )}
                                  <td className="py-2.5 text-right font-mono font-bold text-zinc-800">
                                    {formatCurrency(item.minPrice)} - {formatCurrency(item.maxPrice)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Totals panel */}
                          <div className="flex justify-end pt-2">
                            <div className="w-72 font-mono text-[10px] space-y-1 border-t border-zinc-200 pt-2">
                              {applyTax ? (
                                <>
                                  <div className="flex justify-between text-zinc-500">
                                    <span>SUBTOTAL RANGE:</span>
                                    <span className="font-bold text-zinc-700">{formatCurrency(subtotalMin)} - {formatCurrency(subtotalMax)}</span>
                                  </div>
                                  <div className="flex justify-between text-zinc-500">
                                    <span>TAX/VAT ({taxRate}%):</span>
                                    <span className="font-bold text-zinc-700">{formatCurrency(taxMin)} - {formatCurrency(taxMax)}</span>
                                  </div>
                                  <div className="flex justify-between text-[#0a1a5c] font-bold border-t border-zinc-200 pt-1 text-xs">
                                    <span>TOTAL QUOTE:</span>
                                    <span>{formatCurrency(totalMin)} - {formatCurrency(totalMax)}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex justify-between text-[#0a1a5c] font-bold border-t border-zinc-200 pt-1 text-xs">
                                  <span>TOTAL ESTIMATE:</span>
                                  <span>{formatCurrency(subtotalMin)} - {formatCurrency(subtotalMax)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Page Footer */}
                    <div className="border-t border-zinc-200 pt-4 mt-auto">
                      <div className="flex justify-between items-center font-mono text-[9px] text-zinc-400">
                        <span>Confidential // Reference: {docId}</span>
                        <span className="text-right text-[10px] font-bold text-zinc-700 font-sans">Page 3 of 3</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* ── Bottom Section: Terms & Signatures (Always bottom of Single-page OR Page 3 of Multi-page) ── */}
              {((docType === "single") || (docType === "multi" && activePreviewPage === 3)) && (
                <div className="mt-8 border-t border-zinc-200 pt-6">
                  
                  {/* Terms text */}
                  <div className="mb-6 space-y-1">
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">TERMS OF SERVICE</p>
                    <p className="text-[10px] text-zinc-550 leading-relaxed italic whitespace-pre-wrap">{termsAndConditions}</p>
                  </div>

                  {/* Signature block */}
                  <div className="flex justify-start items-end">
                    
                    {/* Company Representative Sign Off */}
                    <div className="space-y-2 min-w-[200px]">
                      <p className="text-[8px] font-bold text-[#0a1a5c] uppercase tracking-wider">AUTHORIZED REPRESENTATIVE</p>
                      
                      {uploadedSignUrl ? (
                        <div className="h-16 flex items-end justify-start pb-1">
                          <img src={uploadedSignUrl} alt="Signature" className="h-16 w-auto object-contain max-w-[220px]" />
                        </div>
                      ) : (
                        <div className="h-16 border-b border-zinc-300 w-48 flex items-end pb-1 text-[10px] text-zinc-400 font-mono">
                          Signature Graphic
                        </div>
                      )}
                      
                      <div className="text-[10px] pt-1">
                        <p className="font-bold text-zinc-800">{signName}</p>
                        <p className="text-zinc-500 text-[9px]">{signTitle}</p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

          </div>

      </div>
      </div>
      )}

      {/* Hidden high-fidelity A4 page layouts for PDF generation */}
      <div id="hidden-pdf-print-container" className="absolute left-[-9999px] top-[-9999px] no-print" style={{ width: '794px' }}>
        
        {/* PAGE 1: COVER OR SINGLE PAGE */}
        <div 
          id="pdf-page-1" 
          className="bg-white text-zinc-900 p-10 relative font-sans overflow-hidden flex flex-col justify-between" 
          style={{ width: '794px', height: '1123px', boxSizing: 'border-box' }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0">
            <img src="/bcore1.png" alt="Watermark" className="w-4/5 max-w-[400px] object-contain grayscale" onError={e => e.currentTarget.src = "/logo.png"} />
          </div>

          <div className="flex-1 flex flex-col z-10 relative justify-between">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                <div className="flex items-center">
                  <img src="/bcore1.png" alt="B-Core Digital" className="h-40 max-w-[340px] w-auto object-contain block shrink-0 -my-12 -ml-8" onError={e => e.currentTarget.src = "/logo.png"} />
                </div>
                <div className="text-right font-mono text-[9px] text-zinc-500 leading-tight space-y-0.5">
                  <p className="font-bold text-zinc-800 uppercase tracking-widest text-[10px]">
                    {docFormat === "proposal" ? "BUSINESS PROPOSAL" : "FORMAL COST QUOTE"}
                  </p>
                  <p>REF: {docId}</p>
                  <p>DATE: {signingDate}</p>
                  <p>STATUS: CONFIDENTIAL</p>
                </div>
              </div>

              {/* Meta Columns */}
              <div className="grid grid-cols-2 gap-6 mt-4 pb-4 border-b border-zinc-100">
                <div>
                  <p className="text-[9px] font-bold text-[#0a1a5c] uppercase tracking-wider mb-1">PROVISIONED BY:</p>
                  <p className="font-bold text-zinc-800">{ourCompanyName}</p>
                  <p className="text-zinc-500 text-[10px] leading-relaxed">
                    {ourCompanyAddress}<br />
                    {ourCompanyEmail}<br />
                    {ourCompanyTaxId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-[#0a1a5c] uppercase tracking-wider mb-1">PREPARED FOR:</p>
                  <p className="font-bold text-zinc-800">{clientName}</p>
                  <p className="text-zinc-500 text-[10px] leading-relaxed">
                    {clientContact}<br />
                    {clientAddress}<br />
                    {clientEmail}<br />
                    {docAudience === "b2b" && clientTaxId && (
                      <span className="font-mono text-[9px]">Tax ID: {clientTaxId}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Title Banner */}
              <div className="my-4 bg-[#0a1a5c] text-white p-4 rounded shadow-sm text-center">
                <h2 className="text-base font-bold tracking-wider uppercase m-0 leading-normal">{proposalTitle}</h2>
              </div>

              {/* Single Page Cost Table */}
              {docType === "single" && (
                <div className="space-y-6">
                  <p className="text-[10px] text-zinc-500 italic">
                    We are pleased to submit the following cost estimate and service deliverables breakdown for the project referenced above. Prices listed are estimated ranges.
                  </p>
                  
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b-2 border-zinc-200 text-[#0a1a5c] text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2">Deliverable / Services</th>
                        {showHours && <th className="py-2 text-center w-24">Est. Hours</th>}
                        <th className="py-2 text-right">Chargeable Range</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] divide-y divide-zinc-100">
                      {items.map(item => (
                        <tr key={item.id} className="hover:bg-zinc-50/50">
                          <td className="py-2.5 pr-4">
                            <div className="font-semibold text-zinc-800">{item.name || "Untitled Service"}</div>
                            {item.description && <div className="text-zinc-500 text-[10px] font-normal leading-normal">{item.description}</div>}
                          </td>
                          {showHours && (
                            <td className="py-2.5 text-center font-mono text-zinc-700">
                              {item.hours || "—"}
                            </td>
                          )}
                          <td className="py-2.5 text-right font-mono font-bold text-zinc-800">
                            {formatCurrency(item.minPrice)} - {formatCurrency(item.maxPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end pt-3">
                    <div className="w-72 font-mono text-[11px] space-y-1.5 border-t border-zinc-200 pt-3">
                      {applyTax ? (
                        <>
                          <div className="flex justify-between text-zinc-500">
                            <span>SUBTOTAL RANGE:</span>
                            <span className="font-bold text-zinc-700">{formatCurrency(subtotalMin)} - {formatCurrency(subtotalMax)}</span>
                          </div>
                          <div className="flex justify-between text-zinc-500">
                            <span>ESTIMATED TAX ({taxRate}%):</span>
                            <span className="font-bold text-zinc-700">{formatCurrency(taxMin)} - {formatCurrency(taxMax)}</span>
                          </div>
                          <div className="flex justify-between text-[#0a1a5c] font-bold border-t border-zinc-200 pt-1.5 text-xs">
                            <span>ESTIMATED TOTAL:</span>
                            <span>{formatCurrency(totalMin)} - {formatCurrency(totalMax)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-[#0a1a5c] font-bold border-t border-zinc-200 pt-1.5 text-xs">
                          <span>ESTIMATED TOTAL:</span>
                          <span>{formatCurrency(subtotalMin)} - {formatCurrency(subtotalMax)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-page Cover Executive Summary */}
              {docType === "multi" && (
                <div className="mt-8 space-y-4">
                  <h4 className="text-xs font-bold text-[#0a1a5c] uppercase font-mono tracking-wider">PROJECT EXECUTIVE SUMMARY</h4>
                  <p className="text-zinc-650 leading-relaxed text-[11px]">{execSummary}</p>
                </div>
              )}
            </div>

            {/* Footer page 1 */}
            <div className="border-t border-zinc-200 pt-4 mt-auto">
              {docType === "single" ? (
                /* Single Page Signatures & Terms */
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">TERMS OF SERVICE</p>
                    <p className="text-[10px] text-zinc-550 leading-relaxed italic whitespace-pre-wrap">{termsAndConditions}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-2 min-w-[200px]">
                      <p className="text-[8px] font-bold text-[#0a1a5c] uppercase tracking-wider">AUTHORIZED REPRESENTATIVE</p>
                      {uploadedSignUrl ? (
                        <img src={uploadedSignUrl} alt="Signature" className="h-16 w-auto object-contain max-w-[220px]" />
                      ) : (
                        <div className="h-16 border-b border-zinc-300 w-48 flex items-end pb-1 text-[10px] text-zinc-400 font-mono">Signature Graphic</div>
                      )}
                      <div className="text-[10px] pt-1">
                        <p className="font-bold text-zinc-800">{signName}</p>
                        <p className="text-zinc-500 text-[9px]">{signTitle}</p>
                      </div>
                    </div>
                    <div className="font-mono text-[9px] text-zinc-400">
                      <span>Confidential // Reference: {docId}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Multi Page Cover Footer */
                <div className="flex justify-between items-end">
                  <div className="font-mono text-[9px] text-zinc-400">
                    <span>Confidential // Reference: {docId}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-700">Page 1 of 3 (Cover)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MULTI PAGE: PAGE 2 & PAGE 3 */}
        {docType === "multi" && (
          <>
            {/* PAGE 2 */}
            <div 
              id="pdf-page-2" 
              className="bg-white text-zinc-900 p-10 relative font-sans overflow-hidden flex flex-col justify-between" 
              style={{ width: '794px', height: '1123px', boxSizing: 'border-box' }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0">
                <img src="/bcore1.png" alt="Watermark" className="w-4/5 max-w-[400px] object-contain grayscale" onError={e => e.currentTarget.src = "/logo.png"} />
              </div>

              <div className="flex-1 flex flex-col z-10 relative justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3 mb-6">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">SCOPE & OBJECTIVES // {docId}</span>
                    <img src="/bcore1.png" alt="B-Core Logo" className="h-16 w-auto object-contain -my-4 -mr-4" onError={e => e.currentTarget.src = "/logo.png"} />
                  </div>

                  <div className="space-y-6">
                    {sections.map((sec) => (
                      <div key={sec.id} className="space-y-2.5">
                        <h3 className="text-xs font-bold text-[#0a1a5c] uppercase font-mono tracking-widest border-b border-zinc-100 pb-1">
                          {sec.title}
                        </h3>
                        {sec.subtitle && (
                          <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider -mt-1.5 font-mono">
                            {sec.subtitle}
                          </p>
                        )}
                        <p className="text-zinc-650 leading-relaxed text-[11px] whitespace-pre-line">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-4 mt-auto flex justify-between items-center font-mono text-[9px] text-zinc-400">
                  <span>Confidential // Reference: {docId}</span>
                  <span className="text-right text-[10px] font-bold text-zinc-700">Page 2 of 3</span>
                </div>
              </div>
            </div>

            {/* PAGE 3 */}
            <div 
              id="pdf-page-3" 
              className="bg-white text-zinc-900 p-10 relative font-sans overflow-hidden flex flex-col justify-between" 
              style={{ width: '794px', height: '1123px', boxSizing: 'border-box' }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0">
                <img src="/bcore1.png" alt="Watermark" className="w-4/5 max-w-[400px] object-contain grayscale" onError={e => e.currentTarget.src = "/logo.png"} />
              </div>

              <div className="flex-1 flex flex-col z-10 relative justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3 mb-4">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">FINANCIALS // {docId}</span>
                    <img src="/bcore1.png" alt="B-Core Logo" className="h-16 w-auto object-contain -my-4 -mr-4" onError={e => e.currentTarget.src = "/logo.png"} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#0a1a5c] uppercase font-mono tracking-widest border-b border-zinc-100 pb-1">
                      4. SERVICES & FINANCIAL BREAKDOWN
                    </h3>
                    <p className="text-zinc-500 text-[10px] italic">
                      All cost details specified below are estimated chargeable ranges in {currency}.
                    </p>

                    <table className="w-full border-collapse text-left mt-2">
                      <thead>
                        <tr className="border-b border-zinc-200 text-[#0a1a5c] text-[10px] font-bold uppercase tracking-wider">
                          <th className="py-2">Item Description</th>
                          {showHours && <th className="py-2 text-center w-24">Est. Hours</th>}
                          <th className="py-2 text-right">Chargeable Range</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] divide-y divide-zinc-100">
                        {items.map(item => (
                          <tr key={item.id} className="hover:bg-zinc-50/50">
                            <td className="py-2.5 pr-4">
                              <div className="font-semibold text-zinc-800">{item.name || "Untitled Service"}</div>
                              {item.description && <div className="text-zinc-500 text-[9px] font-normal leading-normal">{item.description}</div>}
                            </td>
                            {showHours && (
                              <td className="py-2.5 text-center font-mono text-zinc-700">
                                {item.hours || "—"}
                              </td>
                            )}
                            <td className="py-2.5 text-right font-mono font-bold text-zinc-800">
                              {formatCurrency(item.minPrice)} - {formatCurrency(item.maxPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end pt-2">
                      <div className="w-72 font-mono text-[10px] space-y-1 border-t border-zinc-200 pt-2">
                        {applyTax ? (
                          <>
                            <div className="flex justify-between text-zinc-500">
                              <span>SUBTOTAL RANGE:</span>
                              <span className="font-bold text-zinc-700">{formatCurrency(subtotalMin)} - {formatCurrency(subtotalMax)}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                              <span>TAX/VAT ({taxRate}%):</span>
                              <span className="font-bold text-zinc-700">{formatCurrency(taxMin)} - {formatCurrency(taxMax)}</span>
                            </div>
                            <div className="flex justify-between text-[#0a1a5c] font-bold border-t border-zinc-200 pt-1 text-xs">
                              <span>TOTAL QUOTE:</span>
                              <span>{formatCurrency(totalMin)} - {formatCurrency(totalMax)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between text-[#0a1a5c] font-bold border-t border-zinc-200 pt-1 text-xs">
                            <span>TOTAL ESTIMATE:</span>
                            <span>{formatCurrency(subtotalMin)} - {formatCurrency(subtotalMax)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-4 mt-auto">
                  <div className="mb-4 space-y-1">
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">TERMS OF SERVICE</p>
                    <p className="text-[9px] text-zinc-550 leading-relaxed italic whitespace-pre-wrap">{termsAndConditions}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-2 min-w-[200px]">
                      <p className="text-[8px] font-bold text-[#0a1a5c] uppercase tracking-wider">AUTHORIZED REPRESENTATIVE</p>
                      {uploadedSignUrl ? (
                        <img src={uploadedSignUrl} alt="Signature" className="h-12 w-auto object-contain max-w-[220px]" />
                      ) : (
                        <div className="h-12 border-b border-zinc-300 w-48 flex items-end pb-1 text-[10px] text-zinc-400 font-mono font-sans">Signature Graphic</div>
                      )}
                      <div className="text-[9px] pt-1">
                        <p className="font-bold text-zinc-800">{signName}</p>
                        <p className="text-zinc-500 text-[8px]">{signTitle}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center font-mono text-[9px] text-zinc-400">
                      <span>Confidential // Reference: {docId}</span>
                      <span className="text-right text-[10px] font-bold text-zinc-700 ml-4 font-sans">Page 3 of 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
