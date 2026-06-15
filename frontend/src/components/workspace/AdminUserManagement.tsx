"use client";

import React, { useEffect, useState } from "react";
import { useSevenStore, UserProfile } from "@/store/useSevenStore";
import { Users, Shield, Edit2, X, Check, Search, Terminal, Plus, UserX, UserCheck, Trash2, Lock, Briefcase, Key, Crown } from "lucide-react";

const DEPARTMENT_STRUCTURE = {
  IT_SAAS: {
    "Software Engineering": ["Software Engineer"],
    "QA_Testing": ["QA Engineer"],
    "Product_Management": ["Product Manager"],
    "Data_AI_ML": ["Data Scientist"],
    "Infrastructure_DevOps": ["DevOps Engineer"],
    "Tech_Support": ["Support Lead"]
  },
  ADS_AGENCY: {
    "Creative_Production": ["Graphic Designer", "Copywriter", "Video Editor"],
    "Account_Management": ["Account Exec"],
    "Media_Digital_Strategy": ["Media Buyer", "Strategist"]
  },
  CORPORATE: {
    "Sales_BD": ["Sales Exec"],
    "Finance_Accounting": ["Accountant"],
    "HR": ["HR Manager"]
  },
  MARKETING: {
    "Digital_Marketing": ["SEO Specialist", "PPC Specialist"],
    "Content_Strategy": ["Content Writer", "Social Media Coordinator"],
    "Brand_Relations": ["PR Specialist"]
  }
};

const SPECIALIZATIONS = {
  IT_SAAS: ["Web", "Android", "iOS", "Java", "Python", "Security Auditor", "UX Research", "ML Engineer"],
  ADS_AGENCY: ["UI Design", "Motion Graphics", "SEO", "Influencer Mgt", "Ad Buying"],
  CORPORATE: ["General", "None"],
  MARKETING: ["Growth", "SEO", "Copywriting", "Branding", "Social Media", "None"]
};

type DepartmentKeys = keyof typeof DEPARTMENT_STRUCTURE;

