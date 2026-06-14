import { useEffect, useState } from "react";
import { useSevenStore, Lead } from "@/store/useSevenStore";
import { Layers, User, Plus, X, Link2, Coins, Briefcase, List, BarChart3, Search, Terminal, Activity, Percent, RefreshCw, Mail, Phone, Globe, ShieldCheck, Wrench, ChevronRight, Sparkles, ExternalLink, Save } from "lucide-react";
import QuotationTrigger from "./QuotationTrigger";

const COLUMNS = ["New", "Contacted", "Qualified", "Lost"];

export default function LeadTriageBoard() {
  const { 
    leads, 
    fetchLeads, 
    updateLeadStatus, 
    updateLeadContact,
    assignLead, 
    createManualLead, 
    triggerFetchLeads, 
    pullApolloLeads,
    enrichLead,
    verifyLeadEmail,
    runScraper,
    findEmail,
    verifyEmail,
    adminUsers, 
    fetchAdminUsers 
  } = useSevenStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApolloModalOpen, setIsApolloModalOpen] = useState(false);
  const [isScraperModalOpen, setIsScraperModalOpen] = useState(false);
  const [isFetchingLeads, setIsFetchingLeads] = useState(false);
  const [lastFetchedTime, setLastFetchedTime] = useState<string>("");
  
  const [apolloForm, setApolloForm] = useState({ query: "", location: "", limit: 10 });
  const [isApolloLoading, setIsApolloLoading] = useState(false);
  const [apolloError, setApolloError] = useState("");
  const [apolloSuccess, setApolloSuccess] = useState("");

  const [scraperForm, setScraperForm] = useState({ urls: "", depth: 1 });
  const [isScraperLoading, setIsScraperLoading] = useState(false);
  const [scraperError, setScraperError] = useState("");
  const [scraperLogs, setScraperLogs] = useState<string[]>([]);
  
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [viewType, setViewType] = useState<"board" | "list" | "dashboard">("board");
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [triageTab, setTriageTab] = useState<"sales" | "operations">("sales");

  // Slide-out sidebar state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"details" | "enrich" | "verify">("details");
  const [finderForm, setFinderForm] = useState({ domain: "", firstName: "", lastName: "" });
  const [finderResult, setFinderResult] = useState<any>(null);
  const [isFinderLoading, setIsFinderLoading] = useState(false);
  const [finderError, setFinderError] = useState<string>("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string>("");
  const [sidebarError, setSidebarError] = useState<string>("");

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editContactForm, setEditContactForm] = useState({
    client_name: "",
    project_title: "",
    contact_person_name: "",
    contact_email: "",
    phone: "",
    website_url: "",
    linkedin_url: ""
  });
  const [isSavingContact, setIsSavingContact] = useState(false);

  const handleSaveContact = async () => {
    if (!selectedLead) return;
    setIsSavingContact(true);
    try {
      const updated = await updateLeadContact(selectedLead.lead_id, editContactForm);
      if (updated) {
        setSelectedLead(updated);
        setIsEditingContact(false);
      }
    } catch (e) {
      console.error("Failed to save contact details", e);
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleFetchLeads = async () => {
    setIsFetchingLeads(true);
    try {
      await triggerFetchLeads();
      setLastFetchedTime(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching leads", error);
    } finally {
      setIsFetchingLeads(false);
    }
  };

  const handleEnrichLead = async (leadId: string) => {
    setLoadingAction(leadId);
    try {
      await enrichLead(leadId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleVerifyEmail = async (leadId: string) => {
    setLoadingAction(leadId);
    try {
      await verifyLeadEmail(leadId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const openSidebar = (lead: Lead) => {
    setSelectedLead(lead);
    setSidebarTab("details");
    setFinderResult(null);
    setVerifyResult(null);
    setFinderError("");
    setVerifyError("");
    setSidebarError("");
    setIsEditingContact(false);
    
    setEditContactForm({
      client_name: lead.client_name || lead.normalized_data?.name || "",
      project_title: lead.project_title || lead.normalized_data?.industry || "",
      contact_person_name: lead.contact_person_name || lead.normalized_data?.contact_person_name || "",
      contact_email: lead.contact_email || lead.normalized_data?.contact_email || "",
      phone: lead.phone || lead.normalized_data?.phone || "",
      website_url: lead.website_url || lead.normalized_data?.url || "",
      linkedin_url: lead.linkedin_url || lead.normalized_data?.linkedin_url || ""
    });

    const domain = (lead.website_url || lead.normalized_data?.url || "").replace(/https?:\/\//, "").split("/")[0];
    
    // Parse contact name to extract first name and last name intelligently
    let firstName = "";
    let lastName = "";
    
    // 1. Try raw contact_person_name first
    const rawContactName = lead.contact_person_name || lead.normalized_data?.contact_person_name || "";
    if (rawContactName.trim()) {
      const parts = rawContactName.trim().split(/\s+/);
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }
    
    // 2. If contact person name is empty, try contact_email prefix parsing
    if (!firstName) {
      const email = lead.contact_email || lead.normalized_data?.contact_email || "";
      const prefix = email.split("@")[0] || "";
      const genericEmails = ["contact", "info", "support", "hello", "admin", "jobs", "careers", "sales", "team", "office", "hr", "service", "help", "billing"];
      if (prefix && !genericEmails.includes(prefix.toLowerCase())) {
        if (prefix.includes(".")) {
          const parts = prefix.split(".");
          firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
          lastName = parts.slice(1).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
        } else if (prefix.includes("_")) {
          const parts = prefix.split("_");
          firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
          lastName = parts.slice(1).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
        } else if (prefix.includes("-")) {
          const parts = prefix.split("-");
          firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
          lastName = parts.slice(1).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
        } else {
          firstName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
      }
    }
    
    // 3. Fallback to client_name only if it doesn't look like a company name
    if (!firstName) {
      const clientName = lead.client_name || lead.normalized_data?.name || "";
      const companyKeywords = [
        "inc", "corp", "llc", "ltd", "co", "group", "systems", "software", "tech", "ai",
        "solutions", "dev", "agency", "design", "labs", "consulting", "partners", "digital",
        "network", "studio", "global", "industries", "holdings", "ventures", "capital",
        "hospitable", "composio", "cresta", "systabuild", "united", "lemon", "pro", "media"
      ];
      const isCompany = clientName.includes(".") || 
                        clientName.toLowerCase().split(/\s+/).some(word => companyKeywords.includes(word.replace(/[^a-z]/g, "")));
                        
      if (clientName && !isCompany) {
        const parts = clientName.trim().split(/\s+/);
        if (parts.length <= 3) {
          firstName = parts[0] || "";
          lastName = parts.slice(1).join(" ") || "";
        }
      }
    }
    
    setFinderForm({ domain, firstName, lastName });
  };

  const closeSidebar = () => setSelectedLead(null);

  const handleFindEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFinderLoading(true);
    setFinderResult(null);
    setFinderError("");
    try {
      const result = await findEmail(finderForm.domain, finderForm.firstName, finderForm.lastName);
      if (result && result.error) {
        setFinderError(result.error);
      } else if (result) {
        setFinderResult(result);
      } else {
        setFinderError("API search failed or returned empty result.");
      }
    } catch (err: any) { 
      setFinderError(err.message || "Network error while calling finder.");
      console.error(err); 
    }
    finally { setIsFinderLoading(false); }
  };

  const handleVerifyStandalone = async (email: string) => {
    setIsVerifyLoading(true);
    setVerifyResult(null);
    setVerifyError("");
    try {
      const result = await verifyEmail(email);
      if (result && result.error) {
        setVerifyError(result.error);
      } else if (result) {
        setVerifyResult(result);
      } else {
        setVerifyError("API verification failed or returned empty result.");
      }
    } catch (err: any) { 
      setVerifyError(err.message || "Network error while calling verifier.");
      console.error(err); 
    }
    finally { setIsVerifyLoading(false); }
  };

  const handleEnrichSidebar = async () => {
    if (!selectedLead) return;
    setLoadingAction(selectedLead.lead_id);
    setSidebarError("");
    const res = await enrichLead(selectedLead.lead_id);
    setLoadingAction(null);
    if (res && res.error) {
      setSidebarError(res.error);
    } else {
      // refresh selected lead from store
      const updated = leads.find(l => l.lead_id === selectedLead.lead_id);
      if (updated) setSelectedLead(updated);
    }
  };

  const handleVerifySidebar = async () => {
    if (!selectedLead) return;
    setLoadingAction(selectedLead.lead_id);
    setSidebarError("");
    const res = await verifyLeadEmail(selectedLead.lead_id);
    setLoadingAction(null);
    if (res && res.error) {
      setSidebarError(res.error);
    } else {
      const updated = leads.find(l => l.lead_id === selectedLead.lead_id);
      if (updated) setSelectedLead(updated);
    }
  };

  const handleApolloSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApolloLoading(true);
    setApolloError("");
    setApolloSuccess("");
    try {
      const ok = await pullApolloLeads(apolloForm.query, apolloForm.location, apolloForm.limit);
      if (ok) {
        setApolloSuccess("Successfully pulled and ingested B2B profiles!");
        setTimeout(() => {
          setIsApolloModalOpen(false);
          setApolloForm({ query: "", location: "", limit: 10 });
          setApolloSuccess("");
        }, 1500);
      } else {
        setApolloError("Failed to pull Apollo leads.");
      }
    } catch (err) {
      setApolloError("An error occurred during lead pulling.");
    } finally {
      setIsApolloLoading(false);
    }
  };

  const handleScraperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraperLoading(true);
    setScraperError("");
    setScraperLogs(["Job runner requested.", "Parsing target URLs...", "Triggering background crawl..."]);
    try {
      const urls = scraperForm.urls.split(",").map(u => u.trim()).filter(Boolean);
      const ok = await runScraper(urls, scraperForm.depth);
      if (ok) {
        setScraperLogs(prev => [...prev, "Job spawned successfully (ID: bg_scrapy_worker)", "Crawler running in background...", "Leads will appear on the board automatically."]);
        setTimeout(() => {
          setIsScraperModalOpen(false);
          setScraperForm({ urls: "", depth: 1 });
          setScraperLogs([]);
        }, 3000);
      } else {
        setScraperError("Failed to launch crawler task.");
      }
    } catch (err) {
      setScraperError("An error occurred running the scraper.");
    } finally {
      setIsScraperLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    source: "manual",
    name: "",
    industry: "",
    budget: "",
    url: "",
    description: "",
    contact_email: "",
    contact_person_name: "",
    phone: "",
    email_verification_status: "unknown"
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    fetchLeads();
    fetchAdminUsers();
  }, [fetchLeads, fetchAdminUsers]);

  const getSourceStyle = (source: string) => {
    switch (source) {
      case "website_form":
        return { dot: "bg-blue-500", text: "text-blue-400 border-blue-500/20 bg-blue-500/5", name: "Website Form" };
      case "upwork_rss":
        return { dot: "bg-emerald-500", text: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", name: "Upwork RSS" };
      case "weworkremotely_rss":
        return { dot: "bg-emerald-500", text: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", name: "WeWorkRemotely RSS" };
      case "apollo_api":
        return { dot: "bg-cyan-500", text: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5", name: "Apollo.io API" };
      case "scrapy_crawler":
        return { dot: "bg-purple-500", text: "text-purple-400 border-purple-500/20 bg-purple-500/5", name: "Scrapy Crawler" };
      case "manual":
        return { dot: "bg-amber-500", text: "text-amber-400 border-amber-500/20 bg-amber-500/5", name: "Manual" };
      default:
        return { dot: "bg-zinc-500", text: "text-zinc-400 border-zinc-500/20 bg-zinc-500/5", name: source };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formData.name.trim() || !formData.industry.trim()) {
      setFormError("Client Name and Sector/Industry are required.");
      return;
    }

    const success = await createManualLead({
      source: formData.source || "manual",
      name: formData.name.trim(),
      industry: formData.industry.trim(),
      budget: formData.budget.trim() || "Not Specified",
      url: formData.url.trim(),
      description: formData.description.trim(),
      contact_email: formData.contact_email.trim() || undefined,
      contact_person_name: formData.contact_person_name.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      email_verification_status: formData.email_verification_status
    });

    if (success) {
      setFormSuccess("Lead logged successfully!");
      setFormData({
        source: "manual",
        name: "",
        industry: "",
        budget: "",
        url: "",
        description: "",
        contact_email: "",
        contact_person_name: "",
        phone: "",
        email_verification_status: "unknown"
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess("");
      }, 1000);
    } else {
      setFormError("Failed to log lead.");
    }
  };

  // Filter staff members for assignment
  const staffMembers = (adminUsers || []).filter(u => u.user_type !== "Client" && u.role_tier <= 3);

  // Budget Parsing helper
  const parseBudget = (budgetStr: string): number => {
    if (!budgetStr) return 0;
    const str = budgetStr.replace(/\s/g, "").toLowerCase();
    if (str.includes("hourly")) {
      const matches = str.match(/\$(\d+(?:\.\d+)?)/g);
      if (matches && matches.length > 0) {
        const val = parseFloat(matches[0].replace("$", ""));
        return val * 160; // Estimated 160-hour contract
      }
    }
    const matches = str.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (matches && matches.length > 1) {
      return parseFloat(matches[1].replace(/,/g, ""));
    }
    const numMatch = str.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (numMatch) {
      return parseFloat(numMatch[1].replace(/,/g, ""));
    }
    return 0;
  };

  // Filter leads based on Triage Tab (Sales vs Operations)
  const tabLeads = leads.filter((lead) => {
    const isMature = lead.maturity_status === "mature";
    if (triageTab === "sales") {
      return isMature;
    } else {
      return !isMature;
    }
  });

  // Filter leads for List view
  const filteredLeads = tabLeads.filter((lead) => {
    const name = (lead.client_name || lead.normalized_data?.name || "Anonymous / Unnamed Lead").toLowerCase();
    const industry = (lead.project_title || lead.normalized_data?.industry || "Undefined Sector").toLowerCase();
    const source = (lead.source || "").toLowerCase();
    const status = (lead.status || "").toLowerCase();
    const description = (lead.raw_payload?.description || "").toLowerCase();
    const budget = (lead.raw_payload?.budget || "").toLowerCase();
    
    const matchesSearch = 
      name.includes(searchTerm.toLowerCase()) ||
      industry.includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase()) ||
      budget.includes(searchTerm.toLowerCase());
      
    const matchesSource = sourceFilter === "all" || source === sourceFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesSource && matchesStatus;
  });

  // Computations for Dashboard View
  const totalLeads = tabLeads.length;
  const newLeads = tabLeads.filter(l => (l.status || "").toLowerCase() === "new").length;
  const contactedLeads = tabLeads.filter(l => (l.status || "").toLowerCase() === "contacted").length;
  const qualifiedLeads = leads.filter(l => (l.status || "").toLowerCase() === "qualified").length;
  const lostLeads = leads.filter(l => (l.status || "").toLowerCase() === "lost").length;

  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
  
  const estimatedPipelineValue = leads.reduce((sum, lead) => {
    const budgetStr = lead.raw_payload?.budget || "";
    return sum + parseBudget(budgetStr);
  }, 0);

  // Group by Source
  const sourceGroups: Record<string, number> = {};
  leads.forEach(l => {
    const src = l.source || "unknown";
    sourceGroups[src] = (sourceGroups[src] || 0) + 1;
  });

  // Group by Assignee
  const assigneeGroups: Record<string, number> = {};
  leads.forEach(l => {
    if (l.assigned_to) {
      assigneeGroups[l.assigned_to] = (assigneeGroups[l.assigned_to] || 0) + 1;
    }
  });
  const unassignedLeadsCount = leads.filter(l => !l.assigned_to).length;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#050505] p-6 rounded-lg border border-zinc-800 space-y-6 relative">
      
      {/* Header */}
      <header className="border-b border-zinc-800 pb-4 flex flex-col space-y-4">
        {/* Row 1: Title & Live Status (Left), Fetch Live Leads Button (Right) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#00E5FF] tracking-widest font-mono uppercase flex items-center">
              <Layers className="w-5 h-5 mr-3 text-[#00E5FF] animate-pulse" />
              Lead Triage Console
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              HYBRID INGESTION TELEMETRY & CONVERSION PIPELINE
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-[#111111] px-3 py-1.5 rounded border border-zinc-800 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
                Live Stream Connected
              </span>
            </div>

            {lastFetchedTime && (
              <div className="text-[10px] text-zinc-550 font-mono bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-900">
                LAST FETCHED: <span className="text-zinc-300 font-bold">{lastFetchedTime}</span>
              </div>
            )}

            <button
              onClick={handleFetchLeads}
              disabled={isFetchingLeads}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-350 hover:text-zinc-200 font-mono text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLeads ? "animate-spin text-[#00E5FF]" : ""}`} />
              <span>{isFetchingLeads ? "Fetching..." : "Fetch Live Leads"}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Tabs & View switcher (Left), Action Buttons (Right) */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center w-full gap-4 pt-3 border-t border-zinc-900/40">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Triage Tab Selector (Sales vs Operations) */}
            <div className="flex bg-[#0d0d11]/80 p-0.5 rounded border border-zinc-800 font-mono text-[11px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
              <button
                onClick={() => setTriageTab("sales")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                  triageTab === "sales"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold shadow-[0_0_10px_rgba(16,185,129,0.08)]"
                    : "text-zinc-550 hover:text-zinc-355 border border-transparent"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-450" />
                <span>Sales Pipeline</span>
              </button>
              <button
                onClick={() => setTriageTab("operations")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                  triageTab === "operations"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold shadow-[0_0_10px_rgba(245,158,11,0.08)]"
                    : "text-zinc-550 hover:text-zinc-355 border border-transparent"
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-450" />
                <span>Operations Console</span>
              </button>
            </div>

            {/* View Switcher */}
            <div className="flex bg-[#0d0d11]/80 p-0.5 rounded border border-zinc-800 font-mono text-[11px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
              <button
                onClick={() => setViewType("board")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded transition-all cursor-pointer ${
                  viewType === "board"
                    ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 font-bold shadow-[0_0_10px_rgba(0,229,255,0.08)]"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded transition-all cursor-pointer ${
                  viewType === "list"
                    ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 font-bold shadow-[0_0_10px_rgba(0,229,255,0.08)]"
                    : "text-[#00E5FF]/70 hover:text-[#00E5FF] border border-transparent"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewType("dashboard")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded transition-all cursor-pointer ${
                  viewType === "dashboard"
                    ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 font-bold shadow-[0_0_10px_rgba(0,229,255,0.08)]"
                    : "text-zinc-550 hover:text-zinc-350 border border-transparent"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Telemetry Dashboard</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsApolloModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-350 hover:text-zinc-200 font-mono text-xs font-bold transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Apollo Search</span>
            </button>
            <button
              onClick={() => setIsScraperModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-350 hover:text-zinc-200 font-mono text-xs font-bold transition-all cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Scraper Console</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-[#00E5FF]/30 bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 text-[#00E5FF] font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.05)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Manual Lead</span>
            </button>
          </div>
        </div>
      </header>

      {/* Board View */}
      {viewType === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">
          {COLUMNS.map((column) => {
            const columnLeads = tabLeads.filter(
              (lead) => (lead.status || "New").toLowerCase() === column.toLowerCase()
            );

            return (
              <div
                key={column}
                className="bg-[#0b0b0e] border border-zinc-900 rounded-lg p-4 flex flex-col h-full min-h-0"
              >
                <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
                  <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                    {column}
                  </span>
                  <span className="text-[10px] font-mono bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 font-bold">
                    {columnLeads.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {columnLeads.length > 0 ? (
                    columnLeads.map((lead) => {
                      const sourceInfo = getSourceStyle(lead.source);
                      const name = lead.client_name || lead.normalized_data?.name || "Anonymous / Unnamed Lead";
                      const industry = lead.project_title || lead.normalized_data?.industry || "Undefined Sector";
                      const budget = lead.raw_payload?.budget || "Not Specified";

                      return (
                        <div
                          key={lead.lead_id}
                          onClick={() => openSidebar(lead)}
                          className="bg-[#111] hover:bg-[#15151b] transition-all p-3 border border-zinc-800 hover:border-[#00E5FF]/30 rounded-md flex flex-col space-y-3 group cursor-pointer"
                        >
                          {/* Source and Time */}
                          <div className="flex justify-between items-center">
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded border ${sourceInfo.text} flex items-center space-x-1`}
                            >
                              <span className={`w-1 h-1 rounded-full ${sourceInfo.dot}`} />
                              <span>{sourceInfo.name}</span>
                            </span>
                            <span className="text-[9px] text-zinc-650 font-mono font-bold">
                              {lead.created_at
                                ? new Date(lead.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>

                          {/* Title and Industry */}
                          <div>
                            <h4 className="text-xs font-mono text-zinc-200 group-hover:text-white font-bold truncate">
                              {name}
                            </h4>
                            <p className="text-[10px] font-mono text-zinc-500 mt-0.5 truncate">
                              {industry}
                            </p>
                          </div>

                          {/* Dropdown selectors for Status and Assignee */}
                          <div className="space-y-2 pt-2 border-t border-zinc-900/60">
                            {/* Status swapper */}
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-zinc-500">Status:</span>
                              <select
                                value={lead.status || "New"}
                                onChange={(e) => updateLeadStatus(lead.lead_id, e.target.value)}
                                className="bg-[#0c0c0c] border border-zinc-800 text-[10px] px-1.5 py-0.5 rounded font-mono text-zinc-300 focus:border-[#00E5FF] outline-none cursor-pointer"
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Lost">Lost</option>
                              </select>
                            </div>

                            {/* Assignee select */}
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-zinc-500">Assignee:</span>
                              <select
                                value={lead.assigned_to || ""}
                                onChange={(e) => assignLead(lead.lead_id, e.target.value)}
                                className="bg-[#0c0c0c] border border-zinc-800 text-[10px] px-1.5 py-0.5 rounded font-mono text-zinc-300 focus:border-[#00E5FF] outline-none cursor-pointer max-w-[110px] truncate"
                              >
                                <option value="">-- Unassigned --</option>
                                {staffMembers.map(user => (
                                  <option key={user.user_id} value={user.user_id}>
                                    {user.full_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                           {/* Enrichment Details */}
                          <div className="pt-2 border-t border-zinc-900/60">
                            {(lead.contact_email || lead.normalized_data?.contact_email) ? (
                              <div className="bg-zinc-950/40 p-2 rounded border border-zinc-900/30 space-y-1.5 text-[10px] font-mono">
                                <div className="flex justify-between items-center text-zinc-400">
                                  <span className="truncate max-w-[130px]" title={lead.contact_email || lead.normalized_data?.contact_email || ""}>
                                    {lead.contact_email || lead.normalized_data?.contact_email}
                                  </span>
                                  <div>
                                    {(lead.email_verification_status || lead.normalized_data?.email_verification_status) === "valid" ? (
                                      <span className="text-[8px] bg-green-950/40 text-[#10b981] px-1.5 py-0.5 rounded border border-green-900/30 font-bold uppercase">
                                        Valid
                                      </span>
                                    ) : (lead.email_verification_status || lead.normalized_data?.email_verification_status) === "invalid" ? (
                                      <span className="text-[8px] bg-red-950/40 text-[#ff1744] px-1.5 py-0.5 rounded border border-red-900/30 font-bold uppercase">
                                        Invalid
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleVerifyEmail(lead.lead_id)}
                                        disabled={loadingAction === lead.lead_id}
                                        className="text-[8px] bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] px-1.5 py-0.5 rounded border border-[#00E5FF]/30 font-bold uppercase cursor-pointer transition-all disabled:opacity-50"
                                      >
                                        {loadingAction === lead.lead_id ? "..." : "Verify"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {(lead.phone || lead.normalized_data?.phone) && (
                                  <div className="text-zinc-500 text-[9px]">{lead.phone || lead.normalized_data?.phone}</div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEnrichLead(lead.lead_id)}
                                disabled={loadingAction === lead.lead_id}
                                className="w-full flex items-center justify-center py-1 rounded border border-zinc-850 bg-zinc-950/40 hover:bg-zinc-900 text-[#00E5FF] hover:text-[#00E5FF]/80 font-mono text-[9px] font-bold transition-all cursor-pointer disabled:opacity-50"
                              >
                                <span>{loadingAction === lead.lead_id ? "Enriching..." : "Enrich Contact Details"}</span>
                              </button>
                            )}
                          </div>

                          {/* Quotation & Actions */}
                          <div className="border-t border-zinc-900 pt-2 flex justify-between items-center">
                            <span className="text-[9px] font-mono text-zinc-650 flex items-center">
                              <User className="w-3 h-3 mr-1 text-zinc-550" />
                              {lead.assigned_to ? "Assigned" : "Unassigned"}
                            </span>
                            <div>
                              <QuotationTrigger
                                clientName={name}
                                industry={industry}
                                proposedBudget={budget}
                                serviceType="Architecture & Development"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-24 border border-dashed border-zinc-900/60 rounded flex items-center justify-center">
                      <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                        Empty Lane
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewType === "list" && (
        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 bg-[#09090b] border border-zinc-900 p-4 rounded-lg font-mono text-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search leads by client name, scope, budget, context..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#0c0c0e] border border-zinc-800 text-zinc-200 rounded outline-none focus:border-[#00E5FF] transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-zinc-500">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-[#0c0c0e] border border-zinc-800 px-2 py-1.5 rounded text-zinc-350 focus:border-[#00E5FF] outline-none cursor-pointer"
                >
                  <option value="all">All Sources</option>
                  <option value="weworkremotely_rss">WeWorkRemotely RSS</option>
                  <option value="upwork_rss">Upwork RSS</option>
                  <option value="apollo_api">Apollo.io API</option>
                  <option value="scrapy_crawler">Scrapy Crawler</option>
                  <option value="website_form">Website Form</option>
                  <option value="manual">Manual Entry</option>
                  <option value="linkedin">LinkedIn Reachout</option>
                  <option value="reddit">Reddit Monitoring</option>
                  <option value="clutch">Clutch Listing</option>
                  <option value="cold_email">Cold Outreach</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-zinc-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#0c0c0e] border border-zinc-800 px-2 py-1.5 rounded text-zinc-350 focus:border-[#00E5FF] outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              {(searchTerm || sourceFilter !== "all" || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSourceFilter("all");
                    setStatusFilter("all");
                  }}
                  className="border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-400 px-3 py-1.5 rounded hover:text-zinc-200 transition-all cursor-pointer flex items-center"
                >
                  <X className="w-3 h-3 mr-1" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto border border-zinc-900 rounded-lg bg-[#0b0b0e] min-h-0">
            <table className="min-w-[1300px] w-full text-left border-collapse font-mono text-xs table-fixed">
              <thead>
                <tr className="border-b border-zinc-850 bg-black/40 text-zinc-450 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-4 w-[12%]">Origin/Source</th>
                  <th className="p-4 w-[13%]">Client/Name</th>
                  <th className="p-4 w-[16%]">Sector/Project Scope</th>
                  <th className="p-4 w-[16%]">Contact</th>
                  <th className="p-4 w-[8%]">Maturity</th>
                  <th className="p-4 w-[8%]">Budget</th>
                  <th className="p-4 w-[8%]">Status</th>
                  <th className="p-4 w-[9%]">Assignee</th>
                  <th className="p-4 w-[10%]">Date Logged</th>
                  <th className="p-4 text-right w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => {
                    const sourceInfo = getSourceStyle(lead.source);
                    const name = lead.client_name || lead.normalized_data?.name || "Anonymous / Unnamed Lead";
                    const industry = lead.project_title || lead.normalized_data?.industry || "Undefined Sector";
                    const budget = lead.raw_payload?.budget || "Not Specified";
                    const date = lead.created_at
                      ? new Date(lead.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A";

                    const contactEmail = lead.contact_email || lead.normalized_data?.contact_email;
                    const verStatus = lead.email_verification_status || lead.normalized_data?.email_verification_status;

                    return (
                      <tr
                        key={lead.lead_id}
                        onClick={() => openSidebar(lead)}
                        className="hover:bg-[#111116]/60 transition-colors group cursor-pointer"
                      >
                        <td className="p-4 whitespace-nowrap w-[12%]">
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded border ${sourceInfo.text} inline-flex items-center space-x-1`}
                          >
                            <span className={`w-1 h-1 rounded-full ${sourceInfo.dot}`} />
                            <span>{sourceInfo.name}</span>
                          </span>
                        </td>
                        <td className="p-4 font-bold text-zinc-200 group-hover:text-white max-w-[150px] truncate w-[13%]">
                          {name}
                        </td>
                        <td className="p-4 text-zinc-400 max-w-[180px] truncate w-[16%]">
                          {industry}
                        </td>
                        <td className="p-4 whitespace-nowrap w-[16%]">
                          {contactEmail ? (
                            <div className="space-y-0.5">
                              <span className="text-zinc-300 text-[10px] truncate block max-w-[150px]" title={contactEmail}>{contactEmail}</span>
                              {verStatus === "valid" && <span className="text-[8px] text-[#10b981] font-bold">✓ Verified</span>}
                              {verStatus === "invalid" && <span className="text-[8px] text-[#ff1744] font-bold">✗ Invalid</span>}
                              {(!verStatus || verStatus === "unknown") && <span className="text-[8px] text-zinc-600">Unverified</span>}
                            </div>
                          ) : (
                            <span className="text-zinc-700 text-[9px] italic">Not enriched</span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap w-[8%]">
                          {lead.maturity_status === "mature" ? (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 inline-flex items-center space-x-1">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Mature</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-400 inline-flex items-center space-x-1">
                              <X className="w-2.5 h-2.5" />
                              <span>Immature</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-zinc-300 font-bold whitespace-nowrap w-[8%]">
                          {budget}
                        </td>
                        <td className="p-4 w-[8%]">
                          <select
                            value={lead.status || "New"}
                            onChange={(e) => updateLeadStatus(lead.lead_id, e.target.value)}
                            className="bg-[#0c0c0c] border border-zinc-800 text-[10px] px-1.5 py-1 rounded font-mono text-zinc-350 focus:border-[#00E5FF] outline-none cursor-pointer w-full"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>
                        <td className="p-4 w-[9%]">
                          <select
                            value={lead.assigned_to || ""}
                            onChange={(e) => assignLead(lead.lead_id, e.target.value)}
                            className="bg-[#0c0c0c] border border-zinc-800 text-[10px] px-1.5 py-1 rounded font-mono text-zinc-350 focus:border-[#00E5FF] outline-none cursor-pointer w-full truncate"
                          >
                            <option value="">-- Unassigned --</option>
                            {staffMembers.map((user) => (
                              <option key={user.user_id} value={user.user_id}>
                                {user.full_name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-zinc-500 whitespace-nowrap w-[10%]">
                          {date}
                        </td>
                        <td className="p-4 text-right w-[10%]">
                          <div className="inline-flex items-center space-x-2">
                            {(lead.website_url || lead.normalized_data?.url) && (
                              <a
                                href={lead.website_url || lead.normalized_data.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all"
                                title="View Reference URL"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <QuotationTrigger
                              clientName={name}
                              industry={industry}
                              proposedBudget={budget}
                              serviceType="Architecture & Development"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-zinc-650">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="text-sm font-bold font-mono tracking-wider text-zinc-400">NO LEADS MATCH SEARCH</span>
                        <span className="text-[10px] text-zinc-550">Adjust search tags or verify ingestion pipeline logs.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dashboard Telemetry View */}
      {viewType === "dashboard" && (
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
            {/* Metric 1 */}
            <div className="bg-[#0b0b0e] border border-zinc-900 p-4 rounded-lg relative overflow-hidden flex flex-col justify-between h-28 group hover:border-zinc-800 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Ingested Leads</span>
                <Activity className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#00E5FF] tracking-wider">
                  {totalLeads}
                </div>
                <div className="text-[9px] text-zinc-600 mt-1 uppercase">
                  Accumulated historical flow
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#0b0b0e] border border-zinc-900 p-4 rounded-lg relative overflow-hidden flex flex-col justify-between h-28 group hover:border-zinc-800 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Qualification Rate</span>
                <Percent className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-emerald-500 tracking-wider">
                  {conversionRate}%
                </div>
                <div className="text-[9px] text-zinc-600 mt-1 uppercase">
                  Qualified Lead to Project Ratio
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#0b0b0e] border border-zinc-900 p-4 rounded-lg relative overflow-hidden flex flex-col justify-between h-28 group hover:border-zinc-800 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Estimated Value</span>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-amber-500 tracking-wider">
                  ${estimatedPipelineValue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </div>
                <div className="text-[9px] text-zinc-650 mt-1 uppercase font-semibold">
                  Based on parsed contract targets
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-[#0b0b0e] border border-zinc-900 p-4 rounded-lg relative overflow-hidden flex flex-col justify-between h-28 group hover:border-zinc-800 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Active & Unassigned</span>
                <User className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-rose-500 tracking-wider">
                  {unassignedLeadsCount}
                </div>
                <div className="text-[9px] text-zinc-600 mt-1 uppercase">
                  Awaiting Operator Dispatch
                </div>
              </div>
            </div>
          </div>

          {/* Graphical Split Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs flex-1">
            
            {/* Left column: Status & Source distribution */}
            <div className="lg:col-span-7 space-y-6 flex flex-col">
              {/* Status Breakdown */}
              <div className="bg-[#0b0b0e] border border-zinc-900 p-5 rounded-lg space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center justify-between">
                  <span>Lead Status Allocation</span>
                  <span className="text-zinc-600 font-normal">Triage Progression</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "New", count: newLeads, color: "bg-[#00E5FF]", border: "border-[#00E5FF]/20", text: "text-[#00E5FF]" },
                    { name: "Contacted", count: contactedLeads, color: "bg-amber-500", border: "border-amber-500/20", text: "text-amber-500" },
                    { name: "Qualified", count: qualifiedLeads, color: "bg-emerald-500", border: "border-emerald-500/20", text: "text-emerald-500" },
                    { name: "Lost", count: lostLeads, color: "bg-zinc-600", border: "border-zinc-800", text: "text-zinc-500" },
                  ].map((item) => {
                    const percentage = totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0;
                    return (
                      <div key={item.name} className={`bg-[#0c0c0f] border ${item.border} rounded p-3 space-y-2`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${item.text}`}>{item.name}</span>
                          <span className="text-zinc-300 font-bold">{item.count} <span className="text-[10px] text-zinc-650">({percentage}%)</span></span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Source Breakdown */}
              <div className="bg-[#0b0b0e] border border-zinc-900 p-5 rounded-lg space-y-4 flex-1">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center justify-between">
                  <span>Ingestion Sources Telemetry</span>
                  <span className="text-zinc-600 font-normal">Origin Tracking</span>
                </h3>
                <div className="space-y-3">
                  {Object.keys(sourceGroups).length > 0 ? (
                    Object.entries(sourceGroups).map(([source, count]) => {
                      const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                      const sourceStyle = getSourceStyle(source);
                      return (
                        <div key={source} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="flex items-center space-x-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${sourceStyle.dot}`} />
                              <span className="text-zinc-300 font-bold uppercase">{sourceStyle.name}</span>
                            </span>
                            <span className="text-zinc-450 font-bold">{count} leads <span className="text-zinc-600 font-normal">({percentage}%)</span></span>
                          </div>
                          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900">
                            <div className={`h-full ${sourceStyle.dot}`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-zinc-650">No source records logged in database.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: Roster & Logs */}
            <div className="lg:col-span-5 space-y-6 flex flex-col">
              {/* Operator Allocation */}
              <div className="bg-[#0b0b0e] border border-zinc-900 p-5 rounded-lg space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center justify-between">
                  <span>Operator Assignment Roster</span>
                  <span className="text-zinc-600 font-normal">Leads per Exec</span>
                </h3>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {staffMembers.map((staff) => {
                    const count = assigneeGroups[staff.user_id] || 0;
                    const maxAssigned = Math.max(...Object.values(assigneeGroups), 1);
                    const relativePercent = Math.round((count / maxAssigned) * 100);
                    
                    return (
                      <div key={staff.user_id} className="flex items-center justify-between text-[11px] bg-[#0c0c0f] border border-zinc-900/60 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-750 flex items-center justify-center text-zinc-300 font-extrabold text-[9px]">
                            {staff.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </div>
                          <div>
                            <div className="text-zinc-300 font-bold">{staff.full_name}</div>
                            <div className="text-[8px] text-zinc-550 uppercase">{staff.functional_role || "Sales Exec"}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-300 font-bold">{count} Assigned</span>
                          <div className="w-16 bg-zinc-900 h-1 rounded-full overflow-hidden mt-1 ml-auto">
                            <div className="h-full bg-[#00E5FF]" style={{ width: `${relativePercent}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {staffMembers.length === 0 && (
                    <div className="text-center py-4 text-zinc-650">No Sales Executives provisioned.</div>
                  )}
                </div>
              </div>

              {/* Real-time Ingestion Stream Monitor */}
              <div className="bg-[#0b0b0e] border border-[#111] rounded-lg p-4 space-y-3 flex-1 flex flex-col">
                <h3 className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center justify-between">
                  <span className="flex items-center">
                    <Terminal className="w-3.5 h-3.5 mr-2 animate-pulse" /> Ingestion & Dispatch Monitor
                  </span>
                  <span className="bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded text-[8px] tracking-wider animate-pulse">ACTIVE FEED</span>
                </h3>
                
                <div className="bg-[#050507] border border-zinc-900 rounded p-3 flex-1 overflow-y-auto font-mono text-[10px] text-emerald-400 space-y-1.5 h-52 max-h-52 leading-relaxed select-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                  {leads.length > 0 ? (
                    leads.slice(0, 15).map((lead) => {
                      const name = lead.client_name || lead.normalized_data?.name || "Anonymous";
                      const time = lead.created_at
                        ? new Date(lead.created_at).toLocaleTimeString([], { hour12: false })
                        : "00:00:00";
                      const staffUser = staffMembers.find(s => s.user_id === lead.assigned_to);

                      return (
                        <div key={lead.lead_id} className="border-b border-zinc-950 pb-1.5 last:border-0">
                          <div className="flex items-center space-x-1.5 text-zinc-600 font-bold">
                            <span>[{time}]</span>
                            <span className="text-[#00E5FF] uppercase font-bold">Ingested</span>
                            <span className="text-zinc-500">via</span>
                            <span className="text-zinc-300 underline decoration-zinc-800">{lead.source}</span>
                          </div>
                          <div className="pl-4 text-emerald-500/95 font-mono">
                            &gt; Lead &apos;{name}&apos; established. Status: <span className="font-bold uppercase text-zinc-350">{lead.status}</span>
                          </div>
                          {staffUser && (
                            <div className="pl-4 text-amber-500/95 font-mono">
                              &gt; Dispatch to Operator: &apos;{staffUser.full_name}&apos;
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-zinc-650 text-center py-12">No telemetry events logged.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Log Manual Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#0c0c10] border border-zinc-800 rounded-lg max-w-md w-full p-6 shadow-2xl relative space-y-4 font-mono">
            
            {/* Modal Title */}
            <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
              <h3 className="text-sm font-bold text-[#00E5FF] tracking-wider uppercase flex items-center">
                <Briefcase className="w-4 h-4 mr-2" /> Log Manual Sales Lead
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-2 border border-rose-500/30 bg-rose-500/10 text-rose-400 rounded">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded">
                  {formSuccess}
                </div>
              )}

              {/* Source Option */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Lead Origin/Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="linkedin">LinkedIn Reachout</option>
                  <option value="reddit">Reddit Monitoring</option>
                  <option value="clutch">Clutch Listing</option>
                  <option value="cold_email">Cold Outreach</option>
                </select>
              </div>

              {/* Client Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Client Name / Alias</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp Inc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Sector / Industry */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Sector / Project Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Infrastructure Audit"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Proposed Budget */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center">
                  <Coins className="w-3.5 h-3.5 mr-1 text-zinc-500" /> Proposed Budget / Target
                </label>
                <input
                  type="text"
                  placeholder="e.g. $15,000 or $120/hr"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* URL Reference Link */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center">
                  <Link2 className="w-3.5 h-3.5 mr-1 text-zinc-500" /> URL Reference / Profile
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://linkedin.com/in/client"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Context / Initial Notes</label>
                <textarea
                  placeholder="Add background notes or conversation logs..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF] resize-none"
                />
              </div>

              {/* Contact Person Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.contact_person_name}
                  onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Contact Email</label>
                <input
                  type="email"
                  placeholder="e.g. john.doe@company.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1-555-0199"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Email Verification Status</label>
                <select
                  value={formData.email_verification_status}
                  onChange={(e) => setFormData({ ...formData, email_verification_status: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                >
                  <option value="unknown">Unknown (Run verification later)</option>
                  <option value="valid">Verified (Valid)</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#00E5FF]/15 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/45 text-[#00E5FF] py-2 rounded font-bold uppercase transition-all duration-300 tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.08)] cursor-pointer"
              >
                Log Lead Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Apollo.io Search Batch Ingestion Modal */}
      {isApolloModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-lg shadow-2xl p-6 font-mono text-xs text-zinc-350 relative">
            <button
              onClick={() => setIsApolloModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-350 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center">
              <Coins className="w-4 h-4 mr-2 text-[#00E5FF]" />
              APOLLO.IO B2B LEAD INGESTION
            </h3>
            
            <form onSubmit={handleApolloSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest">Target Query / Roles</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SaaS Founders, VP of Tech"
                  value={apolloForm.query}
                  onChange={(e) => setApolloForm({ ...apolloForm, query: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest">Location Target</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={apolloForm.location}
                  onChange={(e) => setApolloForm({ ...apolloForm, location: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest">Limit Result Count</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={apolloForm.limit}
                  onChange={(e) => setApolloForm({ ...apolloForm, limit: parseInt(e.target.value) || 10 })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>
              
              {apolloError && (
                <div className="text-[#ff1744] text-[10px] bg-red-950/20 border border-red-900/30 p-2 rounded">
                  {apolloError}
                </div>
              )}
              {apolloSuccess && (
                <div className="text-[#10b981] text-[10px] bg-green-950/20 border border-green-900/30 p-2 rounded">
                  {apolloSuccess}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isApolloLoading}
                className="w-full py-2 bg-[#00E5FF]/15 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/45 text-[#00E5FF] rounded font-bold uppercase cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {isApolloLoading ? <span>Processing Search...</span> : <span>Ingest Apollo Profiles</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Scrapy Crawler Console Modal */}
      {isScraperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#09090b] border border-zinc-800 rounded-lg shadow-2xl p-6 font-mono text-xs text-zinc-350 relative">
            <button
              onClick={() => setIsScraperModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-350 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center">
              <Terminal className="w-4 h-4 mr-2 text-[#00E5FF]" />
              CUSTOM SCRAPY / CRAWLER CONSOLE
            </h3>
            
            <form onSubmit={handleScraperSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest">Target URL(s) (comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://news.ycombinator.com/jobs, https://weworkremotely.com"
                  value={scraperForm.urls}
                  onChange={(e) => setScraperForm({ ...scraperForm, urls: e.target.value })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest">Crawl Depth</label>
                <select
                  value={scraperForm.depth}
                  onChange={(e) => setScraperForm({ ...scraperForm, depth: parseInt(e.target.value) || 1 })}
                  className="w-full bg-[#111] border border-zinc-800 text-zinc-250 px-3 py-2 rounded outline-none focus:border-[#00E5FF] cursor-pointer"
                >
                  <option value={1}>1 (Single Page)</option>
                  <option value={2}>2 (Follow internal links)</option>
                </select>
              </div>

              {scraperLogs.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-widest">Console Logs</label>
                  <div className="w-full h-32 bg-black border border-zinc-900 rounded p-2 overflow-y-auto space-y-1 font-mono text-[10px] text-zinc-400">
                    {scraperLogs.map((log, index) => (
                      <div key={index} className="flex space-x-2">
                        <span className="text-[#00E5FF]">[sys]</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {scraperError && (
                <div className="text-[#ff1744] text-[10px] bg-red-950/20 border border-red-900/30 p-2 rounded">
                  {scraperError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isScraperLoading}
                className="w-full py-2 bg-[#00E5FF]/15 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/45 text-[#00E5FF] rounded font-bold uppercase cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {isScraperLoading ? <span>Spawning Crawler...</span> : <span>Run Custom Scraper</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          LEAD DETAIL SLIDE-OUT SIDEBAR
          Opens when any Kanban card is clicked.
      ============================================================ */}
      {/* Backdrop */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-[#09090b] border-l border-zinc-800 shadow-2xl flex flex-col font-mono text-xs transition-transform duration-300 ease-in-out ${
          selectedLead ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedLead && (() => {
          const lead = selectedLead;
          const name = lead.client_name || lead.normalized_data?.name || "Anonymous Lead";
          const industry = lead.project_title || lead.normalized_data?.industry || "Unknown Sector";
          const email = lead.contact_email || lead.normalized_data?.contact_email;
          const phone = lead.phone || lead.normalized_data?.phone;
          const website = lead.website_url || lead.normalized_data?.url;
          const apolloId = lead.apollo_id || lead.normalized_data?.apollo_id;
          const verStatus = lead.email_verification_status || lead.normalized_data?.email_verification_status;
          const sourceInfo = getSourceStyle(lead.source);
          const isLoading = loadingAction === lead.lead_id;

          return (
            <>
              {/* Sidebar Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#0c0c0f]">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className={`text-[9px] px-2 py-0.5 rounded border ${sourceInfo.text} flex items-center space-x-1 flex-shrink-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sourceInfo.dot}`} />
                    <span>{sourceInfo.name}</span>
                  </span>
                  <h2 className="text-sm font-bold text-zinc-100 truncate">{name}</h2>
                </div>
                <button onClick={closeSidebar} className="text-zinc-500 hover:text-zinc-200 transition-colors ml-2 flex-shrink-0 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Tabs */}
              <div className="flex border-b border-zinc-800 bg-[#0c0c0f]">
                {(["details", "enrich", "verify"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSidebarTab(tab)}
                    className={`flex-1 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer ${
                      sidebarTab === tab
                        ? "text-[#00E5FF] border-b-2 border-[#00E5FF]"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab === "details" ? "Details" : tab === "enrich" ? "Email Finder" : "Verify"}
                  </button>
                ))}
              </div>

              {/* Sidebar Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {/* ── DETAILS TAB ─────────────────────────── */}
                {sidebarTab === "details" && (
                  <div className="space-y-4">
                    {isEditingContact ? (
                      <div className="space-y-3 bg-zinc-900/30 p-4 rounded border border-zinc-800/60">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest border-b border-zinc-800/60 pb-1.5 mb-2">
                          Edit Lead Details
                        </p>
                        
                        <div className="space-y-1">
                          <label className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Company / Client Name</label>
                          <input
                            type="text"
                            value={editContactForm.client_name}
                            onChange={e => setEditContactForm({ ...editContactForm, client_name: e.target.value })}
                            className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded outline-none focus:border-[#00E5FF] text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Sector / Industry</label>
                          <input
                            type="text"
                            value={editContactForm.project_title}
                            onChange={e => setEditContactForm({ ...editContactForm, project_title: e.target.value })}
                            className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded outline-none focus:border-[#00E5FF] text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Contact Person Name</label>
                          <input
                            type="text"
                            value={editContactForm.contact_person_name}
                            onChange={e => setEditContactForm({ ...editContactForm, contact_person_name: e.target.value })}
                            className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded outline-none focus:border-[#00E5FF] text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Contact Email</label>
                          <input
                            type="email"
                            value={editContactForm.contact_email}
                            onChange={e => setEditContactForm({ ...editContactForm, contact_email: e.target.value })}
                            className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded outline-none focus:border-[#00E5FF] text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Phone Number</label>
                          <input
                            type="text"
                            value={editContactForm.phone}
                            onChange={e => setEditContactForm({ ...editContactForm, phone: e.target.value })}
                            className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded outline-none focus:border-[#00E5FF] text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] text-zinc-550 uppercase tracking-widest font-bold">Website URL</label>
                          <input
                            type="text"
                            value={editContactForm.website_url}
                            onChange={e => setEditContactForm({ ...editContactForm, website_url: e.target.value })}
                            className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded outline-none focus:border-[#00E5FF] text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] text-zinc-550 uppercase tracking-widest font-bold">LinkedIn URL</label>
                          <input
                            type="text"
                            value={editContactForm.linkedin_url}
                            onChange={e => setEditContactForm({ ...editContactForm, linkedin_url: e.target.value })}
                            className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded outline-none focus:border-[#00E5FF] text-xs font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingContact(false)}
                            className="py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400 rounded font-bold uppercase text-[9px] cursor-pointer transition-all hover:text-zinc-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isSavingContact}
                            onClick={handleSaveContact}
                            className="py-1.5 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] rounded font-bold uppercase text-[9px] cursor-pointer transition-all flex items-center justify-center space-x-1"
                          >
                            {isSavingContact ? "Saving…" : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {sidebarError && (
                          <div className="bg-red-950/25 border border-red-900/40 rounded p-3 text-[11px] text-red-400 font-mono leading-relaxed relative">
                            <span className="font-bold block uppercase tracking-widest text-[9px] mb-1">API Key Error</span>
                            {sidebarError}
                          </div>
                        )}
                        {/* Industry / Status row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800/60">
                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Sector</p>
                            <p className="text-zinc-200 font-bold truncate">{industry}</p>
                          </div>
                          <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800/60">
                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Pipeline Status</p>
                            <select
                              value={lead.status || "New"}
                              onChange={e => updateLeadStatus(lead.lead_id, e.target.value)}
                              className="w-full bg-transparent text-zinc-200 font-bold outline-none cursor-pointer"
                            >
                              {["New","Contacted","Qualified","Lost"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Contact info */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Contact Information</p>
                            <span className="text-[8px] text-zinc-400 font-bold px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 uppercase">
                              Status: {lead.maturity_status}
                            </span>
                          </div>
                          <div className="bg-zinc-900/30 rounded border border-zinc-800/50 divide-y divide-zinc-800/50">
                            <div className="flex items-center space-x-3 p-3">
                              <User className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-zinc-300 truncate font-bold">{lead.contact_person_name || "No contact name set"}</p>
                              </div>
                            </div>
                            {email ? (
                              <div className="flex items-center space-x-3 p-3">
                                <Mail className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-zinc-300 truncate">{email}</p>
                                  {verStatus === "valid" && (
                                    <span className="text-[8px] text-[#10b981] font-bold">✓ Verified</span>
                                  )}
                                  {verStatus === "invalid" && (
                                    <span className="text-[8px] text-[#ff1744] font-bold">✗ Invalid</span>
                                  )}
                                  {(!verStatus || verStatus === "unknown") && (
                                    <span className="text-[8px] text-zinc-500">Unverified</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-3 p-3 text-zinc-500">
                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>No email set</span>
                              </div>
                            )}
                            {phone ? (
                              <div className="flex items-center space-x-3 p-3">
                                <Phone className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0" />
                                <p className="text-zinc-300">{phone}</p>
                              </div>
                            ) : null}
                            {website ? (
                              <div className="flex items-center space-x-3 p-3">
                                <Globe className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0" />
                                <a href={website} target="_blank" rel="noopener noreferrer"
                                  className="text-[#00E5FF] hover:underline truncate">{website}</a>
                              </div>
                            ) : null}
                            {lead.linkedin_url ? (
                              <div className="flex items-center space-x-3 p-3">
                                <ExternalLink className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer"
                                  className="text-[#00E5FF] hover:underline truncate">{lead.linkedin_url}</a>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Raw context */}
                        {lead.raw_payload?.description && (
                          <div className="space-y-1">
                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Brief</p>
                            <p className="text-zinc-400 text-[11px] leading-relaxed bg-zinc-900/30 p-3 rounded border border-zinc-800/50">
                              {lead.raw_payload.description}
                            </p>
                          </div>
                        )}

                        {/* Actions Row */}
                        <div className="space-y-2 pt-1">
                          <button
                            onClick={() => {
                              setEditContactForm({
                                client_name: lead.client_name || lead.normalized_data?.name || "",
                                project_title: lead.project_title || lead.normalized_data?.industry || "",
                                contact_person_name: lead.contact_person_name || lead.normalized_data?.contact_person_name || "",
                                contact_email: lead.contact_email || lead.normalized_data?.contact_email || "",
                                phone: lead.phone || lead.normalized_data?.phone || "",
                                website_url: lead.website_url || lead.normalized_data?.url || "",
                                linkedin_url: lead.linkedin_url || lead.normalized_data?.linkedin_url || ""
                              });
                              setIsEditingContact(true);
                            }}
                            className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 text-zinc-300 rounded font-bold uppercase text-[9px] cursor-pointer transition-all flex items-center justify-center space-x-1"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Edit Details Manually</span>
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            {!email ? (
                              <button
                                onClick={handleEnrichSidebar}
                                disabled={isLoading}
                                className="flex items-center justify-center space-x-1.5 py-2 rounded border border-[#00E5FF]/30 bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 text-[#00E5FF] font-bold uppercase text-[9px] transition-all cursor-pointer disabled:opacity-50"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>{isLoading ? "Enriching…" : "Enrich Contact"}</span>
                              </button>
                            ) : (
                              <button
                                onClick={handleVerifySidebar}
                                disabled={isLoading || verStatus === "valid"}
                                className="flex items-center justify-center space-x-1.5 py-2 rounded border border-emerald-700/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 font-bold uppercase text-[9px] transition-all cursor-pointer disabled:opacity-50"
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>{isLoading ? "Verifying…" : verStatus === "valid" ? "Verified ✓" : "Verify Email"}</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSidebarTab("enrich")}
                              className="flex items-center justify-center space-x-1.5 py-2 rounded border border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-300 font-bold uppercase text-[9px] transition-all cursor-pointer"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Email Finder</span>
                            </button>
                          </div>
                        </div>

                        {/* Assignee */}
                        <div className="space-y-1 border-t border-zinc-800/50 pt-3">
                          <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Assignee</p>
                          <select
                            value={lead.assigned_to || ""}
                            onChange={e => assignLead(lead.lead_id, e.target.value)}
                            className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-300 px-3 py-2 rounded outline-none focus:border-[#00E5FF] cursor-pointer"
                          >
                            <option value="">-- Unassigned --</option>
                            {staffMembers.map(u => (
                              <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── EMAIL FINDER TAB ─────────────────────── */}
                {sidebarTab === "enrich" && (
                  <div className="space-y-4">
                    <div className="bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded p-3 text-zinc-400 leading-relaxed">
                      Use the Hunter.io Email Finder to discover the contact email for a known person at this company.
                    </div>

                    {finderError && (
                      <div className="bg-red-950/25 border border-red-900/40 rounded p-3 text-[11px] text-red-400 font-mono leading-relaxed">
                        <span className="font-bold block uppercase tracking-widest text-[9px] mb-1">API Key Error</span>
                        {finderError}
                      </div>
                    )}

                    {!finderResult ? (
                      <form onSubmit={handleFindEmail} className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[9px] text-zinc-550 uppercase tracking-widest font-bold">Company Domain</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. acme.com"
                            value={finderForm.domain}
                            onChange={e => setFinderForm({ ...finderForm, domain: e.target.value })}
                            className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF] focus:bg-black/40 transition-colors"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[9px] text-zinc-550 uppercase tracking-widest font-bold">First Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. John"
                              value={finderForm.firstName}
                              onChange={e => setFinderForm({ ...finderForm, firstName: e.target.value })}
                              className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF] focus:bg-black/40 transition-colors"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[9px] text-zinc-550 uppercase tracking-widest font-bold">Last Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Doe"
                              value={finderForm.lastName}
                              onChange={e => setFinderForm({ ...finderForm, lastName: e.target.value })}
                              className="w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF] focus:bg-black/40 transition-colors"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isFinderLoading}
                          className="w-full py-2 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] rounded font-bold uppercase cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center space-x-2 text-[10px]"
                        >
                          {isFinderLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Searching Hunter.io…</span>
                            </>
                          ) : (
                            <span>Find Email Address</span>
                          )}
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded p-4 space-y-3">
                          <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2.5">
                            <div>
                              <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Target Query</p>
                              <p className="text-zinc-300 font-bold text-[10px]">
                                {finderForm.firstName} {finderForm.lastName} @ {finderForm.domain}
                              </p>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-bold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                              Hunter.io Verified
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Discovered Email</p>
                            <p className="text-sm font-bold text-[#00E5FF] font-mono break-all selection:bg-[#00E5FF]/30">{finderResult.email}</p>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] text-zinc-500 uppercase tracking-widest">
                              <span>Confidence Score</span>
                              <span className="text-zinc-300 font-bold">{finderResult.accuracy_score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                              <div 
                                className="h-full bg-gradient-to-r from-cyan-500 to-[#00E5FF] transition-all duration-500" 
                                style={{ width: `${finderResult.accuracy_score}%` }}
                              />
                            </div>
                          </div>

                          {finderResult.social_profiles?.linkedin && (
                            <div className="space-y-1 border-t border-zinc-800/80 pt-2.5">
                              <p className="text-[8px] text-zinc-500 uppercase tracking-widest">LinkedIn Profile</p>
                              <a 
                                href={finderResult.social_profiles.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-[#00E5FF] hover:underline text-[10px] max-w-full truncate font-mono"
                              >
                                <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
                                {finderResult.social_profiles.linkedin}
                              </a>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/85 pt-3">
                            <button
                              onClick={() => setFinderResult(null)}
                              className="py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400 rounded font-bold uppercase text-[9px] cursor-pointer transition-all hover:text-zinc-200"
                            >
                              Search Again
                            </button>
                            <button
                              onClick={async () => { 
                                setSidebarTab("verify"); 
                                await handleVerifyStandalone(finderResult.email); 
                              }}
                              className="py-1.5 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 rounded font-bold uppercase text-[9px] cursor-pointer transition-all flex items-center justify-center space-x-1"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verify Email →</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── VERIFY TAB ──────────────────────────── */}
                {sidebarTab === "verify" && (
                  <div className="space-y-4">
                    <div className="bg-emerald-950/20 border border-emerald-800/30 rounded p-3 text-zinc-400 leading-relaxed">
                      Run a Snov.io deliverability check on any email address to confirm it is valid before outreach.
                    </div>

                    {verifyError && (
                      <div className="bg-red-950/25 border border-red-900/40 rounded p-3 text-[11px] text-red-400 font-mono leading-relaxed">
                        <span className="font-bold block uppercase tracking-widest text-[9px] mb-1">API Key Error</span>
                        {verifyError}
                      </div>
                    )}

                    {!verifyResult ? (
                      <>
                        {/* Quick-verify if email already exists */}
                        {email ? (
                          <div className="bg-zinc-900/40 border border-zinc-800 rounded p-4 space-y-3">
                            <div>
                              <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Lead Email on File</p>
                              <p className="text-zinc-200 font-bold text-sm font-mono break-all mt-0.5">{email}</p>
                            </div>
                            <button
                              onClick={() => handleVerifyStandalone(email)}
                              disabled={isVerifyLoading}
                              className="w-full py-2 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 rounded font-bold uppercase text-[10px] cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                              {isVerifyLoading ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Verifying with Snov.io…</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Run Snov.io Verification</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          /* Manual Email Verification Input if no email is on file */
                          <div className="bg-zinc-900/40 border border-zinc-800 rounded p-4 space-y-3">
                            <p className="text-[9px] text-zinc-450 uppercase tracking-widest font-bold">No email on file. Enter email manually:</p>
                            <div className="flex space-x-2">
                              <input
                                type="email"
                                id="manual-verify-email"
                                placeholder="name@company.com"
                                className="flex-1 bg-[#0c0c0e] border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded outline-none focus:border-[#00E5FF] text-xs font-mono"
                                onKeyDown={async (e) => {
                                  if (e.key === "Enter") {
                                    const val = (e.target as HTMLInputElement).value;
                                    if (val) await handleVerifyStandalone(val);
                                  }
                                }}
                              />
                              <button
                                onClick={async () => {
                                  const input = document.getElementById("manual-verify-email") as HTMLInputElement;
                                  if (input && input.value) {
                                    await handleVerifyStandalone(input.value);
                                  }
                                }}
                                disabled={isVerifyLoading}
                                className="px-3 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 rounded font-bold uppercase text-[9px] cursor-pointer transition-all disabled:opacity-50"
                              >
                                {isVerifyLoading ? "..." : "Verify"}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className={`border rounded p-4 space-y-3 ${
                          verifyResult.status === "valid"
                            ? "bg-green-950/10 border-green-800/30 text-green-200"
                            : "bg-red-950/10 border-red-900/30 text-red-200"
                        }`}>
                          <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Verification Result</span>
                            <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full border ${
                              verifyResult.status === "valid" 
                                ? "bg-emerald-950/50 border-emerald-800 text-emerald-400" 
                                : "bg-red-950/50 border-red-900 text-red-400"
                            }`}>
                              {verifyResult.status}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Target Email</p>
                            <p className="text-zinc-200 font-bold font-mono text-[11px] break-all">{verifyResult.email}</p>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] text-zinc-500 uppercase tracking-widest">
                              <span>Deliverability Score</span>
                              <span className="text-zinc-300 font-bold">{verifyResult.verification_score}/100</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  verifyResult.status === "valid" ? "bg-emerald-500" : "bg-red-500"
                                }`}
                                style={{ width: `${verifyResult.verification_score}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/60 pt-3">
                            <button
                              onClick={() => setVerifyResult(null)}
                              className="py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-400 rounded font-bold uppercase text-[9px] cursor-pointer transition-all hover:text-zinc-200"
                            >
                              Verify Another
                            </button>
                            {verifyResult.status === "valid" && (
                              <button
                                onClick={handleVerifySidebar}
                                className="py-1.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 border border-[#10b981]/40 text-[#10b981] rounded font-bold uppercase text-[9px] cursor-pointer transition-all flex items-center justify-center space-x-1"
                              >
                                <Save className="w-3 h-3" />
                                <span>Save Status</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="px-5 py-3 border-t border-zinc-800 bg-[#0c0c0f] flex justify-between items-center">
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">
                  ID: {lead.lead_id.slice(0, 8)}…
                </span>
                <QuotationTrigger
                  clientName={name}
                  industry={industry}
                  proposedBudget={lead.raw_payload?.budget || "Not Specified"}
                  serviceType="Architecture & Development"
                />
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
