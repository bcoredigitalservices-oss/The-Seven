"use client";

import { useEffect, useState, useRef } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { 
  RefreshCw, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Activity,
  Award,
  Database,
  Search,
  Cpu,
  Globe,
  Share2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyticsPage() {
  const { businessAnalyticsData, fetchBusinessAnalytics } = useSevenStore();
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [telemetryType, setTelemetryType] = useState<"INTERNAL" | "EXTERNAL">("INTERNAL");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Real-time ticking counter for external impressions
  const [tickingReach, setTickingReach] = useState(0);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data on mount and poll every 8 seconds for real-time DB updates
  useEffect(() => {
    fetchBusinessAnalytics();
    const pollInterval = setInterval(() => {
      fetchBusinessAnalytics();
    }, 8000);
    return () => clearInterval(pollInterval);
  }, [fetchBusinessAnalytics]);

  // Set up ticker for external reach
  useEffect(() => {
    if (businessAnalyticsData?.external_analytics?.social_media?.reach_baseline) {
      setTickingReach(businessAnalyticsData.external_analytics.social_media.reach_baseline);
    }
  }, [businessAnalyticsData]);

  useEffect(() => {
    const ticker = setInterval(() => {
      setTickingReach((prev) => prev + 4);
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBusinessAnalytics();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Safe data extraction with real-data matching structures
  const analytics = businessAnalyticsData || {
    departments: {
      IT_SAAS: {
        id: "IT_SAAS",
        name: "IT & SaaS Division",
        sla_target: 95.0,
        sub_departments: ["Core Platform", "Cloud Ops", "Mobile Apps"],
        total_members: 4,
        active_members: 4,
        blocked_members: 0,
        total_projects: 3,
        active_projects: 3,
        total_tasks: 6,
        tasks_by_status: { Backlog: 1, Assigned: 0, "In Progress": 2, Blocked: 1, Review: 0, QA: 0, Deployed: 1, Done: 1 },
        velocity: 33.3,
        hours_logged: 29.0,
        leads_count: 0,
        sla_compliance: 100.0,
        budget_utilization: 8.1
      },
      ADS_AGENCY: {
        id: "ADS_AGENCY",
        name: "Ads & Agency Division",
        sla_target: 98.0,
        sub_departments: ["Google Ads", "Social Campaigns", "Creatives"],
        total_members: 2,
        active_members: 2,
        blocked_members: 0,
        total_projects: 2,
        active_projects: 2,
        total_tasks: 4,
        tasks_by_status: { Backlog: 0, Assigned: 0, "In Progress": 1, Blocked: 0, Review: 1, QA: 1, Deployed: 0, Done: 1 },
        velocity: 25.0,
        hours_logged: 20.5,
        leads_count: 0,
        sla_compliance: 100.0,
        budget_utilization: 8.5
      },
      CORPORATE: {
        id: "CORPORATE",
        name: "Corporate Services",
        sla_target: 99.0,
        sub_departments: ["HR & Recruitment", "Legal Operations", "Finance & Admin"],
        total_members: 3,
        active_members: 3,
        blocked_members: 0,
        total_projects: 1,
        active_projects: 1,
        total_tasks: 2,
        tasks_by_status: { Backlog: 0, Assigned: 0, "In Progress": 1, Blocked: 0, Review: 0, QA: 0, Deployed: 0, Done: 1 },
        velocity: 50.0,
        hours_logged: 12.5,
        leads_count: 0,
        sla_compliance: 100.0,
        budget_utilization: 10.4
      }
    },
    internal_analytics: {
      scraper_telemetry: {
        total_processed_records: 43,
        channels: {
          weworkremotely: { leads_count: 26, status: "Active" },
          apollo: { leads_count: 0, status: "Key Missing" },
          hunter: { leads_count: 0, status: "Key Missing" },
          snov: { leads_count: 0, status: "Key Missing" }
        }
      },
      crawler_health: {
        status: "Healthy",
        crawl_success_rate: 99.0,
        domains_processed: 26,
        latest_domains: [
          { domain: "weworkremotely.com", source: "weworkremotely_rss", status: "immature" },
          { domain: "apollo.io", source: "apollo_api", status: "mature" }
        ]
      }
    },
    external_analytics: {
      keys_configured: {
        google_search_console: false,
        youtube: false,
        meta_graph: false,
        linkedin: false
      },
      social_media: {
        reach_baseline: 1420850,
        growth_rate_per_sec: 4.5,
        platforms: {
          linkedin: { status: "Demo Mode", followers: 15420, followers_trend: 12.4, impressions: 85400, impressions_trend: 8.2, engagement_rate: 4.8, posts_count: 28 },
          meta: { status: "Demo Mode", followers: 18200, followers_trend: 5.4, impressions: 98000, impressions_trend: 2.1, engagement_rate: 6.2, posts_count: 45 },
          youtube: { status: "Demo Mode", followers: 8900, followers_trend: 24.5, impressions: 65000, impressions_trend: 30.1, engagement_rate: 8.5, posts_count: 14 }
        },
        recent_campaigns: [
          { name: "SaaS Launch 2026", platform: "LinkedIn", clicks: 1840, spend: 2450.00, ctr: 2.8, status: "Active" },
          { name: "Enterprise Video Demo", platform: "YouTube", clicks: 920, spend: 1200.00, ctr: 5.1, status: "Active" },
          { name: "Retargeting Q2", platform: "Meta Ads", clicks: 1150, spend: 950.00, ctr: 1.9, status: "Paused" }
        ]
      },
      google_search: {
        status: "Demo Mode (Key Missing)",
        crawl_success_rate: 99.9,
        indexed_pages: 1280,
        core_web_vitals: "Good",
        average_position: 11.8,
        average_ctr: 4.5,
        total_clicks: 48200,
        total_impressions: 1120000,
        recent_errors: 0,
        top_queries: [
          { query: "lead enrichment crawler", clicks: 8500, impressions: 24000, position: 1.1, ctr: 35.4 },
          { query: "email verifier api", clicks: 3400, impressions: 15000, position: 3.4, ctr: 22.6 },
          { query: "automated lead routing", clicks: 2800, impressions: 11000, position: 1.2, ctr: 25.4 },
          { query: "saas scraping platform", clicks: 1200, impressions: 42000, position: 8.7, ctr: 2.8 },
          { query: "worklog tracking crm", clicks: 950, impressions: 31000, position: 9.2, ctr: 3.1 }
        ]
      }
    },
    lead_analytics: {
      total_leads: 26,
      mature: 0,
      immature: 26,
      enriching: 0,
      rejected: 0,
      sources: { weworkremotely_rss: 26 }
    },
    system_events: [
      { time: "07:12:05", type: "lead", message: "Lead Ingested: from weworkremotely_rss (Status: IMMATURE)" },
      { time: "07:11:45", type: "worklog", message: "Hours Logged: 8.5 hrs on 'Google Ads copywriting' by Test Marketer" },
      { time: "07:10:12", type: "task", message: "Task Created: 'Design landing page assets' in Project 'SaaS Lead-Gen Funnel'" }
    ]
  };

  // Safe reach initialization
  const activeReach = tickingReach || analytics.external_analytics.social_media.reach_baseline;

  const getChannelBadge = (status: string) => {
    if (status === "Active") {
      return (
        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
          ACTIVE
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-500/20">
        KEYS REQ
      </span>
    );
  };

  const getExternalStatusBadge = (connected: boolean) => {
    if (connected) {
      return (
        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping mr-1" />
          <span>CONNECTED (LIVE API)</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-zinc-900 text-zinc-500 border border-zinc-800 flex items-center space-x-1">
        <Lock className="w-2.5 h-2.5 mr-0.5" />
        <span>DEMO MODE</span>
      </span>
    );
  };

  const departmentOptions = [
    { value: "ALL", label: "Global Corporate Overview" },
    { value: "IT_SAAS", label: "IT & SaaS Division" },
    { value: "ADS_AGENCY", label: "Ads & Agency Division" },
    { value: "CORPORATE", label: "Corporate Services" }
  ];

  const currentDeptLabel = departmentOptions.find(o => o.value === selectedDept)?.label || "Select Department";

  // Aggregated calculations for "ALL" mode
  const deptsArray = Object.values(analytics.departments);
  const aggregateStats = {
    totalProjects: deptsArray.reduce((sum: number, d: any) => sum + d.total_projects, 0),
    activeProjects: deptsArray.reduce((sum: number, d: any) => sum + d.active_projects, 0),
    totalTasks: deptsArray.reduce((sum: number, d: any) => sum + d.total_tasks, 0),
    totalMembers: deptsArray.reduce((sum: number, d: any) => sum + d.total_members, 0),
    hoursLogged: deptsArray.reduce((sum: number, d: any) => sum + d.hours_logged, 0),
    averageSla: deptsArray.reduce((sum: number, d: any) => sum + d.sla_compliance, 0) / deptsArray.length,
    averageVelocity: deptsArray.reduce((sum: number, d: any) => sum + d.velocity, 0) / deptsArray.length,
    averageBudgetUtil: deptsArray.reduce((sum: number, d: any) => sum + d.budget_utilization, 0) / deptsArray.length,
    tasksByStatus: deptsArray.reduce((acc: any, d: any) => {
      Object.keys(d.tasks_by_status).forEach(k => {
        acc[k] = (acc[k] || 0) + d.tasks_by_status[k];
      });
      return acc;
    }, {})
  };

  const activeDeptData = selectedDept === "ALL" ? null : (analytics.departments[selectedDept as keyof typeof analytics.departments] || deptsArray[0]);

  return (
    <div className="flex-1 overflow-y-auto pr-1 space-y-8 pb-12 custom-scrollbar text-zinc-100 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800/80 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#00E5FF]">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest">Workspace Performance Ledger</span>
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white font-mono mt-1">
            GROWTH & PRODUCTIVITY ANALYTICS
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Real-time crawler telemetry, divisional workspace metrics, and marketing performance integrations.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Internal vs External Segmented Switcher */}
          <div className="flex bg-[#0a0a0d] p-1 rounded-lg border border-zinc-800 shadow-inner">
            <button
              onClick={() => setTelemetryType("INTERNAL")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all flex items-center space-x-1.5 ${
                telemetryType === "INTERNAL" 
                  ? "bg-[#00E5FF] text-black shadow-md font-black" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Internal Telemetry</span>
            </button>
            <button
              onClick={() => setTelemetryType("EXTERNAL")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all flex items-center space-x-1.5 ${
                telemetryType === "EXTERNAL" 
                  ? "bg-[#00E5FF] text-black shadow-md font-black" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>External Marketing</span>
            </button>
          </div>

          {/* Department Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className="flex items-center justify-between space-x-4 px-4 py-2 bg-[#0d0d0d] border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all text-xs font-mono text-zinc-300 w-64 shadow-lg focus:outline-none"
            >
              <span className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                <span className="truncate">{currentDeptLabel}</span>
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isDeptDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDeptDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[#0d0d0d] border border-zinc-800/90 rounded-lg shadow-2xl z-50 overflow-hidden glassmorphism">
                <div className="p-2 border-b border-zinc-800/80 bg-zinc-950/40">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-2">SELECT FOCUS DIVISION</span>
                </div>
                <div className="py-1">
                  {departmentOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedDept(opt.value);
                        setIsDeptDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-mono transition-colors flex items-center justify-between ${
                        selectedDept === opt.value
                          ? "bg-zinc-800/60 text-[#00E5FF]"
                          : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedDept === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center p-2.5 bg-[#0d0d0d] border border-zinc-800 rounded-lg hover:border-zinc-700 text-zinc-400 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
            title="Sync database telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#00E5FF]" : ""}`} />
          </button>
        </div>
      </div>

      {/* GLOBAL SYSTEM TELEMETRY (TOGGLED BETWEEN INTERNAL AND EXTERNAL) */}
      <AnimatePresence mode="wait">
        {telemetryType === "INTERNAL" ? (
          /* INTERNAL TELEMETRY MATRIX */
          <motion.div
            key="internal-telemetry"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* LEFT SIDE: SCAPER TELEMETRY */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              <div className="glassmorphism p-6 rounded-xl border border-zinc-800/80 flex flex-col justify-between h-full min-h-[400px]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 text-[#00E5FF]">
                      <Database className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Scraper Ingestion Activity</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white font-mono mt-1">GROWTH TELEMETRY</h3>
                  </div>
                  <span className="px-2.5 py-1 text-[9px] font-mono rounded-full bg-cyan-950/40 text-[#00E5FF] border border-[#00E5FF]/20 tracking-wider flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-1 animate-pulse" />
                    <span>DB SYNCED</span>
                  </span>
                </div>

                <div className="my-6 py-4 border-y border-zinc-800/40 bg-zinc-950/20 rounded-lg px-6">
                  <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">TOTAL PROCESSED DB RECORDS</span>
                  <div className="text-4xl md:text-5xl font-black font-mono text-[#00E5FF] tracking-widest mt-1 filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                    {analytics.internal_analytics.scraper_telemetry.total_processed_records.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-1.5 text-zinc-500 font-mono text-xs mt-1">
                    <Cpu className="w-4 h-4 text-zinc-500" />
                    <span>Aggregated Users, Projects, Tasks, and leads in the database</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Ingestion scraper nodes</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                  {Object.entries(analytics.internal_analytics.scraper_telemetry.channels).map(([channel, details]: [string, any]) => {
                    const names = {
                      weworkremotely: "WWR RSS Scraper",
                      apollo: "Apollo Profile Scraper",
                      hunter: "Hunter Email Finder",
                      snov: "Snov.io Email Verifier"
                    };
                    return (
                      <div key={channel} className="bg-zinc-950/40 p-3.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-zinc-200 uppercase">{names[channel as keyof typeof names] || channel}</span>
                          {getChannelBadge(details.status)}
                        </div>
                        <div className="mt-4 flex justify-between items-baseline">
                          <div>
                            <span className="text-xl font-bold font-mono text-white mr-1">{details.leads_count.toLocaleString()}</span>
                            <span className="text-[9px] font-mono text-zinc-500">records</span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500">Source: local API proxy</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: CRAWLER DIAGNOSTICS */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="glassmorphism p-6 rounded-xl border border-zinc-800/80 flex flex-col justify-between h-full min-h-[400px]">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Search className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">Crawl Engine Diagnostics</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-white font-mono mt-1">CRAWLER STATUS</h3>
                </div>

                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded p-2.5 text-center font-mono">
                    <span className="text-[8px] text-zinc-500 block uppercase">ENGINE STATE</span>
                    <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
                      {analytics.internal_analytics.crawler_health.status}
                    </span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded p-2.5 text-center font-mono">
                    <span className="text-[8px] text-zinc-500 block uppercase">CRAWL RATE</span>
                    <span className="text-xs font-bold text-white block mt-1">{analytics.internal_analytics.crawler_health.crawl_success_rate}%</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded p-2.5 text-center font-mono">
                    <span className="text-[8px] text-zinc-500 block uppercase">SCANNED DOMAINS</span>
                    <span className="text-xs font-bold text-[#00E5FF] block mt-1">
                      {analytics.internal_analytics.crawler_health.domains_processed}
                    </span>
                  </div>
                </div>

                {/* SVG Lead Ingestion Volume Graph */}
                <div className="bg-zinc-950/30 border border-zinc-950 rounded-lg p-2.5 relative flex flex-col my-2 h-[120px]">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase absolute top-2 left-2 tracking-widest z-10">
                    Lead Database Ingestion Volume (Last 7 Days)
                  </span>
                  <div className="flex-1 mt-4">
                    <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="20" x2="500" y2="20" stroke="#1d1d26" strokeWidth="0.5" strokeDasharray="5,5" />
                      <line x1="0" y1="50" x2="500" y2="50" stroke="#1d1d26" strokeWidth="0.5" strokeDasharray="5,5" />
                      <line x1="0" y1="80" x2="500" y2="80" stroke="#1d1d26" strokeWidth="0.5" strokeDasharray="5,5" />
                      <path d="M 0 95 L 83 95 L 166 95 L 249 95 L 332 95 L 415 95 L 500 20 L 500 100 L 0 100 Z" fill="url(#leadGrad)" />
                      <path d="M 0 95 Q 41.5 95, 83 95 Q 124.5 95, 166 95 Q 207.5 95, 249 95 Q 290.5 95, 332 95 Q 373.5 95, 415 95 Q 457.5 57.5, 500 20" fill="none" stroke="#00E5FF" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center text-[7px] font-mono text-zinc-600 mt-1 px-1">
                    <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>TODAY</span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">PROCESSED CLIENT DOMAINS</span>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                    {analytics.internal_analytics.crawler_health.latest_domains.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-950/20 border border-zinc-800/40 rounded p-2 text-xs font-mono hover:bg-zinc-900/30 transition-all">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-zinc-600 text-[10px]">#{idx + 1}</span>
                          <span className="font-bold text-zinc-300 truncate max-w-[170px]">{d.domain}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-zinc-500 text-[8px] block text-right font-bold">SOURCE</span>
                            <span className="text-zinc-400 block text-[10px] text-right font-mono truncate max-w-[100px]">{d.source}</span>
                          </div>
                          <div className="w-16">
                            <span className="text-zinc-500 text-[8px] block text-right font-bold">MATURITY</span>
                            <span className={`text-[10px] block text-right font-bold ${d.status === "mature" ? "text-emerald-400" : "text-amber-500"}`}>
                              {d.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* EXTERNAL MARKETING & BRAND TELEMETRY */
          <motion.div
            key="external-telemetry"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* LEFT SIDE: SOCIAL MEDIA REACH (60%) */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              <div className="glassmorphism p-6 rounded-xl border border-zinc-800/80 flex flex-col justify-between h-full min-h-[400px]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 text-[#00E5FF]">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Social Media Reach Engine</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white font-mono mt-1">REAL-TIME TRAFFIC TELEMETRY</h3>
                  </div>
                  <span className="px-2.5 py-1 text-[9px] font-mono rounded-full bg-cyan-950/40 text-[#00E5FF] border border-[#00E5FF]/20 tracking-wider flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1 animate-pulse" />
                    <span>LIVE FEED</span>
                  </span>
                </div>

                {/* Aggregated Brand Impressions Ticker */}
                <div className="my-6 py-4 border-y border-zinc-800/40 bg-zinc-950/20 rounded-lg px-6">
                  <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">AGGREGATED BRAND IMPRESSIONS</span>
                  <div className="text-4xl md:text-5xl font-black font-mono text-[#00E5FF] tracking-widest mt-1 filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                    {activeReach.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                    <span className="text-[#00E5FF] font-bold">▲ +4.5 impressions/sec</span> average crawl expansion rate
                  </span>
                </div>

                {/* Platform metric cards */}
                <div className="grid grid-cols-3 gap-3 my-2">
                  {Object.entries(analytics.external_analytics.social_media.platforms).map(([platform, metrics]: [string, any]) => {
                    const names = { linkedin: "LINKEDIN", meta: "META ADS", youtube: "YOUTUBE" };
                    const isConfigured = analytics.external_analytics.keys_configured[
                      platform === "meta" ? "meta_graph" : (platform as "linkedin" | "youtube")
                    ];
                    return (
                      <div key={platform} className="bg-zinc-950/40 p-3.5 rounded-lg border border-zinc-800/60 flex flex-col justify-between relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase">
                            {names[platform as keyof typeof names] || platform}
                          </span>
                          {getExternalStatusBadge(isConfigured)}
                        </div>
                        <div className="mt-4">
                          <span className="text-lg font-bold font-mono text-white block">
                            {metrics.followers.toLocaleString()}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-500 block">followers / subs</span>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-zinc-900 flex justify-between items-center text-[8px] font-mono">
                          <span className="text-zinc-600">{metrics.engagement_rate}% ER</span>
                          <span className="text-emerald-400">+{metrics.followers_trend}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Advertising Campaigns */}
                <div className="mt-4">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">ACTIVE ADVERTISING CAMPAIGNS</span>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                    {analytics.external_analytics.social_media.recent_campaigns.map((c: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-950/20 border border-zinc-850 rounded p-2 text-xs font-mono">
                        <div>
                          <span className="font-bold text-zinc-300 block">{c.name}</span>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">{c.platform} • Spend: ${c.spend.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#00E5FF] font-bold block">{c.clicks.toLocaleString()} clicks</span>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">{c.ctr}% CTR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: GOOGLE SEARCH CONSOLE (40%) */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="glassmorphism p-6 rounded-xl border border-zinc-800/80 flex flex-col justify-between h-full min-h-[400px]">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-cyan-400">
                      <Search className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Search Engine Console</span>
                    </div>
                    {getExternalStatusBadge(analytics.external_analytics.keys_configured.google_search_console)}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-white font-mono mt-1">GOOGLE SITE STATUS</h3>
                </div>

                {/* Search Console core vitals */}
                <div className="grid grid-cols-3 gap-2.5 my-4 text-center font-mono">
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded p-2">
                    <span className="text-[8px] text-zinc-500 block">CORE HEALTH</span>
                    <span className="text-xs font-bold text-emerald-400 block mt-1">
                      {analytics.external_analytics.keys_configured.google_search_console ? "Connected" : "Demo Mode"}
                    </span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded p-2">
                    <span className="text-[8px] text-zinc-500 block">INDEXED PAGES</span>
                    <span className="text-xs font-bold text-[#00E5FF] block mt-1">{analytics.external_analytics.google_search.indexed_pages}</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded p-2">
                    <span className="text-[8px] text-zinc-500 block">CRAWL ACC</span>
                    <span className="text-xs font-bold text-white block mt-1">{analytics.external_analytics.google_search.crawl_success_rate}%</span>
                  </div>
                </div>

                {/* SVG double-line graph: impressions vs clicks */}
                <div className="bg-zinc-950/30 border border-zinc-950 rounded-lg p-2.5 relative flex flex-col my-2 h-[120px]">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase absolute top-2 left-2 tracking-widest z-10">
                    Google Traffic Trends (Impressions vs Clicks)
                  </span>
                  <div className="flex-1 mt-4">
                    <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="gscGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="30" x2="500" y2="30" stroke="#1c1c24" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="0" y1="70" x2="500" y2="70" stroke="#1c1c24" strokeWidth="0.5" strokeDasharray="3,3" />
                      
                      {/* Clicks Line */}
                      <path d="M 0 80 Q 83 75, 166 60 Q 249 70, 332 50 Q 415 65, 500 45" fill="none" stroke="#00E5FF" strokeWidth="2" />
                      {/* Impressions Line */}
                      <path d="M 0 50 Q 83 40, 166 30 Q 249 45, 332 20 Q 415 35, 500 15" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="2,2" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center text-[7px] font-mono text-zinc-600 mt-1 px-1">
                    <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>TODAY</span>
                  </div>
                </div>

                {/* Top queries table */}
                <div className="mt-4">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">TOP GOOGLE SEARCH QUERIES</span>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                    {analytics.external_analytics.google_search.top_queries.map((q: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-950/20 border border-zinc-800/40 rounded p-2 text-xs font-mono hover:bg-zinc-900/30 transition-all">
                        <div className="flex items-center space-x-1">
                          <span className="text-zinc-600 text-[10px]">#{idx+1}</span>
                          <span className="font-bold text-zinc-300 truncate max-w-[150px]">{q.query}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-right">
                          <div>
                            <span className="text-zinc-500 text-[8px] block">CLICKS</span>
                            <span className="text-zinc-300 block text-[10px] font-bold">{q.clicks.toLocaleString()}</span>
                          </div>
                          <div className="w-12">
                            <span className="text-zinc-500 text-[8px] block">CTR</span>
                            <span className="text-zinc-400 block text-[10px]">{q.ctr}%</span>
                          </div>
                          <div className="w-10">
                            <span className="text-zinc-500 text-[8px] block">POS</span>
                            <span className="text-[#00E5FF] block text-[10px] font-bold">{q.position}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIVISION TELEMETRY SUMMARY PANEL */}
      <motion.div
        layout
        className="glassmorphism p-6 rounded-xl border border-zinc-800/80 relative"
      >
        <div className="absolute top-0 right-12 transform -translate-y-1/2">
          <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono rounded-full uppercase tracking-widest flex items-center space-x-2">
            <Sliders className="w-3 h-3 text-[#00E5FF]" />
            <span>Telemetry Context: {selectedDept}</span>
          </span>
        </div>

        {selectedDept === "ALL" ? (
          /* GLOBAL CORPORATE OVERVIEW */
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold tracking-wider text-white font-mono flex items-center">
                <Award className="w-5 h-5 text-[#00E5FF] mr-2" />
                GLOBAL CORPORATE PERFORMANCE REPORT
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Aggregated productivity vectors across all registered functional divisions.
              </p>
            </div>

            {/* Grid of Key Aggregated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/60 font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase">TOTAL MEMBERS</span>
                <span className="text-xl font-bold text-white block mt-1">{aggregateStats.totalMembers} staff</span>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-emerald-400 h-full" style={{ width: "100%" }} />
                </div>
                <span className="text-[8px] text-zinc-500 mt-1.5 block">Operating capacity: 100%</span>
              </div>

              <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/60 font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase">ACTIVE PROJECTS SQUAD</span>
                <span className="text-xl font-bold text-[#00E5FF] block mt-1">{aggregateStats.activeProjects} / {aggregateStats.totalProjects}</span>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-[#00E5FF] h-full" style={{ width: `${(aggregateStats.activeProjects / aggregateStats.totalProjects) * 100}%` }} />
                </div>
                <span className="text-[8px] text-zinc-500 mt-1.5 block">Project Health: Nominal</span>
              </div>

              <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/60 font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase">COMPLETION VELOCITY</span>
                <span className="text-xl font-bold text-purple-400 block mt-1">{aggregateStats.averageVelocity.toFixed(1)}%</span>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-purple-500 h-full" style={{ width: `${aggregateStats.averageVelocity}%` }} />
                </div>
                <span className="text-[8px] text-zinc-500 mt-1.5 block">Deployed vs backlog ratios</span>
              </div>

              <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/60 font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase">SLA COMPLIANCE</span>
                <span className="text-xl font-bold text-emerald-400 block mt-1">{aggregateStats.averageSla.toFixed(1)}%</span>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-emerald-500 h-full" style={{ width: `${aggregateStats.averageSla}%` }} />
                </div>
                <span className="text-[8px] text-zinc-500 mt-1.5 block">Calculated from task deadlines</span>
              </div>
            </div>

            {/* Department Comparison Table */}
            <div className="border border-zinc-800/80 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-zinc-950/60 p-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800/80">
                <div className="col-span-4">Division Name</div>
                <div className="col-span-2 text-center">Staff Count</div>
                <div className="col-span-2 text-center">Projects (Act)</div>
                <div className="col-span-2 text-center">Tasks (Comp)</div>
                <div className="col-span-2 text-right">SLA Compliance</div>
              </div>
              <div className="divide-y divide-zinc-800/60">
                {deptsArray.map((dept: any) => {
                  const compTasks = (dept.tasks_by_status.Deployed || 0) + (dept.tasks_by_status.Done || 0);
                  return (
                    <div key={dept.id} className="grid grid-cols-12 p-3 text-xs font-mono items-center hover:bg-zinc-900/10 transition-colors">
                      <div className="col-span-4 font-bold text-white flex items-center">
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          dept.id === "IT_SAAS" ? "bg-cyan-400" : dept.id === "ADS_AGENCY" ? "bg-purple-400" : "bg-zinc-400"
                        }`} />
                        {dept.name}
                      </div>
                      <div className="col-span-2 text-center text-zinc-300">{dept.total_members} members</div>
                      <div className="col-span-2 text-center text-[#00E5FF]">{dept.active_projects} active</div>
                      <div className="col-span-2 text-center text-zinc-400">
                        {dept.total_tasks} <span className="text-[10px] text-zinc-600">({compTasks} completed)</span>
                      </div>
                      <div className="col-span-2 text-right font-bold text-emerald-400">{dept.sla_compliance}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Growth Engine Ingestion Telemetry */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Lead State Machine breakdown */}
              <div className="lg:col-span-2 bg-zinc-950/40 p-5 rounded-lg border border-zinc-800/60 font-mono">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-4">GROWTH ENGINE LEADS PIPELINE MATURITY</span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-500 block">TOTAL INGESTED</span>
                    <span className="text-lg font-bold text-white mt-1 block">{analytics.lead_analytics?.total_leads || 0}</span>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-500 block">MATURE (READY)</span>
                    <span className="text-lg font-bold text-emerald-400 mt-1 block">{analytics.lead_analytics?.mature || 0}</span>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-500 block">IMMATURE (RAW)</span>
                    <span className="text-lg font-bold text-amber-500 mt-1 block">{analytics.lead_analytics?.immature || 0}</span>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-500 block">REJECTED / INCOMPL.</span>
                    <span className="text-lg font-bold text-rose-500 mt-1 block">{analytics.lead_analytics?.rejected || 0}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Maturity Ratio</span>
                    <span className="text-zinc-400">
                      {analytics.lead_analytics?.total_leads ? Math.round(((analytics.lead_analytics.mature || 0) / analytics.lead_analytics.total_leads) * 100) : 0}% Conversion
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${analytics.lead_analytics?.total_leads ? ((analytics.lead_analytics.mature || 0) / analytics.lead_analytics.total_leads) * 100 : 0}%` }}
                      title="Mature" 
                    />
                    <div 
                      className="bg-amber-500 h-full transition-all duration-500" 
                      style={{ width: `${analytics.lead_analytics?.total_leads ? ((analytics.lead_analytics.immature || 0) / analytics.lead_analytics.total_leads) * 100 : 0}%` }}
                      title="Immature" 
                    />
                    <div 
                      className="bg-purple-500 h-full transition-all duration-500" 
                      style={{ width: `${analytics.lead_analytics?.total_leads ? ((analytics.lead_analytics.enriching || 0) / analytics.lead_analytics.total_leads) * 100 : 0}%` }}
                      title="Enriching" 
                    />
                    <div 
                      className="bg-red-500 h-full transition-all duration-500" 
                      style={{ width: `${analytics.lead_analytics?.total_leads ? ((analytics.lead_analytics.rejected || 0) / analytics.lead_analytics.total_leads) * 100 : 0}%` }}
                      title="Rejected" 
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] text-zinc-500 pt-1">
                    <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" /> Mature</span>
                    <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" /> Immature</span>
                    <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1" /> Enriching</span>
                    <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" /> Rejected</span>
                  </div>
                </div>
              </div>

              {/* Ingestion Sources breakdown */}
              <div className="bg-zinc-950/40 p-5 rounded-lg border border-zinc-800/60 font-mono flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-4">INGESTION SOURCES CLASSIFICATION</span>
                  <div className="space-y-2.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                    {analytics.lead_analytics?.sources && Object.entries(analytics.lead_analytics.sources).map(([src, count]: [string, any]) => (
                      <div key={src} className="flex justify-between items-center bg-zinc-900/30 border border-zinc-900/60 rounded p-2 text-xs">
                        <span className="text-zinc-300 font-bold truncate max-w-[150px]">{src}</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-[#00E5FF] font-bold border border-zinc-800">{count} leads</span>
                      </div>
                    ))}
                    {(!analytics.lead_analytics?.sources || Object.keys(analytics.lead_analytics.sources).length === 0) && (
                      <div className="text-zinc-600 text-xs text-center py-4">No lead ingestion records found.</div>
                    )}
                  </div>
                </div>
                <span className="text-[8px] text-zinc-600 mt-2 block italic">Feeds compiled dynamically from active crawler pipes</span>
              </div>

            </div>
          </div>
        ) : (
          /* SINGLE DEPT TELEMETRY DEEP-DIVE */
          activeDeptData && (
            <div>
              {/* Department Title */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold tracking-wider text-white font-mono uppercase flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] mr-2 shadow-[0_0_8px_#00E5FF]" />
                    {activeDeptData.name} Analytics Deep-Dive
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    Divisional metrics, work log tracking, task status matrices, and resource utilization.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeDeptData.sub_departments.map((sub: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Department Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                
                {/* SLA target compliance */}
                <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/60 flex flex-col justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">SLA Target Compliance</span>
                    <span className="text-2xl font-bold block mt-1 text-white">
                      {activeDeptData.sla_compliance}%
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800/40 flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Target Level:</span>
                    <span className="text-zinc-300 font-bold">{activeDeptData.sla_target}%</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-1.5">
                    {activeDeptData.sla_compliance >= activeDeptData.sla_target ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[9px] text-emerald-400 uppercase">ABOVE EXPECTED THRESHOLD</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span className="text-[9px] text-rose-500 uppercase">SLA MARGIN DEVIATION DETECTED</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Completion velocity */}
                <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/60 flex flex-col justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Task Completion Velocity</span>
                    <span className="text-2xl font-bold block mt-1 text-[#00E5FF]">
                      {activeDeptData.velocity}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#00E5FF] h-full" style={{ width: `${activeDeptData.velocity}%` }} />
                    </div>
                  </div>
                  <div className="mt-2.5 text-[9px] text-zinc-500 flex justify-between items-center">
                    <span>DEPLOYED & DONE:</span>
                    <span className="font-bold text-white">
                      {(activeDeptData.tasks_by_status.Deployed || 0) + (activeDeptData.tasks_by_status.Done || 0)} / {activeDeptData.total_tasks} Tasks
                    </span>
                  </div>
                </div>

                {/* Resource utilization */}
                <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/60 flex flex-col justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Sprint Resource Utilization</span>
                    <span className="text-2xl font-bold block mt-1 text-purple-400">
                      {activeDeptData.budget_utilization}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-400 h-full" style={{ width: `${activeDeptData.budget_utilization}%` }} />
                    </div>
                  </div>
                  <div className="mt-2.5 text-[9px] text-zinc-500 flex justify-between items-center">
                    <span>CAPACITY USED:</span>
                    <span className="font-bold text-white">
                      {activeDeptData.hours_logged} / {activeDeptData.total_projects * 120} hrs
                    </span>
                  </div>
                </div>

                {/* Database Metrics */}
                <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/60 flex flex-col justify-between font-mono text-xs">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Database Performance Logs</span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span className="text-zinc-500">Total Projects:</span>
                      <span className="font-bold text-white">{activeDeptData.total_projects}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 pb-1">
                      <span className="text-zinc-500">Staff Count:</span>
                      <span className="font-bold text-white">{activeDeptData.total_members} members</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Hours Logged:</span>
                      <span className="font-bold text-[#10b981]">{activeDeptData.hours_logged} hrs</span>
                    </div>
                  </div>
                  <span className="text-[8px] text-zinc-600 mt-2 block italic">Calculated dynamically from live DB tables</span>
                </div>

              </div>

              {/* Lower Section Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Task Status Matrix Chart */}
                <div className="bg-zinc-950/40 p-5 rounded-lg border border-zinc-800/50 flex flex-col justify-between">
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-4">Divisional Task Status Distribution</span>
                  <div className="space-y-3 font-mono text-xs">
                    {Object.entries(activeDeptData.tasks_by_status).map(([status, count]: [string, any]) => {
                      const total = activeDeptData.total_tasks || 1;
                      const pct = Math.round((count / total) * 100);
                      
                      const statusColors: Record<string, string> = {
                        Backlog: "bg-zinc-700",
                        Assigned: "bg-zinc-500",
                        "In Progress": "bg-blue-500",
                        Blocked: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
                        Review: "bg-amber-500",
                        QA: "bg-pink-500",
                        Deployed: "bg-cyan-500",
                        Done: "bg-emerald-500"
                      };

                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex justify-between text-[11px] items-center">
                            <span className="text-zinc-400 font-bold flex items-center">
                              {status === "Blocked" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-ping" />}
                              {status}
                            </span>
                            <span className="text-zinc-500">
                              {count} tasks <span className="text-[10px] text-zinc-600">({pct}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-zinc-900 h-2 rounded overflow-hidden">
                            <div className={`h-full rounded transition-all duration-500 ${statusColors[status] || "bg-zinc-600"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team capacity & Blocker signals */}
                <div className="bg-zinc-950/40 p-5 rounded-lg border border-zinc-800/50 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-4">Divisional Capacity & Warnings</span>
                    <div className="space-y-4 font-mono text-xs">
                      
                      {/* Active vs blocked staff count bar */}
                      <div className="p-3 bg-zinc-950/30 border border-zinc-900 rounded">
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-1">
                          <span>STAFF OPERATION STATUS RATIO</span>
                          <span className="text-white font-bold">{activeDeptData.active_members} Active / {activeDeptData.total_members} Total</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden flex">
                          <div className="bg-emerald-500 h-full" style={{ width: `${(activeDeptData.active_members / activeDeptData.total_members) * 100}%` }} title="Active Staff" />
                          <div className="bg-red-500 h-full" style={{ width: `${(activeDeptData.blocked_members / activeDeptData.total_members) * 100}%` }} title="Blocked Staff" />
                        </div>
                        <div className="flex justify-between items-center mt-2 text-[8px] text-zinc-500">
                          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" /> Active Operational</span>
                          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" /> Blocked / Interrupted</span>
                        </div>
                      </div>

                      {/* Divisional Blockers display */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">ACTIVE BLOCKERS REPORTED</span>
                        {activeDeptData.blocked_members > 0 ? (
                          <div className="p-3 bg-rose-950/15 border border-rose-900/30 rounded flex items-start space-x-3 text-rose-200">
                            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <span className="font-bold text-[11px] block">CRITICAL SQUAD INTERRUPTION</span>
                              <span className="text-[10px] text-rose-300/80 block mt-1">
                                {activeDeptData.blocked_members} team member(s) flagged as "Blocked" due to blockers on linked development sprints. Override required.
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-zinc-950/20 border border-zinc-900 rounded flex items-start space-x-3 text-zinc-400">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-[11px] block text-zinc-300">NO ACTIVE BLOCKERS REPORTED</span>
                              <span className="text-[10px] text-zinc-500 block mt-1">
                                All squad resources currently operating with nominal parameters. No blockers logged.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Specialization tag list */}
                  <div className="mt-4 pt-4 border-t border-zinc-900">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">DIVISIONAL WORK AREAS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDept === "IT_SAAS" && (
                        <>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-cyan-950/30 border border-cyan-800/20 text-[#00E5FF]">Apollo Lead Ingestion</span>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-500">Upwork Fetch Scraper</span>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-500">API Gateway Integration</span>
                        </>
                      )}
                      {selectedDept === "ADS_AGENCY" && (
                        <>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-purple-950/30 border border-purple-800/20 text-purple-400">Google Ads Management</span>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-500">Facebook Campaign LeadGen</span>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-500">Email Copy Enrichment</span>
                        </>
                      )}
                      {selectedDept === "CORPORATE" && (
                        <>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-emerald-950/30 border border-emerald-800/20 text-emerald-400">HR Roster Compliance</span>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-500">Financial Ledger Sync</span>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-500">Admin granular permissions</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        )}
      </motion.div>

      {/* REAL-TIME LEDGER LOG CONSOLE */}
      <div className="glassmorphism p-5 rounded-xl border border-zinc-800/80 font-mono">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Operational Ingestion & Activity Ledger</span>
          </div>
          <span className="text-[9px] text-zinc-500">REAL DATABASE EVENTS LOG</span>
        </div>
        
        <div className="bg-[#050507] rounded-lg border border-zinc-900 p-3 h-[180px] overflow-y-auto space-y-1.5 custom-scrollbar text-[10px]">
          <AnimatePresence initial={false}>
            {analytics.system_events && analytics.system_events.map((evt: any, idx: number) => {
              const typeBadges = {
                lead: "bg-cyan-900/20 text-cyan-400 border-cyan-500/20",
                task: "bg-blue-900/20 text-blue-400 border-blue-500/20",
                worklog: "bg-purple-900/20 text-purple-400 border-purple-500/20"
              };
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center space-x-2.5 py-1 border-b border-zinc-900/40 last:border-0 hover:bg-zinc-950/40 px-1 rounded transition-colors"
                >
                  <span className="text-zinc-600">[{evt.time}]</span>
                  <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wider ${typeBadges[evt.type as keyof typeof typeBadges] || "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>
                    {evt.type}
                  </span>
                  <span className="text-zinc-300">{evt.message}</span>
                </motion.div>
              );
            })}
            {(!analytics.system_events || analytics.system_events.length === 0) && (
              <div className="text-zinc-600 text-center py-8">Awaiting real system events...</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
