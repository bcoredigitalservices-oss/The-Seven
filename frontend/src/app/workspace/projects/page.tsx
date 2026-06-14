"use client";

import React, { useState, useEffect } from "react";
import { useSevenStore } from "@/store/useSevenStore";
import { FolderKanban, Users, Calendar, ChevronRight } from "lucide-react";
import ProjectDashboardView from "@/components/workspace/ProjectDashboardView";

export default function ProjectsPage() {
  const { userProfile, simulatedUser } = useSevenStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDashboardProject, setSelectedDashboardProject] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("seven_token");
      const projUrl = simulatedUser 
        ? `/api/projects?simulate_user_id=${simulatedUser.user_id}`
        : "/api/projects";
      const groupUrl = simulatedUser 
        ? `/api/groups?simulate_user_id=${simulatedUser.user_id}`
        : "/api/groups";

      try {
        const [projRes, groupRes] = await Promise.all([
          fetch(projUrl, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(groupUrl, { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData);
        }
        if (groupRes.ok) {
          const groupData = await groupRes.json();
          setGroups(groupData);
        }
      } catch (err) {
        console.error("Failed to load projects/groups", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [simulatedUser]);

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-[10px] font-mono text-[#00E5FF] tracking-[0.2em] uppercase">TEAM WORKSPACE</p>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1">SQUADS & PROJECTS</h1>
        </div>
        <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/80 text-[10px] font-mono flex items-center space-x-1.5">
          <FolderKanban className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="text-zinc-400">ACTIVE REGISTRIES:</span>
          <span className="text-emerald-400 font-bold">{projects.length} PROJECTS</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center font-mono text-zinc-550 animate-pulse">
          Retrieving organizational matrix...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1">
          
          {/* Active Projects */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-xs font-bold font-mono tracking-[0.15em] text-white uppercase flex items-center space-x-2">
                <FolderKanban className="w-4 h-4 text-[#00E5FF]" />
                <span>PROJECTS IN PROGRESS</span>
              </h2>
              <span className="text-[10px] font-mono text-zinc-550">TOTAL: {projects.length}</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
              {projects.length === 0 ? (
                <div className="text-center py-12 text-xs font-mono text-zinc-650">No tracked projects found.</div>
              ) : (
                projects.map((proj) => (
                  <div 
                    key={proj.project_id}
                    onClick={() => setSelectedDashboardProject(proj)}
                    className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-lg hover:border-[#00E5FF]/40 cursor-pointer hover:bg-zinc-950 transition-colors flex items-start justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(0,229,255,0.4)]" />
                        <h3 className="text-sm font-bold text-white font-mono group-hover:text-[#00E5FF] transition-colors">{proj.title}</h3>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono leading-relaxed max-w-md">
                        {proj.description || "No project overview provided by lead."}
                      </p>
                      <div className="flex items-center space-x-3 text-[10px] font-mono text-zinc-550">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-[#00E5FF]">
                          STATUS: {proj.status}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          LAUNCHED: {new Date(proj.created_at || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 mt-1 group-hover:text-[#00E5FF] transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Squads / Groups */}
          <div className="bg-[#0e0e0e]/90 border border-zinc-800/80 rounded-xl p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-xs font-bold font-mono tracking-[0.15em] text-white uppercase flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#00E5FF]" />
                <span>SQUAD GROUPS</span>
              </h2>
              <span className="text-[10px] font-mono text-zinc-550">TOTAL: {groups.length}</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
              {groups.length === 0 ? (
                <div className="text-center py-12 text-xs font-mono text-zinc-650">No squad groups found.</div>
              ) : (
                groups.map((group) => (
                  <div 
                    key={group.group_id}
                    className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors flex items-start justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded bg-cyan-950/20 border border-cyan-800/40 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                          SG
                        </div>
                        <h3 className="text-sm font-bold text-white font-mono">{group.name}</h3>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                        {group.description || "Active collaboration squad channel."}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-550">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400">
                          DEPT TARGET: {group.department_id || "ALL STAFF"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 mt-1" />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
      {selectedDashboardProject && (
        <ProjectDashboardView 
          project={selectedDashboardProject} 
          onClose={() => setSelectedDashboardProject(null)} 
        />
      )}
    </div>
  );
}