export default function AdminUserManagement() {
  const { adminUsers, fetchAdminUsers, createUser, updateUserMetadata, projects, fetchProjects, updateProject } = useSevenStore();
  const [activeTab, setActiveTab] = useState<"internal" | "client">("internal");
  const [editingEntity, setEditingEntity] = useState<UserProfile | any | null>(null);
  const [managingPermissionsFor, setManagingPermissionsFor] = useState<UserProfile | any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<any>({ department: "IT_SAAS" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAdminUsers();
    fetchProjects();
  }, [fetchAdminUsers, fetchProjects]);

  // Handle department changes specifically for cascading UI
  const handleDepartmentChange = (newDept: string) => {
    handleChange("department", newDept);
    
    // Auto-cascade sub_department, specialization, and functional_role
    if (activeTab === "internal") {
      const subDepts = Object.keys(DEPARTMENT_STRUCTURE[newDept as DepartmentKeys] || {});
      const firstSubDept = subDepts[0] || "";
      const specs = SPECIALIZATIONS[newDept as keyof typeof SPECIALIZATIONS] || ["None"];
      const roles = (DEPARTMENT_STRUCTURE[newDept as DepartmentKeys] as Record<string, string[]>)?.[firstSubDept] || [];
      
      setFormData((prev: any) => ({
        ...prev,
        department: newDept,
        sub_department: firstSubDept,
        specialization: specs[0] || "None",
        functional_role: roles[0] || ""
      }));
    } else {
      const subDepts = Object.keys(DEPARTMENT_STRUCTURE[newDept as DepartmentKeys] || {});
      setFormData((prev: any) => ({
        ...prev,
        department: newDept,
        sub_department: subDepts[0] || ""
      }));
    }
  };

  const handleSubDepartmentChange = (newSubDept: string) => {
    handleChange("sub_department", newSubDept);
    if (activeTab === "internal" && formData.department) {
      const roles = (DEPARTMENT_STRUCTURE[formData.department as DepartmentKeys] as Record<string, string[]>)?.[newSubDept] || [];
      setFormData((prev: any) => ({
        ...prev,
        sub_department: newSubDept,
        functional_role: roles[0] || ""
      }));
    }
  };

  const handleEditClick = (entity: any) => {
    setIsCreating(false);
    setManagingPermissionsFor(null);
    setEditingEntity(entity);
    if (activeTab === "internal") {
      setFormData({
        full_name: entity.full_name || "",
        email: entity.email || "",
        department: entity.department || "IT_SAAS",
        sub_department: entity.sub_department || "Software Engineering",
        functional_role: entity.functional_role || "Software Engineer",
        specialization: entity.specialization || "Web",
        seniority_level: entity.seniority_level || "Mid-Level",
        user_type: entity.user_type || "Employee",
        isBlocked: entity.current_status === "Blocked"
      });
    } else {
      const clientProj = (projects || []).find(p => p.client_id === entity.user_id);
      setFormData({
        full_name: entity.full_name || "",
        email: entity.email || "",
        contact_no: entity.contact_no || "",
        organization: entity.organization || "",
        department: entity.department || "IT_SAAS",
        sub_department: entity.sub_department || "Software Engineering",
        project_associated: clientProj?.project_id || "",
        client_role: entity.client_role || "Standard Client",
        isBlocked: entity.current_status === "Blocked"
      });
    }
  };

  const handlePermissionsClick = (entity: any) => {
    setIsCreating(false);
    setEditingEntity(null);
    setManagingPermissionsFor(entity);
    const assignedProj = (projects || []).find(p => p.client_id === entity.user_id);
    setFormData({
      allowed_departments: [entity.department || ""].filter(Boolean),
      allotted_projects: [],
      selected_project_id: assignedProj?.project_id || "",
      assigned_client_id: entity.user_type === "Client" ? entity.user_id : (assignedProj?.client_id || "")
    });
  };

  const handleCreateNewClick = () => {
    setEditingEntity(null);
    setManagingPermissionsFor(null);
    setIsCreating(true);
    if (activeTab === "internal") {
      setFormData({
        full_name: "",
        email: "",
        department: "IT_SAAS",
        sub_department: "Software Engineering",
        functional_role: "Software Engineer",
        specialization: "Web",
        seniority_level: "Mid-Level",
        user_type: "Employee",
        isBlocked: false
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        contact_no: "",
        organization: "",
        department: "IT_SAAS",
        sub_department: "Software Engineering",
        project_associated: "",
        client_role: "Standard Client",
        isBlocked: false
      });
    }
  };

  const handleClose = () => {
    setEditingEntity(null);
    setIsCreating(false);
    setManagingPermissionsFor(null);
    setFormData({ department: "IT_SAAS" });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, value: string) => {
    setFormData((prev: any) => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item: string) => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Example Payload Submission Hook
    const targetId = editingEntity?.user_id || managingPermissionsFor?.user_id;
    
    if (isCreating) {
      let role_tier = 3;
      if (formData.user_type === "CEO") role_tier = 1;
      else if (formData.user_type === "Department Lead") role_tier = 2;

      const payload = activeTab === "internal" ? {
        full_name: formData.full_name,
        email: formData.email,
        role_tier: role_tier,
        department_id: formData.user_type === "CEO" ? "EXEC" : formData.department,
        department: formData.user_type === "CEO" ? null : formData.department,
        sub_department: formData.user_type === "CEO" ? null : formData.sub_department,
        functional_role: formData.user_type === "CEO" ? null : formData.functional_role,
        specialization: formData.user_type === "CEO" ? null : formData.specialization,
        seniority_level: formData.user_type === "CEO" ? null : formData.seniority_level,
        user_type: formData.user_type || "Employee",
        current_status: "Active"
      } : {
        full_name: formData.full_name,
        email: formData.email,
        role_tier: 4,
        department_id: null,
        department: null,
        sub_department: null,
        functional_role: "Client",
        specialization: null,
        seniority_level: null,
        user_type: "Client",
        current_status: "Active"
      };

      const success = await createUser(payload);
      setIsSubmitting(false);
      if (success) {
        handleClose();
      }
    } else if (targetId) {
      // Mock passing form data or blocked statuses
      const payload = managingPermissionsFor ? {
        allowed_departments: formData.allowed_departments,
        allotted_projects: formData.allotted_projects
      } : {
        ...formData,
        current_status: formData.isBlocked ? "Blocked" : "Active"
      };

      if (managingPermissionsFor && formData.selected_project_id) {
        await updateProject(formData.selected_project_id, {
          client_id: formData.assigned_client_id || null
        });
      } else if (!managingPermissionsFor && activeTab === "client") {
        const oldProj = (projects || []).find(p => p.client_id === targetId);
        if (oldProj && oldProj.project_id !== formData.project_associated) {
          await updateProject(oldProj.project_id, { client_id: null });
        }
        if (formData.project_associated) {
          await updateProject(formData.project_associated, { client_id: targetId });
        }
      }

      const ok = await updateUserMetadata(targetId, payload);
      setIsSubmitting(false);
      if (ok) {
        handleClose();
      }
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this record?")) {
      handleClose();
    }
  };

  const internalUsers = adminUsers.filter(u => u.user_type !== "Client" && u.role_tier !== 4);
  const clientUsers = adminUsers.filter(u => u.user_type === "Client" || u.role_tier === 4);

  const displayedList = (activeTab === "internal" ? internalUsers : clientUsers).filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: adminUsers.length,
    active: adminUsers.filter(u => u.current_status !== 'Blocked').length,
    blocked: adminUsers.filter(u => u.current_status === 'Blocked').length,
    clients: clientUsers.length
  };

  const MOCK_DEPTS = ["IT_SAAS", "ADS_AGENCY", "CORPORATE", "MARKETING"];

  // Safely grab available sub-departments and roles
  const availableSubDepts = Object.keys(DEPARTMENT_STRUCTURE[formData.department as DepartmentKeys] || {});
  const availableRoles = ((DEPARTMENT_STRUCTURE[formData.department as DepartmentKeys] as Record<string, string[]>)?.[formData.sub_department] || []);
  const availableSpecs = SPECIALIZATIONS[formData.department as keyof typeof SPECIALIZATIONS] || ["None"];

  return (
    <div className="flex flex-col h-full bg-[#050505] p-6 rounded-lg border border-zinc-800 space-y-6">
      
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#00E5FF] tracking-widest font-mono uppercase flex items-center">
            <Shield className="w-5 h-5 mr-3 text-[#00E5FF]" />
            Root Console
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            GLOBAL IDENTITY & ACCESS MANAGEMENT
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-[#111] p-1 rounded-lg border border-zinc-800 font-mono text-xs font-bold">
            <button 
              onClick={() => { setActiveTab("internal"); handleClose(); }}
              className={`px-4 py-1.5 rounded transition-colors ${activeTab === 'internal' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Internal Operators
            </button>
            <button 
              onClick={() => { setActiveTab("client"); handleClose(); }}
              className={`px-4 py-1.5 rounded transition-colors ${activeTab === 'client' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Client Roster
            </button>
          </div>
          <div className="flex items-center space-x-2 bg-[#111] border border-zinc-800 px-3 py-1.5 rounded">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-zinc-300 outline-none font-mono text-xs w-32 placeholder:text-zinc-600"
            />
          </div>
          <button 
            onClick={handleCreateNewClick}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
              activeTab === 'internal' ? 'bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30' 
              : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === "internal" ? "New Operator" : "New Client"}</span>
          </button>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0f0f13] border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1 tracking-widest">Total Network Scope</div>
            <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
          </div>
          <div className="p-2 bg-zinc-900 rounded"><Users className="w-5 h-5 text-zinc-400" /></div>
        </div>
        <div className="bg-[#0f0f13] border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1 tracking-widest">Active Access</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.active}</div>
          </div>
          <div className="p-2 bg-emerald-950/30 rounded border border-emerald-500/20"><UserCheck className="w-5 h-5 text-emerald-400" /></div>
        </div>
        <div className="bg-[#0f0f13] border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1 tracking-widest">Blocked Accounts</div>
            <div className="text-2xl font-bold text-[#ff1744] font-mono">{stats.blocked}</div>
          </div>
          <div className="p-2 bg-[#ff1744]/10 rounded border border-[#ff1744]/20"><UserX className="w-5 h-5 text-[#ff1744]" /></div>
        </div>
        <div className="bg-[#0f0f13] border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1 tracking-widest">Total Clients</div>
            <div className="text-2xl font-bold text-purple-400 font-mono">{stats.clients}</div>
          </div>
          <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20"><Briefcase className="w-5 h-5 text-purple-400" /></div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex space-x-6 min-h-[400px]">
        
        {/* User/Client Data Grid */}
        <div className={`flex flex-col bg-[#0b0b0e] border border-zinc-900 rounded overflow-hidden transition-all duration-300 ${(editingEntity || isCreating || managingPermissionsFor) ? "w-[45%] xl:w-[50%]" : "w-full flex-1"}`}>
          <div className="bg-[#111] px-4 py-2 border-b border-zinc-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
              {activeTab === "internal" ? "Registered Operators" : "Registered Clients"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f0f13] border-b border-zinc-800 text-[10px] text-zinc-500 font-mono uppercase tracking-wider sticky top-0">
                  <th className="py-2 px-4">{activeTab === "internal" ? "Operator" : "Client Entity"}</th>
                  <th className="py-2 px-4">Org Context</th>
                  <th className="py-2 px-4">Access Status</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono">
                {displayedList.map((user) => (
                  <tr key={user.user_id} className={`border-b border-zinc-900 hover:bg-[#15151a] transition-colors ${(editingEntity?.user_id === user.user_id || managingPermissionsFor?.user_id === user.user_id) ? (activeTab==='internal' ? 'bg-[#15151a] border-l-2 border-l-[#00E5FF]' : 'bg-[#15151a] border-l-2 border-l-purple-500') : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-200 truncate max-w-[150px]">{user.full_name}</div>
                      <div className="text-zinc-500 text-[10px] truncate max-w-[150px]">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={activeTab === "internal" ? "text-[#00E5FF]" : "text-purple-400"}>{user.department || "UNASSIGNED"}</div>
                      <div className="text-zinc-500 text-[10px] truncate max-w-[100px]">{user.functional_role || user.user_type || "N/A"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${
                        user.current_status === 'Blocked' ? 'bg-[#ff1744]/10 border-[#ff1744]/30 text-[#ff1744]' :
                        'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}>
                        {user.current_status || "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Permissions Button */}
                        <button
                          onClick={() => handlePermissionsClick(user)}
                          title="Manage Permissions"
                          className={`${activeTab === 'internal' ? 'text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20' : 'text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20'} px-2 py-1 rounded transition-colors`}
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit Basic Info Button */}
                        <button
                          onClick={() => handleEditClick(user)}
                          title="Edit Identity"
                          className={`${activeTab === 'internal' ? 'text-[#00E5FF] hover:text-white bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20' : 'text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-500/20'} px-2 py-1 rounded transition-colors`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displayedList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-zinc-500 italic">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Right Side Pane (Edit/Create OR Manage Permissions) */}
        {(editingEntity || isCreating || managingPermissionsFor) && (
          <div className={`w-[55%] xl:w-[50%] bg-[#0a0a0c] border rounded flex flex-col overflow-hidden ${managingPermissionsFor ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : (activeTab === 'internal' ? 'border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.05)]' : 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.05)]')}`}>
            
            <div className={`px-4 py-3 border-b flex justify-between items-center shrink-0 ${managingPermissionsFor ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/20' : (activeTab === 'internal' ? 'bg-gradient-to-r from-[#00E5FF]/10 to-transparent border-[#00E5FF]/20' : 'bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/20')}`}>
              <span className={`text-xs font-mono font-bold uppercase flex items-center ${managingPermissionsFor ? 'text-amber-400' : (activeTab === 'internal' ? 'text-[#00E5FF]' : 'text-purple-400')}`}>
                {managingPermissionsFor ? (
                  <><Key className="w-4 h-4 mr-2" /> ROLE & PERMISSION MANAGER</>
                ) : (
                  <><Terminal className="w-4 h-4 mr-2" /> {isCreating ? (activeTab === 'internal' ? "PROVISION NEW OPERATOR" : "PROVISION NEW CLIENT") : "CONFIGURE IDENTITY & ACCESS"}</>
                )}
              </span>
              <button onClick={handleClose} className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 font-mono text-xs">
              
              {/* === PERMISSIONS MANAGER VIEW === */}
              {managingPermissionsFor && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 bg-[#111] p-3 rounded border border-zinc-800">
                    <Shield className="w-8 h-8 text-amber-500" />
                    <div>
                      <div className="font-bold text-zinc-200">{managingPermissionsFor.full_name}</div>
                      <div className="text-[10px] text-zinc-500">{managingPermissionsFor.email} | {managingPermissionsFor.user_type}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1 flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> Access Control Matrix
                    </h3>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Cross-Department Access (Allowed Departments)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {MOCK_DEPTS.map(dept => (
                          <label key={dept} className="flex items-center space-x-2 bg-[#111] border border-zinc-800 p-2 rounded cursor-pointer hover:border-amber-500/50">
                            <input type="checkbox" checked={(formData.allowed_departments || []).includes(dept)} onChange={() => toggleArrayItem("allowed_departments", dept)} className="accent-amber-500 bg-zinc-900 border-zinc-700" />
                            <span className="text-zinc-300">{dept}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-zinc-800/80">
                      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center">
                        <Briefcase className="w-3.5 h-3.5 mr-1" /> Project & Client Assignment
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Select Project</label>
                          <select 
                            value={formData.selected_project_id || ""} 
                            onChange={(e) => {
                              const projId = e.target.value;
                              const proj = (projects || []).find(p => p.project_id === projId);
                              handleChange("selected_project_id", projId);
                              if (managingPermissionsFor?.user_type === "Client") {
                                handleChange("assigned_client_id", managingPermissionsFor.user_id);
                              } else {
                                handleChange("assigned_client_id", proj?.client_id || "");
                              }
                            }} 
                            className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-amber-500"
                          >
                            <option value="">-- SELECT PROJECT --</option>
                            {(projects || []).map(proj => (
                              <option key={proj.project_id} value={proj.project_id}>
                                {proj.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Assign Client to Handle</label>
                          <select 
                            value={formData.assigned_client_id || ""} 
                            onChange={(e) => handleChange("assigned_client_id", e.target.value)} 
                            className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-amber-500"
                          >
                            <option value="">-- UNASSIGNED / NO CLIENT --</option>
                            {clientUsers.map(client => (
                              <option key={client.user_id} value={client.user_id}>
                                {client.full_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === INTERNAL OPERATOR CONFIG VIEW === */}
              {!managingPermissionsFor && activeTab === "internal" && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">Identity Specifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Full Name</label>
                        {isCreating ? (
                          <input type="text" required value={formData.full_name || ""} onChange={e => handleChange("full_name", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]" />
                        ) : (
                          <div className="text-zinc-300 font-bold bg-[#111] px-3 py-2 border border-zinc-800 rounded">{editingEntity?.full_name}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Email Address</label>
                        {isCreating ? (
                          <input type="email" required value={formData.email || ""} onChange={e => handleChange("email", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]" />
                        ) : (
                          <div className="text-zinc-400 bg-[#111] px-3 py-2 border border-zinc-800 rounded truncate">{editingEntity?.email}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">User Type</label>
                        <select
                          value={formData.user_type || "Employee"}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleChange("user_type", val);
                            if (val === "CEO") {
                              setFormData((prev: any) => ({
                                ...prev,
                                user_type: "CEO",
                                department: null,
                                sub_department: null,
                                functional_role: null,
                                specialization: null,
                                seniority_level: null,
                              }));
                            }
                          }}
                          className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]"
                        >
                          <option value="CEO">CEO</option>
                          <option value="Department Lead">Department Lead</option>
                          <option value="Employee">Employee</option>
                        </select>
                      </div>
                    </div>
                    {/* Department + Sub-Department + Role + Seniority + Specialization — locked for CEO */}
                    {formData.user_type === "CEO" ? (
                      <div className="col-span-2 flex items-center space-x-3 bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-4 py-3">
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Global Executive — No Department Assignment</p>
                          <p className="text-[9px] text-zinc-500 mt-0.5">Department, Sub-Department, Functional Role, Seniority Level, and Specialization are not applicable for the CEO role.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Department</label>
                            <select value={formData.department || "IT_SAAS"} onChange={(e) => handleDepartmentChange(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]">
                              {MOCK_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Sub-Department</label>
                            <select value={formData.sub_department || ""} onChange={(e) => handleSubDepartmentChange(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]">
                              {availableSubDepts.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Functional Role</label>
                            <select value={formData.functional_role || ""} onChange={(e) => handleChange("functional_role", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]">
                              {availableRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Seniority Level</label>
                            <select value={formData.seniority_level || "Mid-Level"} onChange={(e) => handleChange("seniority_level", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]">
                              <option value="Junior">Junior</option>
                              <option value="Mid-Level">Mid-Level</option>
                              <option value="Senior">Senior</option>
                              <option value="Lead">Lead</option>
                              <option value="Principal">Principal</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Specialization</label>
                            <select value={formData.specialization || ""} onChange={(e) => handleChange("specialization", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-[#00E5FF]">
                              {availableSpecs.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* === CLIENT CONFIG VIEW === */}
              {!managingPermissionsFor && activeTab === "client" && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">Client Identity & Contact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Full Name</label>
                        {isCreating ? (
                          <input type="text" required value={formData.full_name || ""} onChange={e => handleChange("full_name", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-purple-500" />
                        ) : (
                          <div className="text-zinc-300 font-bold bg-[#111] px-3 py-2 border border-zinc-800 rounded">{editingEntity?.full_name}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Email Address</label>
                        {isCreating ? (
                          <input type="email" required value={formData.email || ""} onChange={e => handleChange("email", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-purple-500" />
                        ) : (
                          <div className="text-zinc-400 bg-[#111] px-3 py-2 border border-zinc-800 rounded truncate">{editingEntity?.email}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Organization <span className="lowercase text-zinc-600">(optional)</span></label>
                        <input type="text" value={formData.organization || ""} onChange={e => handleChange("organization", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-purple-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Contact No.</label>
                        <input type="text" value={formData.contact_no || ""} onChange={e => handleChange("contact_no", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-purple-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Department Associated</label>
                        <select value={formData.department || "IT_SAAS"} onChange={(e) => handleDepartmentChange(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-purple-500">
                          {MOCK_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Sub-Department</label>
                        <select value={formData.sub_department || ""} onChange={(e) => handleSubDepartmentChange(e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-purple-500">
                          {availableSubDepts.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1 flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> Client Access Level
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Client Role</label>
                        <select value={formData.client_role || "Standard Client"} onChange={(e) => handleChange("client_role", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-purple-500">
                          <option value="VIP Client">VIP Client</option>
                          <option value="Standard Client">Standard Client</option>
                          <option value="Observer">Observer</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Project Association</label>
                        <select value={formData.project_associated || ""} onChange={(e) => handleChange("project_associated", e.target.value)} className="w-full bg-[#111] border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-purple-500">
                          <option value="">-- NO PROJECT --</option>
                          {(projects || []).map(proj => (
                            <option key={proj.project_id} value={proj.project_id}>{proj.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Shared Security & Lifecycle - ONLY VISIBLE WHEN EDITING (Not in Permission Manager) */}
              {!isCreating && !managingPermissionsFor && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1">Lifecycle & Security</h3>
                  
                  <div className="flex items-center justify-between p-3 border border-red-900/30 bg-red-950/10 rounded">
                    <div>
                      <div className="font-bold text-[#ff1744] uppercase tracking-widest">Block Access</div>
                      <div className="text-[9px] text-zinc-500">Instantly revoke login capabilities. Session terminates.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.isBlocked} onChange={(e) => handleChange("isBlocked", e.target.checked)} />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff1744]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-red-900/30 bg-red-950/10 rounded">
                    <div>
                      <div className="font-bold text-red-500 uppercase tracking-widest">Delete Record</div>
                      <div className="text-[9px] text-zinc-500">Permanently wipe metadata from network.</div>
                    </div>
                    <button type="button" onClick={handleDelete} className="bg-red-500/20 hover:bg-red-500/40 text-red-500 px-3 py-1.5 rounded flex items-center space-x-1 transition-colors">
                      <Trash2 className="w-3 h-3" />
                      <span>Purge</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Area */}
              <div className="pt-4 pb-2 sticky bottom-0 bg-[#0a0a0c] border-t border-zinc-800/80 mt-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded transition-all uppercase tracking-widest font-bold disabled:opacity-50 ${
                    managingPermissionsFor ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20' : (activeTab === 'internal' ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/20' : 'bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20')
                  }`}
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Injecting Configuration...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{managingPermissionsFor ? "Update Permissions" : (isCreating ? (activeTab === 'internal' ? "Provision Operator" : "Provision Client") : "Update Record")}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
